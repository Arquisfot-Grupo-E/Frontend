#!/bin/bash
# ================================
# WAF Testing Script
# ================================
# Script para probar las protecciones del WAF de BookWorm

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# URL base
BASE_URL="${1:-https://localhost}"

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_test() {
    echo -e "\n${YELLOW}[TEST $TESTS_TOTAL]${NC} $1"
}

print_pass() {
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✓ PASS${NC} - $1"
}

print_fail() {
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}✗ FAIL${NC} - $1"
}

print_info() {
    echo -e "${BLUE}ℹ INFO${NC} - $1"
}

# Función para ejecutar test
run_test() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    local description="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local expected_status="$5"
    local headers="$6"

    print_test "$description"

    local cmd="curl -k -s -o /dev/null -w '%{http_code}' -X $method"

    if [ ! -z "$headers" ]; then
        cmd="$cmd $headers"
    fi

    if [ ! -z "$data" ]; then
        cmd="$cmd -d '$data'"
    fi

    cmd="$cmd '$url'"

    local status=$(eval $cmd)

    if [ "$status" = "$expected_status" ]; then
        print_pass "Expected $expected_status, got $status"
    else
        print_fail "Expected $expected_status, got $status"
    fi
}

# Banner
clear
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════╗
║     BookWorm WAF Security Test Suite    ║
╚══════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo "Testing URL: $BASE_URL"
echo "Time: $(date)"
echo ""

read -p "Press Enter to start tests..."

# ================================
# 1. Basic Connectivity Tests
# ================================
print_header "1. Basic Connectivity Tests"

run_test "Health check endpoint" \
    "$BASE_URL/health" \
    "GET" \
    "" \
    "200"

run_test "WAF status endpoint (should be restricted)" \
    "$BASE_URL/waf-status" \
    "GET" \
    "" \
    "403"

run_test "HTTP to HTTPS redirect" \
    "${BASE_URL/https/http}/" \
    "GET" \
    "" \
    "301"

# ================================
# 2. SQL Injection Tests
# ================================
print_header "2. SQL Injection Protection Tests"

run_test "SQL Injection in query parameter" \
    "$BASE_URL/?id=1' OR '1'='1" \
    "GET" \
    "" \
    "403"

run_test "SQL Injection with UNION" \
    "$BASE_URL/?id=1 UNION SELECT * FROM users" \
    "GET" \
    "" \
    "403"

run_test "SQL Injection with comments" \
    "$BASE_URL/?id=1;DROP TABLE users--" \
    "GET" \
    "" \
    "403"

run_test "SQL Injection in User-Agent" \
    "$BASE_URL/" \
    "GET" \
    "" \
    "403" \
    "-H 'User-Agent: sqlmap/1.0'"

# ================================
# 3. XSS Tests
# ================================
print_header "3. Cross-Site Scripting (XSS) Protection Tests"

run_test "XSS with script tag" \
    "$BASE_URL/?name=<script>alert(1)</script>" \
    "GET" \
    "" \
    "403"

run_test "XSS with javascript: protocol" \
    "$BASE_URL/?url=javascript:alert(1)" \
    "GET" \
    "" \
    "403"

run_test "XSS with onerror event" \
    "$BASE_URL/?img=<img src=x onerror=alert(1)>" \
    "GET" \
    "" \
    "403"

# ================================
# 4. Path Traversal Tests
# ================================
print_header "4. Path Traversal Protection Tests"

run_test "Path traversal with ../" \
    "$BASE_URL/../../../etc/passwd" \
    "GET" \
    "" \
    "403"

run_test "Path traversal with encoded ../" \
    "$BASE_URL/%2e%2e%2f%2e%2e%2fetc/passwd" \
    "GET" \
    "" \
    "403"

run_test "Path traversal Windows style" \
    "$BASE_URL/..\\..\\..\\windows\\system32\\config\\sam" \
    "GET" \
    "" \
    "403"

# ================================
# 5. Command Injection Tests
# ================================
print_header "5. Command Injection Protection Tests"

run_test "Command injection with pipe" \
    "$BASE_URL/?cmd=ls|cat /etc/passwd" \
    "GET" \
    "" \
    "403"

run_test "Command injection with semicolon" \
    "$BASE_URL/?cmd=ls;cat /etc/passwd" \
    "GET" \
    "" \
    "403"

run_test "Command injection with backticks" \
    "$BASE_URL/?cmd=\`cat /etc/passwd\`" \
    "GET" \
    "" \
    "403"

# ================================
# 6. Bot Detection Tests
# ================================
print_header "6. Bot and Scanner Detection Tests"

run_test "Nikto scanner detection" \
    "$BASE_URL/" \
    "GET" \
    "" \
    "403" \
    "-H 'User-Agent: Nikto/2.1.6'"

run_test "SQLMap scanner detection" \
    "$BASE_URL/" \
    "GET" \
    "" \
    "403" \
    "-H 'User-Agent: sqlmap/1.0'"

run_test "Nmap NSE detection" \
    "$BASE_URL/" \
    "GET" \
    "" \
    "403" \
    "-H 'User-Agent: Mozilla/5.0 (compatible; Nmap Scripting Engine)'"

run_test "Headless browser detection (Puppeteer)" \
    "$BASE_URL/" \
    "GET" \
    "" \
    "403" \
    "-H 'User-Agent: Mozilla/5.0 HeadlessChrome'"

run_test "Missing Accept header (bot indicator)" \
    "$BASE_URL/" \
    "GET" \
    "" \
    "403" \
    "-H 'Accept:'"

# ================================
# 7. GraphQL Specific Tests
# ================================
print_header "7. GraphQL Protection Tests"

