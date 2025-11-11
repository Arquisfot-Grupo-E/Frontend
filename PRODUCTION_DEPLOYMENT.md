# WAF Production Deployment Guide

## 📋 Pre-requisitos para Producción

### Hardware Recomendado
- **CPU**: 4 cores mínimo
- **RAM**: 4GB mínimo (8GB recomendado)
- **Disco**: 50GB mínimo (para logs y actualizaciones)
- **Red**: 100Mbps mínimo

### Software
- Docker CE 20.10+
- Docker Compose 2.0+
- Sistema operativo: Ubuntu 20.04 LTS / 22.04 LTS (recomendado)

### Dominio y DNS
- Dominio registrado y apuntando al servidor
- Subdominios (opcional): `www.domain.com`, `api.domain.com`

---

## 🔐 Paso 1: Certificados SSL Válidos

### Opción A: Let's Encrypt (Recomendado - Gratuito)

```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot

# Detener Nginx temporalmente si está corriendo
docker-compose -f docker-compose-waf.yml stop nginx_waf

# Obtener certificados
sudo certbot certonly --standalone \
  -d bookworm.com \
  -d www.bookworm.com \
  --email admin@bookworm.com \
  --agree-tos \
  --non-interactive

# Copiar certificados al proyecto
sudo cp /etc/letsencrypt/live/bookworm.com/fullchain.pem ssl/bookworm.crt
sudo cp /etc/letsencrypt/live/bookworm.com/privkey.pem ssl/bookworm.key
sudo chown $USER:$USER ssl/bookworm.*
chmod 644 ssl/bookworm.crt
chmod 600 ssl/bookworm.key
```

### Opción B: Certificados Comerciales

```bash
# Si tienes certificados de un CA comercial (Digicert, GoDaddy, etc.)
# Copiar al directorio ssl/
cp /path/to/certificate.crt ssl/bookworm.crt
cp /path/to/private.key ssl/bookworm.key
cp /path/to/ca-bundle.crt ssl/ca-bundle.crt  # Si aplica
chmod 644 ssl/bookworm.crt ssl/ca-bundle.crt
chmod 600 ssl/bookworm.key
```

### Actualizar Configuración Nginx

Editar `nginx-waf.conf`:

```nginx
# Cambiar de:
ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

# A:
ssl_certificate /etc/nginx/ssl/bookworm.crt;
ssl_certificate_key /etc/nginx/ssl/bookworm.key;
# ssl_trusted_certificate /etc/nginx/ssl/ca-bundle.crt;  # Si aplica
```

### Renovación Automática (Let's Encrypt)

```bash
# Crear script de renovación
sudo tee /etc/cron.d/certbot-renew << 'EOF'
# Renovar certificados cada 12 horas
0 */12 * * * root certbot renew --quiet --deploy-hook "cd /path/to/Frontend && cp /etc/letsencrypt/live/bookworm.com/*.pem ssl/ && docker exec bookworm_nginx_waf nginx -s reload"
EOF

# O usar systemd timer (Ubuntu 20.04+)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🌐 Paso 2: Configuración DNS

### Registros DNS Requeridos

```dns
; A Records (apuntar a tu servidor)
@                   IN A     <IP_DEL_SERVIDOR>
www                 IN A     <IP_DEL_SERVIDOR>

; AAAA Records (si tienes IPv6)
@                   IN AAAA  <IPv6_DEL_SERVIDOR>
www                 IN AAAA  <IPv6_DEL_SERVIDOR>

; CAA Record (opcional pero recomendado)
@                   IN CAA   0 issue "letsencrypt.org"
```

### Verificar DNS

```bash
# Verificar resolución DNS
dig bookworm.com
dig www.bookworm.com

# Verificar desde fuera de tu red
nslookup bookworm.com 8.8.8.8
```

---

## ⚙️ Paso 3: Variables de Entorno Producción

### Crear archivo .env.production

```bash
cat > .env.production << 'EOF'
# Environment
NODE_ENV=production

