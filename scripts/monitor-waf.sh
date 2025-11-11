#!/bin/bash
# ================================
# WAF Monitoring Script
# ================================
# Monitoreo en tiempo real del WAF de BookWorm

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para mostrar el menú
show_menu() {
    clear
    print_header "BookWorm WAF Monitor"
    echo ""
    echo "1) Ver estadísticas en tiempo real"
    echo "2) Ver últimas peticiones bloqueadas"
    echo "3) Ver top IPs bloqueadas"
    echo "4) Ver ataques por tipo"
    echo "5) Ver logs de audit en vivo"
    echo "6) Ver logs de debug"
    echo "7) Ver estado del contenedor"
    echo "8) Ver métricas de Nginx"
    echo "9) Limpiar logs antiguos"
    echo "0) Salir"
    echo ""
    read -p "Selecciona una opción: " choice
}

# Función para verificar si los logs existen
check_logs() {
    if [ ! -d "logs/modsec" ] || [ ! -d "logs/nginx" ]; then
        print_error "Directorios de logs no encontrados. Ejecuta setup-waf.sh primero."
        exit 1
    fi
}

# 1. Estadísticas en tiempo real
show_realtime_stats() {
    print_header "Estadísticas en Tiempo Real"

    if [ ! -f "logs/modsec/audit.log" ]; then
        print_warning "No hay logs de audit disponibles aún."
        return
    fi

    echo ""
    print_info "Total de eventos registrados:"
    grep -c "ModSecurity:" logs/modsec/audit.log 2>/dev/null || echo "0"

    echo ""
    print_info "Eventos en la última hora:"
    find logs/modsec/audit.log -mmin -60 -exec grep -c "ModSecurity:" {} \; 2>/dev/null || echo "0"

    echo ""
    print_info "Peticiones bloqueadas hoy:"
    grep "$(date +%d/%b/%Y)" logs/nginx/access.log 2>/dev/null | grep -c " 403 " || echo "0"

    echo ""
    read -p "Presiona Enter para continuar..."
}

# 2. Últimas peticiones bloqueadas
show_blocked_requests() {
    print_header "Últimas 20 Peticiones Bloqueadas"

    if [ ! -f "logs/nginx/access.log" ]; then
        print_warning "No hay logs de acceso disponibles."
        return
    fi

    echo ""
    grep " 403 " logs/nginx/access.log | tail -20 | while read line; do
        ip=$(echo "$line" | awk '{print $1}')
        time=$(echo "$line" | awk '{print $4}' | tr -d '[')
        method=$(echo "$line" | awk '{print $6}' | tr -d '"')
        uri=$(echo "$line" | awk '{print $7}')

        echo -e "${RED}BLOCKED${NC} - IP: ${YELLOW}$ip${NC} - Time: $time"
        echo -e "         Request: ${BLUE}$method $uri${NC}"
        echo ""
    done

    echo ""
    read -p "Presiona Enter para continuar..."
}

# 3. Top IPs bloqueadas
show_top_blocked_ips() {
    print_header "Top 10 IPs Bloqueadas"

    if [ ! -f "logs/nginx/access.log" ]; then
        print_warning "No hay logs de acceso disponibles."
        return
    fi

    echo ""
    grep " 403 " logs/nginx/access.log | \
        awk '{print $1}' | \
        sort | uniq -c | \
        sort -rn | \
        head -10 | \
        while read count ip; do
            echo -e "${RED}$count${NC} peticiones bloqueadas desde ${YELLOW}$ip${NC}"
        done

    echo ""
    read -p "Presiona Enter para continuar..."
}

# 4. Ataques por tipo
show_attacks_by_type() {
    print_header "Tipos de Ataques Detectados"

    if [ ! -f "logs/modsec/audit.log" ]; then
        print_warning "No hay logs de ModSecurity disponibles."
        return
    fi

    echo ""
    print_info "SQL Injection:"
    grep -i "sql injection" logs/modsec/audit.log 2>/dev/null | wc -l

    print_info "XSS (Cross-Site Scripting):"
    grep -i "xss" logs/modsec/audit.log 2>/dev/null | wc -l

    print_info "Path Traversal:"
    grep -i "path traversal" logs/modsec/audit.log 2>/dev/null | wc -l

    print_info "Command Injection:"
    grep -i "command injection" logs/modsec/audit.log 2>/dev/null | wc -l

    print_info "Rate Limit Exceeded:"
    grep -i "rate limit" logs/modsec/audit.log 2>/dev/null | wc -l

    print_info "Suspicious User Agent:"
    grep -i "suspicious user agent" logs/modsec/audit.log 2>/dev/null | wc -l

    echo ""
    read -p "Presiona Enter para continuar..."
}

