#!/bin/bash
# ================================
# Setup Script for WAF
# ================================
# Este script prepara el entorno para el WAF de BookWorm

set -e

echo "🛡️  BookWorm WAF Setup Script"
echo "================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "Este script debe ejecutarse desde el directorio Frontend/"
    exit 1
fi

print_info "Verificando prerequisitos..."

# 2. Verificar Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instalar Docker primero."
    exit 1
fi
print_info "✓ Docker instalado"

# 3. Verificar Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está instalado."
    exit 1
fi
print_info "✓ Docker Compose instalado"

# 4. Crear directorios de logs si no existen
print_info "Creando directorios de logs..."
mkdir -p logs/nginx logs/modsec
chmod 755 logs logs/nginx logs/modsec
print_info "✓ Directorios de logs creados"

# 5. Verificar certificados SSL
print_info "Verificando certificados SSL..."
if [ ! -f "ssl/nginx-selfsigned.crt" ] || [ ! -f "ssl/nginx-selfsigned.key" ]; then
    print_warning "Certificados SSL no encontrados. Generando certificados autofirmados..."
    mkdir -p ssl

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/nginx-selfsigned.key \
        -out ssl/nginx-selfsigned.crt \
        -subj "/C=US/ST=State/L=City/O=BookWorm/CN=localhost" \
        2>/dev/null

    chmod 644 ssl/nginx-selfsigned.crt
    chmod 600 ssl/nginx-selfsigned.key
    print_info "✓ Certificados SSL generados"
else
    print_info "✓ Certificados SSL encontrados"
fi

# 6. Verificar redes Docker
print_info "Verificando redes Docker..."

if ! docker network inspect dmz_network >/dev/null 2>&1; then
    print_warning "Red dmz_network no encontrada. Creando..."
    docker network create --driver bridge --subnet 172.20.0.0/24 dmz_network
    print_info "✓ Red dmz_network creada"
else
    print_info "✓ Red dmz_network existe"
fi

if ! docker network inspect backend_network >/dev/null 2>&1; then
    print_warning "Red backend_network no encontrada. Creando..."
    docker network create --driver bridge --subnet 172.21.0.0/24 backend_network
    print_info "✓ Red backend_network creada"
else
    print_info "✓ Red backend_network existe"
fi

# 7. Descargar unicode.mapping para ModSecurity si no existe
print_info "Verificando archivo unicode.mapping..."
if [ ! -f "modsec/unicode.mapping" ]; then
    print_info "Descargando unicode.mapping..."
    mkdir -p modsec
    wget -q -O modsec/unicode.mapping \
        https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/unicode.mapping
    print_info "✓ unicode.mapping descargado"
else
    print_info "✓ unicode.mapping existe"
fi

# 8. Verificar archivos de configuración
print_info "Verificando archivos de configuración..."

required_files=(
    "Dockerfile.nginx"
    "nginx-waf.conf"
    "modsec/modsecurity.conf"
    "modsec/blacklist-user-agents.txt"
    "modsec/blacklist-ips.txt"
    "modsec/custom-rules/bookworm-rules.conf"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Archivo faltante: $file"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -gt 0 ]; then
    print_error "Faltan $missing_files archivos de configuración. Por favor verificar."
    exit 1
fi
print_info "✓ Todos los archivos de configuración presentes"

# 9. Construir imagen de Nginx con ModSecurity
print_info "Construyendo imagen de Nginx con ModSecurity WAF..."
print_warning "Esto puede tomar varios minutos la primera vez..."

if docker build -f Dockerfile.nginx -t bookworm-nginx-waf:latest . ; then
    print_info "✓ Imagen construida exitosamente"
else
    print_error "Error construyendo la imagen de Nginx WAF"
    exit 1
fi

# 10. Resumen final
echo ""
echo "================================"
print_info "🎉 Setup completado exitosamente!"
echo "================================"
echo ""
echo "Para iniciar el WAF, ejecuta:"
echo "  docker-compose -f docker-compose-waf.yml up -d"
echo ""
echo "Para ver los logs del WAF:"
echo "  docker-compose -f docker-compose-waf.yml logs -f nginx_waf"
echo ""
echo "Para ver logs de ModSecurity:"
echo "  tail -f logs/modsec/audit.log"
echo ""
echo "Para verificar el estado del WAF:"
echo "  curl -k https://localhost/waf-status"
echo ""
echo "Endpoints disponibles:"
echo "  - https://localhost/        (Frontend)"
echo "  - https://localhost/graphql (GraphQL API)"
echo "  - https://localhost/health  (Health check)"
echo ""
print_warning "NOTA: Los certificados SSL son autofirmados. Para producción,"
print_warning "      reemplazar con certificados válidos (Let's Encrypt, etc.)"
echo ""