# URLs
VITE_GRAPHQL_URL=https://bookworm.com/graphql
VITE_API_URL=https://bookworm.com

# Database (ajustar según backend)
DB_HOST=postgres-db
DB_PORT=5432
DB_NAME=bookworm_prod
DB_USER=bookworm
DB_PASSWORD=<STRONG_PASSWORD_HERE>

# JWT
JWT_SECRET=<STRONG_SECRET_HERE>
JWT_EXPIRATION=3600

# Redis (si aplica)
REDIS_HOST=redis
REDIS_PORT=6379

# Email (para notificaciones)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<SENDGRID_API_KEY>

# Monitoring (opcional)
SENTRY_DSN=<SENTRY_DSN_HERE>

# Log Level
LOG_LEVEL=info
EOF

# Proteger el archivo
chmod 600 .env.production
```

### Actualizar docker-compose-waf.yml

```yaml
services:
  frontend:
    env_file:
      - .env.production
    # ... resto de configuración
```

---

## 🔧 Paso 4: Ajustes de Seguridad Producción

### 1. Actualizar nginx-waf.conf

```nginx
# Cambiar server_name
server {
    listen 443 ssl http2;
    server_name bookworm.com www.bookworm.com;  # Tu dominio real

    # ... resto de configuración
}
```

### 2. Ajustar ModSecurity para Producción

Editar `modsec/modsecurity.conf`:

```apache
# Reducir debug logging (performance)
SecDebugLogLevel 0

# Audit log solo para bloqueados (no todo)
SecAuditEngine RelevantOnly

# Ajustar límites según tu tráfico
SecRequestBodyLimit 10485760  # 10MB (ajustar según necesidad)

# Paranoia level (empezar con 1, subir gradualmente)
SecAction "id:900000,phase:1,pass,setvar:tx.paranoia_level=1"
```

### 3. Configurar Firewall del Servidor

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (redirect)
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Verificar
sudo ufw status

# Opcional: Rate limiting SSH
sudo ufw limit 22/tcp
```

### 4. Fail2Ban (Protección adicional)

```bash
# Instalar Fail2Ban
sudo apt install fail2ban

# Crear configuración para Nginx
sudo tee /etc/fail2ban/filter.d/nginx-waf.conf << 'EOF'
[Definition]
failregex = ^<HOST> .* "(GET|POST|HEAD).*" (403|429) .*$
ignoreregex =
EOF

# Crear jail
sudo tee /etc/fail2ban/jail.d/nginx-waf.conf << 'EOF'
[nginx-waf]
enabled = true
port = http,https
filter = nginx-waf
logpath = /path/to/Frontend/logs/nginx/access.log
maxretry = 10
findtime = 600
bantime = 3600
action = iptables-multiport[name=nginx-waf, port="http,https", protocol=tcp]
EOF

# Reiniciar
sudo systemctl restart fail2ban
sudo fail2ban-client status nginx-waf
```

---

## 🚀 Paso 5: Despliegue

### 1. Build de Producción

```bash
cd /path/to/Frontend

# Limpiar contenedores anteriores
docker-compose -f docker-compose-waf.yml down

# Pull de imágenes actualizadas
docker-compose -f docker-compose-waf.yml pull

# Build
docker-compose -f docker-compose-waf.yml build --no-cache

# Verificar imágenes
docker images | grep bookworm
```

### 2. Iniciar Servicios

```bash
# Iniciar en background
docker-compose -f docker-compose-waf.yml up -d

# Verificar estado
docker-compose -f docker-compose-waf.yml ps

# Ver logs
docker-compose -f docker-compose-waf.yml logs -f nginx_waf
```

### 3. Verificación Post-Despliegue