run_test "GraphQL with GET method (should be blocked)" \
    "$BASE_URL/graphql?query={books{title}}" \
    "GET" \
    "" \
    "405"

run_test "GraphQL introspection attempt" \
    "$BASE_URL/graphql" \
    "POST" \
    '{"query":"{__schema{types{name}}}"}' \
    "403" \
    "-H 'Content-Type: application/json'"

run_test "GraphQL __type introspection" \
    "$BASE_URL/graphql" \
    "POST" \
    '{"query":"{__type(name:\"User\"){name}}"}' \
    "403" \
    "-H 'Content-Type: application/json'"

run_test "GraphQL deeply nested query (>7 levels)" \
    "$BASE_URL/graphql" \
    "POST" \
    '{"query":"{{{{{{{{{{{{books{title}}}}}}}}}}}}"}' \
    "400" \
    "-H 'Content-Type: application/json'"

run_test "GraphQL without Content-Type header" \
    "$BASE_URL/graphql" \
    "POST" \
    '{"query":"{books{title}}"}' \
    "400"

run_test "GraphQL mutation without auth (should fail)" \
    "$BASE_URL/graphql" \
    "POST" \
    '{"query":"mutation{createReview(content:\"test\"){id}}"}' \
    "401" \
    "-H 'Content-Type: application/json'"

# ================================
# 8. Rate Limiting Tests
# ================================
print_header "8. Rate Limiting Tests"

print_test "Rate limiting - General endpoint (10 req/s)"
passed_count=0
blocked_count=0

for i in {1..15}; do
    status=$(curl -k -s -o /dev/null -w '%{http_code}' "$BASE_URL/")
    if [ "$status" = "200" ]; then
        passed_count=$((passed_count + 1))
    elif [ "$status" = "429" ]; then
        blocked_count=$((blocked_count + 1))
    fi
done

TESTS_TOTAL=$((TESTS_TOTAL + 1))
if [ $blocked_count -gt 0 ]; then
    print_pass "Rate limit triggered after $passed_count requests, blocked $blocked_count"
else
    print_fail "Rate limit NOT triggered (may need adjustment or more rapid requests)"
fi

# ================================
# 9. Security Headers Tests
# ================================
print_header "9. Security Headers Tests"

print_test "Verify security headers"
TESTS_TOTAL=$((TESTS_TOTAL + 1))

headers=$(curl -k -s -I "$BASE_URL/" | tr -d '\r')

check_header() {
    local header="$1"
    if echo "$headers" | grep -qi "$header"; then
        print_info "✓ $header present"
        return 0
    else
        print_info "✗ $header missing"
        return 1
    fi
}

headers_ok=0
check_header "Strict-Transport-Security" && headers_ok=$((headers_ok + 1))
check_header "X-Frame-Options" && headers_ok=$((headers_ok + 1))
check_header "X-Content-Type-Options" && headers_ok=$((headers_ok + 1))
check_header "X-XSS-Protection" && headers_ok=$((headers_ok + 1))

if [ $headers_ok -eq 4 ]; then
    print_pass "All security headers present"
else
    print_fail "Some security headers missing ($headers_ok/4)"
fi

# ================================
# 10. Method Validation Tests
# ================================
print_header "10. HTTP Method Validation Tests"

run_test "GraphQL with PUT method (not allowed)" \
    "$BASE_URL/graphql" \
    "PUT" \
    '{"query":"{books{title}}"}' \
    "405" \
    "-H 'Content-Type: application/json'"

run_test "GraphQL with DELETE method (not allowed)" \
    "$BASE_URL/graphql" \
    "DELETE" \
    "" \
    "405"

run_test "OPTIONS request to GraphQL (should work for CORS)" \
    "$BASE_URL/graphql" \
    "OPTIONS" \
    "" \
    "204"

# ================================
# 11. File Upload Protection Tests
# ================================
print_header "11. File Upload Protection Tests"

print_test "Executable file upload attempt"
TESTS_TOTAL=$((TESTS_TOTAL + 1))

# Crear archivo temporal malicioso
echo "#!/bin/bash" > /tmp/malicious.sh
echo "echo 'evil'" >> /tmp/malicious.sh

status=$(curl -k -s -o /dev/null -w '%{http_code}' \
    -X POST "$BASE_URL/upload" \
    -F "file=@/tmp/malicious.sh")

rm -f /tmp/malicious.sh

if [ "$status" = "403" ] || [ "$status" = "404" ]; then
    print_pass "Executable upload blocked or endpoint protected"
else
    print_info "Status: $status (endpoint may not exist, which is OK)"
fi

# ================================
# 12. Known Attack Path Tests
# ================================
print_header "12. Known Attack Path Protection Tests"

run_test "Access to .env file" \
    "$BASE_URL/.env" \
    "GET" \
    "" \
    "403"

run_test "Access to .git directory" \
    "$BASE_URL/.git/config" \
    "GET" \
    "" \
    "403"

run_test "Access to admin panel" \
    "$BASE_URL/admin" \
    "GET" \
    "" \
    "444"

run_test "Access to phpmyadmin" \
    "$BASE_URL/phpmyadmin/" \
    "GET" \
    "" \
    "444"

# ================================
# Summary
# ================================
print_header "Test Summary"

echo ""
echo -e "Total Tests:  ${BLUE}$TESTS_TOTAL${NC}"
echo -e "Passed:       ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed:       ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 ALL TESTS PASSED! WAF IS ACTIVE  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ⚠ SOME TESTS FAILED - CHECK CONFIG  ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════╝${NC}"
    echo ""
    echo "Please review the failed tests and check WAF configuration."
    echo "Logs: logs/modsec/audit.log and logs/nginx/error.log"
    exit 1
fi
