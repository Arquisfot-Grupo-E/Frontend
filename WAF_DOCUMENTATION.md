# WAF (Web Application Firewall) - BookWorm Frontend

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Características de Seguridad](#características-de-seguridad)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Reglas de Seguridad](#reglas-de-seguridad)
6. [Monitoreo y Logging](#monitoreo-y-logging)
7. [Mantenimiento](#mantenimiento)
8. [Troubleshooting](#troubleshooting)
9. [Referencias](#referencias)

---

## Introducción

El WAF (Web Application Firewall) de BookWorm está implementado usando **ModSecurity 3** integrado con **Nginx**, proporcionando protección de nivel empresarial contra ataques web comunes y amenazas de seguridad.

### ¿Por qué un WAF?

Un WAF protege las aplicaciones web filtrando y monitoreando el tráfico HTTP/HTTPS entre la aplicación y el internet. Proporciona defensa contra:

- **OWASP Top 10**: SQL Injection, XSS, CSRF, etc.
- **Ataques de fuerza bruta**: Rate limiting y bloqueo de intentos repetidos
- **Bots maliciosos**: Detección y bloqueo de scrapers y scanners
- **DDoS de capa 7**: Protección contra ataques a nivel de aplicación
- **Exfiltración de datos**: Prevención de fugas de información sensible

### Componentes

- **ModSecurity 3.0.12**: Motor WAF de código abierto
- **OWASP Core Rule Set (CRS) 4.0**: Conjunto de reglas estandarizado
- **Nginx con módulo ModSecurity**: Reverse proxy con capacidades WAF
- **Reglas personalizadas**: Específicas para BookWorm y GraphQL

---

## Arquitectura

```
Internet
   ↓
[Puerto 443 - HTTPS]
   ↓
┌─────────────────────────┐
│   Nginx + ModSecurity   │ ← WAF Layer (DMZ Network)
│   - TLS Termination     │
│   - Rate Limiting       │
│   - ModSecurity Rules   │
└─────────────────────────┘
   ↓                    ↓
[Frontend:5173]    [Gateway:4000]
   ↓                    ↓
React App           GraphQL API
(DMZ Network)       (DMZ + Backend)
```

### Flujo de Peticiones

1. **Cliente** → Petición HTTPS al puerto 443
2. **Nginx** → Termina SSL/TLS
3. **ModSecurity** → Analiza la petición contra reglas
   - ✅ Petición legítima → Proxy a frontend/gateway
   - ❌ Petición maliciosa → Bloquea y registra (403/429)
4. **Backend** → Procesa petición si es válida
5. **ModSecurity** → Analiza respuesta (opcional)
6. **Cliente** ← Recibe respuesta

---

## Características de Seguridad

### 1. Protección OWASP Top 10

| Amenaza | Protección Implementada |
|---------|------------------------|
| SQL Injection | ✅ Reglas OWASP CRS + Custom |
| XSS (Cross-Site Scripting) | ✅ Filtrado de scripts maliciosos |
| CSRF | ✅ Validación de Origin/Referer |
| Path Traversal | ✅ Bloqueo de `../` en URLs |
| Command Injection | ✅ Detección de caracteres peligrosos |
| XXE (XML External Entity) | ✅ Reglas OWASP CRS |
| Insecure Deserialization | ✅ Reglas OWASP CRS |
| Security Misconfiguration | ✅ Headers de seguridad |
| Sensitive Data Exposure | ✅ HTTPS obligatorio, headers seguros |
| Insufficient Logging | ✅ Audit logs completos |

### 2. Protección GraphQL Específica

- **Introspection Blocking**: Bloquea queries de `__schema` y `__type`
- **Query Depth Limiting**: Previene queries anidadas excesivamente (max 7 niveles)
- **Batch Query Limiting**: Máximo 10 operaciones por request
- **Mutation Authentication**: Requiere JWT para mutaciones (excepto login/register)
- **Rate Limiting por Operación**:
  - Login: 5 intentos/minuto
  - Register: 3 intentos/hora
  - Mutations generales: 30/segundo

### 3. Rate Limiting

```nginx
# Rate limiting zones configuradas
zone=general:10m rate=10r/s     # Peticiones generales
zone=login:10m rate=5r/m         # Intentos de login
zone=api:10m rate=30r/s          # API/GraphQL
limit_conn addr 10               # Max 10 conexiones simultáneas por IP
```

### 4. Seguridad de Transporte (TLS/SSL)

- **Protocolos**: TLSv1.2, TLSv1.3
- **Ciphers**: Solo ciphers modernos y seguros
- **HSTS**: `max-age=31536000` (1 año)
- **OCSP Stapling**: Activado
- **HTTP/2**: Habilitado para mejor rendimiento

### 5. Headers de Seguridad

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### 6. Anti-Bot y Anti-Scraping

- **User-Agent Blacklist**: Bloquea scanners conocidos (nikto, sqlmap, etc.)
- **Headless Browser Detection**: Detecta Puppeteer, Selenium, PhantomJS
- **Missing Headers Detection**: Peticiones sin Accept o Accept-Language
- **Behavioral Analysis**: Anomaly scoring para detectar patrones sospechosos

### 7. Validación de Contenido

- **Content-Type Validation**: Requiere Content-Type correcto para GraphQL
- **Body Size Limits**: Máximo 20MB por request
- **HTML Tag Blocking**: No permite HTML en contenido de reviews
- **Email Format Validation**: Valida formato en registros
- **File Upload Protection**:
  - Máximo 5MB para avatares
  - Bloquea archivos ejecutables (.exe, .sh, .php, etc.)

---

## Instalación y Configuración

### Prerequisitos

- Docker >= 20.10
- Docker Compose >= 2.0
- 2GB RAM libre (mínimo)
- Puertos 80 y 443 disponibles

### Paso 1: Preparación del Entorno

```bash
# Navegar al directorio del frontend
cd front/Frontend

# Ejecutar script de setup (recomendado)
bash scripts/setup-waf.sh
```

El script automatiza:
- Creación de directorios de logs
- Generación de certificados SSL autofirmados
- Creación de redes Docker (dmz_network, backend_network)
- Descarga de archivos necesarios (unicode.mapping)
- Construcción de la imagen Docker con ModSecurity

### Paso 2: Configuración Manual (Alternativa)

Si prefieres configurar manualmente:

```bash
# 1. Crear directorios
mkdir -p logs/nginx logs/modsec

# 2. Generar certificados SSL (desarrollo)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/nginx-selfsigned.key \
  -out ssl/nginx-selfsigned.crt \
  -subj "/C=US/ST=State/L=City/O=BookWorm/CN=localhost"

# 3. Crear redes Docker
docker network create --driver bridge --subnet 172.20.0.0/24 dmz_network
docker network create --driver bridge --subnet 172.21.0.0/24 backend_network

# 4. Descargar unicode.mapping
wget -O modsec/unicode.mapping \
  https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/unicode.mapping

# 5. Construir imagen
docker build -f Dockerfile.nginx -t bookworm-nginx-waf:latest .
```

### Paso 3: Iniciar el WAF

```bash
# Iniciar servicios con WAF
docker-compose -f docker-compose-waf.yml up -d

# Verificar que todo está corriendo
docker-compose -f docker-compose-waf.yml ps

# Ver logs
docker-compose -f docker-compose-waf.yml logs -f nginx_waf
```

### Paso 4: Verificación

```bash
# Test de conectividad
curl -k https://localhost/health
# Esperado: "OK"

# Verificar estado del WAF
curl -k https://localhost/waf-status
# Esperado: {"waf":"enabled","status":"active","version":"modsecurity-3.0"}

# Test de bloqueo (SQL Injection)
curl -k "https://localhost/graphql?query=1' OR '1'='1"
# Esperado: 403 Forbidden
```

---

## Reglas de Seguridad

### Estructura de Reglas

```
/etc/nginx/modsec/
├── modsecurity.conf          # Configuración principal
├── unicode.mapping           # Mapeo de caracteres Unicode
├── owasp-crs/               # OWASP Core Rule Set
│   ├── crs-setup.conf
│   └── rules/*.conf
├── custom-rules/            # Reglas personalizadas
│   └── bookworm-rules.conf
├── blacklist-user-agents.txt
└── blacklist-ips.txt
```

### Reglas OWASP CRS (Core Rule Set)

El OWASP CRS proporciona ~150 reglas categorizadas:

- **REQUEST-901**: Inicialización
- **REQUEST-903**: Scanner y bot detection
- **REQUEST-911-912**: Method enforcement y protocol enforcement
- **REQUEST-913**: Scanner detection
- **REQUEST-920**: Protocol enforcement
- **REQUEST-921**: Protocol attack
- **REQUEST-930**: Application attack (LFI)
- **REQUEST-931**: Application attack (RFI)
- **REQUEST-932**: Application attack (RCE)
- **REQUEST-933**: Application attack (PHP)
- **REQUEST-941**: Application attack (XSS)
- **REQUEST-942**: Application attack (SQLi)
- **REQUEST-943**: Application attack (Session fixation)
- **RESPONSE-950-959**: Data leakages y errors

### Reglas Personalizadas BookWorm

Ubicación: `modsec/custom-rules/bookworm-rules.conf`

#### Autenticación y Sesión (ID 4001-4099)

```apache
# Validar JWT en peticiones autenticadas
SecRule REQUEST_HEADERS:Authorization "!@rx ^Bearer\s+[\w\-\.]+$" \
    "id:4001,phase:1,pass,log,msg:'Missing or invalid JWT token'"

# Detectar JWT sospechosos (muy cortos)
SecRule REQUEST_HEADERS:Authorization "@rx ^Bearer\s+.{1,20}$" \
    "id:4003,phase:1,deny,status:401,log,msg:'Suspicious JWT - too short'"
```

#### GraphQL Específico (ID 4010-4029)

```apache
# Solo POST para GraphQL
SecRule REQUEST_URI "@streq /graphql" \
    "id:4010,phase:1,deny,status:405,chain"
    SecRule REQUEST_METHOD "!@streq POST"

# Bloquear introspección
SecRule REQUEST_BODY "@rx (?i)(?:__type|__schema)" \
    "id:4017,phase:2,deny,status:403,log,msg:'GraphQL introspection blocked'"

# Limitar profundidad de queries
SecRule REQUEST_BODY "@rx (?:\{[^\}]*){11,}" \
    "id:4019,phase:2,deny,status:400,log,msg:'Query too deep'"
```

#### Rate Limiting Avanzado (ID 4030-4039)

```apache
# Rate limit login (5/minuto)
SecRule REQUEST_BODY "@rx (?i)mutation.*login" \
    "id:4031,phase:2,pass,setvar:ip.login_attempts=+1"
SecRule IP:LOGIN_ATTEMPTS "@gt 5" \
    "id:4032,phase:2,deny,status:429,log"

# Rate limit registro (3/hora)
SecRule REQUEST_BODY "@rx (?i)mutation.*register" \
    "id:4034,phase:2,pass,setvar:ip.register_attempts=+1"
SecRule IP:REGISTER_ATTEMPTS "@gt 3" \
    "id:4035,phase:2,deny,status:429,log"
```

### Niveles de Paranoia

ModSecurity usa "Paranoia Levels" (1-4) para controlar la agresividad:

- **Level 1** (Default): Balance entre seguridad y falsos positivos
- **Level 2**: Más estricto, puede bloquear apps legítimas
- **Level 3**: Muy estricto, requiere tuning extensivo
- **Level 4**: Máxima seguridad, alto riesgo de falsos positivos

Configurar en `modsec/modsecurity.conf`:
```apache
SecAction "id:900000,phase:1,pass,nolog,setvar:tx.paranoia_level=2"
```

### Anomaly Scoring

ModSecurity usa un sistema de puntuación:

- Cada regla suma puntos al "anomaly score"
- Si el score supera el umbral → Bloqueo
- **Umbral Inbound**: 5 (peticiones entrantes)
- **Umbral Outbound**: 4 (respuestas salientes)

```apache
SecAction "id:900110,phase:1,pass,setvar:tx.inbound_anomaly_score_threshold=5"
SecAction "id:900111,phase:1,pass,setvar:tx.outbound_anomaly_score_threshold=4"
```

---

## Monitoreo y Logging

### Tipos de Logs

1. **Nginx Access Log** (`logs/nginx/access.log`)
   - Todas las peticiones HTTP/HTTPS
   - Incluye IP, método, URI, status code, user-agent

2. **Nginx Error Log** (`logs/nginx/error.log`)
   - Errores de Nginx y ModSecurity
   - Warnings y mensajes de debug

3. **ModSecurity Audit Log** (`logs/modsec/audit.log`)
   - Peticiones que dispararon reglas
   - Incluye headers completos, body, reglas activadas
   - Formato: Serial (todo en un archivo)

4. **ModSecurity Debug Log** (`logs/modsec/debug.log`)
   - Información detallada de procesamiento
   - Útil para troubleshooting de reglas

5. **WAF Summary Log** (`logs/nginx/waf.log`)
   - Log personalizado con anomaly score
   - Formato: `$remote_addr ... WAF_SCORE:$modsec_anomaly_score`

### Script de Monitoreo

Usa el script interactivo incluido:

```bash
bash scripts/monitor-waf.sh
```

Características:
- Estadísticas en tiempo real
- Últimas peticiones bloqueadas
- Top IPs atacantes
- Clasificación de ataques por tipo
- Logs en vivo (tail -f)
- Estado del contenedor
- Limpieza de logs antiguos

### Ejemplos de Consultas

```bash
# Ver todas las peticiones bloqueadas hoy
grep "$(date +%d/%b/%Y)" logs/nginx/access.log | grep " 403 "

# Contar ataques SQL Injection
grep -i "sql injection" logs/modsec/audit.log | wc -l

# Top 10 IPs atacantes
awk '($9 == 403)' logs/nginx/access.log | \
  awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# Ver reglas que más se disparan
grep "id:" logs/modsec/audit.log | \
  grep -oP 'id:"\K[0-9]+' | sort | uniq -c | sort -rn | head -10

# Monitorear logs en tiempo real con filtro
tail -f logs/modsec/audit.log | grep --color=always "id:"
```

### Alertas Automatizadas (Opcional)

Configurar alertas por email para eventos críticos:

```bash
# Crear script de alerta (ejemplo con mailx)
cat > /usr/local/bin/waf-alert.sh << 'EOF'
#!/bin/bash
THRESHOLD=100
COUNT=$(grep "$(date +%d/%b/%Y)" /path/to/logs/nginx/access.log | grep -c " 403 ")

if [ $COUNT -gt $THRESHOLD ]; then
    echo "WAF Alert: $COUNT blocked requests today" | \
        mail -s "WAF Alert - High Attack Volume" admin@bookworm.com
fi
EOF

# Programar en cron (cada hora)
echo "0 * * * * /usr/local/bin/waf-alert.sh" | crontab -
```

### Integración con SIEM

Exportar logs a sistemas SIEM (Splunk, ELK, Graylog):

```bash
# Ejemplo: Enviar logs a Logstash
docker run -d \
  -v /path/to/logs:/logs:ro \
  --name logstash \
  docker.elastic.co/logstash/logstash:8.0.0 \
  -e 'input { file { path => "/logs/modsec/*.log" } } output { elasticsearch { hosts => ["localhost:9200"] } }'
```

---

## Mantenimiento

### Actualización de Reglas OWASP CRS

```bash
# 1. Descargar nueva versión
cd modsec
wget https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.x.x.tar.gz

# 2. Extraer y reemplazar
tar -xzf v4.x.x.tar.gz
rm -rf owasp-crs.old
mv owasp-crs owasp-crs.old
mv coreruleset-4.x.x owasp-crs
cp owasp-crs/crs-setup.conf.example owasp-crs/crs-setup.conf

# 3. Reiniciar WAF
docker-compose -f docker-compose-waf.yml restart nginx_waf
```

### Agregar IPs a Blacklist

```bash
# Editar archivo de blacklist
echo "192.168.1.100" >> modsec/blacklist-ips.txt

# Recargar configuración sin downtime
docker exec bookworm_nginx_waf nginx -s reload
```

### Whitelist (Falsos Positivos)

Si una petición legítima es bloqueada:

1. **Identificar la regla**: Revisar logs para encontrar el ID
   ```bash
   grep "403" logs/nginx/access.log | tail -1
   grep "id:" logs/modsec/audit.log | tail -1
   ```

2. **Deshabilitar regla específica**: Agregar a `modsecurity.conf`
   ```apache
   # Deshabilitar regla 942100 (SQL Injection) para endpoint específico
   SecRule REQUEST_URI "@streq /graphql" \
       "id:5001,phase:1,pass,ctl:ruleRemoveById=942100"
   ```

3. **Deshabilitar para IPs confiables**:
   ```apache
   # Whitelist IP específica
   SecRule REMOTE_ADDR "@ipMatch 192.168.1.50" \
       "id:5002,phase:1,pass,ctl:ruleEngine=Off"
   ```

4. **Reiniciar**:
   ```bash
   docker-compose -f docker-compose-waf.yml restart nginx_waf
   ```

### Rotación de Logs

```bash
# Crear configuración logrotate
cat > /etc/logrotate.d/bookworm-waf << 'EOF'
/path/to/front/Frontend/logs/**/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 nginx nginx
    sharedscripts
    postrotate
        docker exec bookworm_nginx_waf nginx -s reopen
    endscript
}
EOF

# Test de configuración
logrotate -d /etc/logrotate.d/bookworm-waf
```

### Backup de Configuración

```bash
# Crear backup de toda la configuración
tar -czf waf-backup-$(date +%Y%m%d).tar.gz \
    modsec/ \
    nginx-waf.conf \
    docker-compose-waf.yml \
    Dockerfile.nginx

# Restaurar desde backup
tar -xzf waf-backup-20241110.tar.gz
docker-compose -f docker-compose-waf.yml restart nginx_waf
```

### Actualización de Certificados SSL

```bash
# Para producción con Let's Encrypt
certbot certonly --standalone -d bookworm.com -d www.bookworm.com

# Copiar certificados
cp /etc/letsencrypt/live/bookworm.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/bookworm.com/privkey.pem ssl/

# Actualizar nginx-waf.conf
# ssl_certificate /etc/nginx/ssl/fullchain.pem;
# ssl_certificate_key /etc/nginx/ssl/privkey.pem;

# Reiniciar
docker-compose -f docker-compose-waf.yml restart nginx_waf

# Auto-renovación (cron)
echo "0 3 * * * certbot renew --post-hook 'docker exec bookworm_nginx_waf nginx -s reload'" | crontab -
```

---

## Troubleshooting

### Problema: El WAF no inicia

```bash
# Verificar logs del contenedor
docker logs bookworm_nginx_waf

# Errores comunes:
# 1. Puerto ocupado
sudo lsof -i :443
sudo lsof -i :80

# 2. Sintaxis de configuración
docker exec bookworm_nginx_waf nginx -t

# 3. Permisos de archivos
ls -la modsec/
ls -la ssl/
```

### Problema: Falsos positivos (bloqueos incorrectos)

```bash
# 1. Identificar la petición bloqueada
grep "403" logs/nginx/access.log | tail -5

# 2. Ver qué regla se disparó
grep -A 20 "ModSecurity: Warning" logs/modsec/audit.log | tail -30

# 3. Opciones de solución:
#    a) Deshabilitar regla globalmente (no recomendado)
#    b) Deshabilitar regla para URI específico (mejor)
#    c) Ajustar umbral de anomaly score (compromiso)
#    d) Whitelist de IP (temporal para testing)

# Ejemplo: Deshabilitar para testing
SecRule REQUEST_URI "@streq /api/test" \
    "id:9999,phase:1,pass,ctl:ruleEngine=Off"
```

### Problema: Performance lento

```bash
# 1. Verificar uso de recursos
docker stats bookworm_nginx_waf

# 2. Deshabilitar audit log para peticiones normales
# En modsecurity.conf:
# SecAuditEngine RelevantOnly  (solo peticiones bloqueadas)
# En vez de: On (todas)

# 3. Reducir nivel de debug
# SecDebugLogLevel 0  (producción)
# En vez de: 3 o 9

# 4. Optimizar reglas
# - Deshabilitar reglas no necesarias
# - Reducir paranoia level
# - Usar "ctl:ruleEngine=Off" para assets estáticos
```

### Problema: ModSecurity no carga

```bash
# Verificar que el módulo está compilado
docker exec bookworm_nginx_waf ls -la /etc/nginx/modules/

# Verificar directiva load_module en nginx.conf
docker exec bookworm_nginx_waf head -20 /etc/nginx/nginx.conf

# Recompilar si es necesario
docker build --no-cache -f Dockerfile.nginx -t bookworm-nginx-waf:latest .
```

### Problema: Logs vacíos

```bash
# Verificar permisos
ls -la logs/

# Crear directorios si no existen
mkdir -p logs/nginx logs/modsec
chmod 755 logs logs/nginx logs/modsec

# Verificar rutas en configuración
docker exec bookworm_nginx_waf cat /etc/nginx/modsec/modsecurity.conf | grep Log
```

### Problema: Rate limiting muy agresivo

```bash
# Ajustar límites en nginx-waf.conf
# Antes:
# limit_req zone=general burst=20 nodelay;
# Después:
# limit_req zone=general burst=50 nodelay;

# Reiniciar
docker-compose -f docker-compose-waf.yml restart nginx_waf
```

---

## Referencias

### Documentación Oficial

- **ModSecurity**: https://github.com/SpiderLabs/ModSecurity
- **OWASP CRS**: https://coreruleset.org/docs/
- **Nginx**: https://nginx.org/en/docs/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

### Recursos Adicionales

- [ModSecurity Handbook](https://www.feistyduck.com/books/modsecurity-handbook/)
- [OWASP ModSecurity CRS Documentation](https://coreruleset.org/docs/)
- [Nginx Security Best Practices](https://www.nginx.com/blog/mitigating-owasp-top-10-threats/)

### Comunidad y Soporte

- **GitHub Issues**: https://github.com/SpiderLabs/ModSecurity/issues
- **OWASP Slack**: https://owasp.org/slack/invite
- **Stack Overflow**: Tag `modsecurity` o `nginx-waf`

---

## Apéndices

### A. Códigos de Estado HTTP

| Código | Significado | Cuándo se usa en WAF |
|--------|-------------|----------------------|
| 200 | OK | Petición permitida |
| 400 | Bad Request | Petición malformada |
| 401 | Unauthorized | JWT inválido o faltante |
| 403 | Forbidden | Bloqueado por regla WAF |
| 404 | Not Found | Recurso no existe |
| 405 | Method Not Allowed | Método HTTP no permitido |
| 413 | Payload Too Large | Body excede límite |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |
| 502 | Bad Gateway | Backend no responde |
| 503 | Service Unavailable | Servicio caído |

### B. Variables ModSecurity Comunes

```apache
%{REMOTE_ADDR}          # IP del cliente
%{REQUEST_METHOD}       # GET, POST, etc.
%{REQUEST_URI}          # URI de la petición
%{REQUEST_HEADERS}      # Headers de petición
%{REQUEST_BODY}         # Body de petición
%{RESPONSE_STATUS}      # Status code de respuesta
%{TX.ANOMALY_SCORE}     # Puntuación de anomalía
%{IP.LOGIN_ATTEMPTS}    # Variable personalizada
```

### C. Comandos Docker Útiles

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose-waf.yml logs -f nginx_waf

# Ejecutar comando dentro del contenedor
docker exec -it bookworm_nginx_waf /bin/sh

# Reiniciar sin downtime
docker exec bookworm_nginx_waf nginx -s reload

# Verificar sintaxis de configuración
docker exec bookworm_nginx_waf nginx -t

# Ver procesos
docker exec bookworm_nginx_waf ps aux

# Ver uso de recursos
docker stats bookworm_nginx_waf

# Inspeccionar configuración
docker exec bookworm_nginx_waf cat /etc/nginx/nginx.conf
```

---

**Última actualización**: 2024-11-10
**Versión del documento**: 1.0
**Autor**: BookWorm Security Team