```bash
# 1. Health check
curl https://bookworm.com/health

# 2. SSL Labs test (online)
# Visitar: https://www.ssllabs.com/ssltest/analyze.html?d=bookworm.com

# 3. Headers check
curl -I https://bookworm.com

# 4. WAF test
bash scripts/test-waf.sh https://bookworm.com

# 5. Performance test
ab -n 1000 -c 10 https://bookworm.com/
```

---

## 📊 Paso 6: Monitoreo y Logging

### 1. Centralizar Logs

```bash
# Instalar Logrotate config
sudo tee /etc/logrotate.d/bookworm-waf << 'EOF'
/path/to/Frontend/logs/**/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        docker exec bookworm_nginx_waf nginx -s reopen
    endscript
}
EOF

# Test
sudo logrotate -d /etc/logrotate.d/bookworm-waf
```

### 2. Configurar Alertas

```bash
# Script de alertas por email
sudo tee /usr/local/bin/waf-alert.sh << 'EOF'
#!/bin/bash
THRESHOLD=500
LOG_FILE="/path/to/Frontend/logs/nginx/access.log"
EMAIL="admin@bookworm.com"

COUNT=$(grep "$(date +%d/%b/%Y)" "$LOG_FILE" | grep -c " 403 ")

if [ $COUNT -gt $THRESHOLD ]; then
    subject="🚨 WAF Alert: High Attack Volume"
    body="Detected $COUNT blocked requests today (threshold: $THRESHOLD)"
    echo "$body" | mail -s "$subject" "$EMAIL"
fi
EOF

chmod +x /usr/local/bin/waf-alert.sh

# Cron job (ejecutar cada hora)
(crontab -l 2>/dev/null; echo "0 * * * * /usr/local/bin/waf-alert.sh") | crontab -
```

### 3. Integrar con Monitoring (Opcional)

#### Prometheus + Grafana

```bash
# docker-compose-monitoring.yml
cat > docker-compose-monitoring.yml << 'EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - dmz_network

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    networks:
      - dmz_network
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=<STRONG_PASSWORD>

  nginx-exporter:
    image: nginx/nginx-prometheus-exporter:latest
    command:
      - '-nginx.scrape-uri=http://bookworm_nginx_waf/nginx_status'
    networks:
      - dmz_network

volumes:
  prometheus_data:
  grafana_data:

networks:
  dmz_network:
    external: true
EOF
```

---

## 🔄 Paso 7: Backup y Disaster Recovery

### 1. Script de Backup Automático

```bash
sudo tee /usr/local/bin/waf-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/bookworm-waf"
DATE=$(date +%Y%m%d_%H%M%S)
SOURCE_DIR="/path/to/Frontend"

mkdir -p "$BACKUP_DIR"

# Backup de configuración
tar -czf "$BACKUP_DIR/config-$DATE.tar.gz" \
    -C "$SOURCE_DIR" \
    modsec/ \
    ssl/ \
    nginx-waf.conf \
    docker-compose-waf.yml \
    .env.production

# Backup de logs (últimos 7 días)
tar -czf "$BACKUP_DIR/logs-$DATE.tar.gz" \
    -C "$SOURCE_DIR" \
    logs/

# Limpiar backups antiguos (>30 días)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/waf-backup.sh

# Programar backup diario a las 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/waf-backup.sh") | crontab -
```

### 2. Plan de Recuperación

```bash
# En caso de desastre, restaurar desde backup:

# 1. Restaurar configuración
cd /path/to/Frontend
tar -xzf /backup/bookworm-waf/config-YYYYMMDD_HHMMSS.tar.gz

# 2. Reconstruir contenedores
docker-compose -f docker-compose-waf.yml build --no-cache

# 3. Iniciar servicios
docker-compose -f docker-compose-waf.yml up -d

# 4. Verificar
curl https://bookworm.com/health
bash scripts/test-waf.sh https://bookworm.com
```

---

## 🔐 Paso 8: Hardening Adicional

### 1. Deshabilitar Root Login (SSH)