# 5. Logs de audit en vivo
show_live_audit_logs() {
    print_header "Logs de Audit en Vivo (Ctrl+C para salir)"
    echo ""

    if [ ! -f "logs/modsec/audit.log" ]; then
        print_warning "No hay logs de audit disponibles. Iniciando..."
        touch logs/modsec/audit.log
    fi

    tail -f logs/modsec/audit.log | while read line; do
        if echo "$line" | grep -q "ModSecurity:"; then
            echo -e "${RED}[MODSEC]${NC} $line"
        else
            echo "$line"
        fi
    done
}

# 6. Logs de debug
show_debug_logs() {
    print_header "Últimos 50 Logs de Debug"
    echo ""

    if [ ! -f "logs/modsec/debug.log" ]; then
        print_warning "No hay logs de debug disponibles."
        read -p "Presiona Enter para continuar..."
        return
    fi

    tail -50 logs/modsec/debug.log

    echo ""
    read -p "Presiona Enter para continuar..."
}

# 7. Estado del contenedor
show_container_status() {
    print_header "Estado del Contenedor WAF"
    echo ""

    if ! docker ps | grep -q "bookworm_nginx_waf"; then
        print_error "El contenedor WAF no está en ejecución."
        echo ""
        print_info "Para iniciar el WAF, ejecuta:"
        echo "  docker-compose -f docker-compose-waf.yml up -d"
    else
        print_info "Contenedor en ejecución:"
        docker ps | grep "bookworm_nginx_waf"

        echo ""
        print_info "Uso de recursos:"
        docker stats --no-stream bookworm_nginx_waf

        echo ""
        print_info "Health check:"
        docker inspect bookworm_nginx_waf | grep -A 5 "Health"
    fi

    echo ""
    read -p "Presiona Enter para continuar..."
}

# 8. Métricas de Nginx
show_nginx_metrics() {
    print_header "Métricas de Nginx"
    echo ""

    if ! docker ps | grep -q "bookworm_nginx_waf"; then
        print_error "El contenedor WAF no está en ejecución."
    else
        print_info "Consultando métricas internas..."
        docker exec bookworm_nginx_waf curl -s http://localhost/nginx_status || \
            print_warning "Endpoint de métricas no disponible"
    fi

    echo ""
    read -p "Presiona Enter para continuar..."
}

# 9. Limpiar logs antiguos
clean_old_logs() {
    print_header "Limpiar Logs Antiguos"
    echo ""

    read -p "¿Eliminar logs con más de cuántos días? [7]: " days
    days=${days:-7}

    print_info "Buscando logs con más de $days días..."

    old_files=$(find logs/ -type f -mtime +$days -name "*.log" 2>/dev/null)

    if [ -z "$old_files" ]; then
        print_info "No se encontraron logs antiguos."
    else
        echo "$old_files"
        echo ""
        read -p "¿Confirmar eliminación? (s/N): " confirm

        if [[ "$confirm" =~ ^[sS]$ ]]; then
            find logs/ -type f -mtime +$days -name "*.log" -delete
            print_info "Logs antiguos eliminados."
        else
            print_info "Operación cancelada."
        fi
    fi

    echo ""
    read -p "Presiona Enter para continuar..."
}

# Main loop
check_logs

while true; do
    show_menu

    case $choice in
        1) show_realtime_stats ;;
        2) show_blocked_requests ;;
        3) show_top_blocked_ips ;;
        4) show_attacks_by_type ;;
        5) show_live_audit_logs ;;
        6) show_debug_logs ;;
        7) show_container_status ;;
        8) show_nginx_metrics ;;
        9) clean_old_logs ;;
        0)
            print_info "Saliendo..."
            exit 0
            ;;
        *)
            print_error "Opción inválida"
            sleep 2
            ;;
    esac
done