```bash
sudo sed -i 's/^PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 2. Configurar Auditd

```bash
sudo apt install auditd
sudo systemctl enable auditd
sudo systemctl start auditd

# Monitorear cambios en archivos críticos
sudo tee -a /etc/audit/rules.d/waf.rules << 'EOF'
-w /path/to/Frontend/modsec/ -p wa -k waf_config_change
-w /path/to/Frontend/nginx-waf.conf -p wa -k nginx_config_change
EOF

sudo systemctl restart auditd
```

### 3. Sistema de Detección de Intrusiones (AIDE)

```bash
sudo apt install aide
sudo aideinit
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db

# Programar chequeos diarios
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/aide --check | mail -s 'AIDE Report' admin@bookworm.com") | crontab -
```

---

## 📈 Paso 9: Performance Tuning

### 1. Nginx Worker Processes

Editar `nginx-waf.conf`:

```nginx
# Ajustar según número de CPUs
worker_processes auto;  # O número específico: 4

# Aumentar worker_connections
events {
  worker_connections 2048;  # O más según carga
  use epoll;
  multi_accept on;
}
```

### 2. ModSecurity Performance

Editar `modsec/modsecurity.conf`:

```apache
# Deshabilitar audit para peticiones normales
SecAuditEngine RelevantOnly

# Reducir body inspection size
SecRequestBodyLimit 5242880  # 5MB

# Optimizar reglas
# Deshabilitar reglas no necesarias para tu app
SecRuleRemoveById 920450 920460  # Ejemplo
```

### 3. Sistema Operativo

```bash
# Aumentar límites de archivos abiertos
sudo tee -a /etc/security/limits.conf << 'EOF'
nginx soft nofile 65536
nginx hard nofile 65536
EOF

# Optimizar kernel para alta concurrencia
sudo tee -a /etc/sysctl.conf << 'EOF'
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
EOF

sudo sysctl -p
```

---

## ✅ Checklist Final Pre-Producción

- [ ] Certificados SSL válidos instalados y verificados
- [ ] DNS configurado y propagado
- [ ] Firewall configurado (solo puertos 22, 80, 443)
- [ ] Fail2Ban instalado y activo
- [ ] Variables de entorno de producción configuradas
- [ ] Contraseñas fuertes en todos los servicios
- [ ] Backups automáticos configurados
- [ ] Monitoring y alertas configurados
- [ ] Logs centralizados y rotados
- [ ] Performance testing completado
- [ ] Security testing completado (test-waf.sh)
- [ ] SSL Labs test: A o A+ rating
- [ ] Plan de disaster recovery documentado
- [ ] Documentación actualizada para el equipo
- [ ] Accesos SSH solo con keys (no passwords)
- [ ] Root login deshabilitado
- [ ] Auditd configurado
- [ ] Rate limits ajustados según tráfico real

---

## 🆘 Contactos de Emergencia

```bash
# En caso de emergencia, tener a mano:

# 1. Deshabilitar WAF temporalmente (cuidado!)
docker exec bookworm_nginx_waf sed -i 's/modsecurity on/modsecurity off/' /etc/nginx/nginx.conf
docker exec bookworm_nginx_waf nginx -s reload

# 2. Reducir paranoia level
docker exec bookworm_nginx_waf sed -i 's/paranoia_level=2/paranoia_level=1/' /etc/nginx/modsec/modsecurity.conf
docker exec bookworm_nginx_waf nginx -s reload

# 3. Ver últimos logs
docker-compose -f docker-compose-waf.yml logs --tail=100 nginx_waf

# 4. Rollback rápido
docker-compose -f docker-compose-waf.yml down
# Restaurar backup
tar -xzf /backup/config-LAST_GOOD.tar.gz
docker-compose -f docker-compose-waf.yml up -d
```

---

**Documento actualizado**: 2024-11-10
**Versión**: 1.0
**Para soporte**: Consultar WAF_DOCUMENTATION.md
