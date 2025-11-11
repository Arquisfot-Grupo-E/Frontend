# WAF Implementation - Quick Start Guide

## 🛡️ Overview

WAF (Web Application Firewall) implementado con **ModSecurity 3** + **Nginx** + **OWASP CRS** para proteger el frontend de BookWorm contra ataques web.

### Protecciones Incluidas

✅ OWASP Top 10 (SQL Injection, XSS, CSRF, etc.)
✅ GraphQL específico (introspection blocking, query depth limiting)
✅ Rate limiting avanzado (login, register, API)
✅ Anti-bot y anti-scraping
✅ TLS/SSL con headers de seguridad
✅ DDoS protection (Layer 7)

---

## 🚀 Quick Start

### 1. Instalación Automática (Recomendado)

```bash
cd front/Frontend
bash scripts/setup-waf.sh
```

### 2. Iniciar WAF

```bash
docker-compose -f docker-compose-waf.yml up -d
```

### 3. Verificar

```bash
# Health check
curl -k https://localhost/health

# WAF status
curl -k https://localhost/waf-status

# Test de bloqueo (SQL Injection)
curl -k "https://localhost/?query=1' OR '1'='1"
# Esperado: 403 Forbidden
```

---

## 📊 Monitoreo

### Script Interactivo

```bash
bash scripts/monitor-waf.sh
```

Características:
- Estadísticas en tiempo real
- Peticiones bloqueadas
- Top IPs atacantes
- Clasificación de ataques
- Logs en vivo

### Consultas Rápidas

```bash
# Ver ataques bloqueados hoy
grep "$(date +%d/%b/%Y)" logs/nginx/access.log | grep " 403 "

# Top IPs atacantes
awk '($9 == 403)' logs/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# Contar tipos de ataque
grep -i "sql injection" logs/modsec/audit.log | wc -l
grep -i "xss" logs/modsec/audit.log | wc -l
grep -i "rate limit" logs/modsec/audit.log | wc -l
```

---

## 📁 Estructura de Archivos

```
Frontend/
├── Dockerfile.nginx              # Imagen Nginx + ModSecurity
├── nginx-waf.conf               # Configuración Nginx con WAF
├── docker-compose-waf.yml       # Docker Compose con WAF
├── modsec/
│   ├── modsecurity.conf        # Config principal ModSecurity
│   ├── blacklist-user-agents.txt
│   ├── blacklist-ips.txt
│   ├── unicode.mapping
│   └── custom-rules/
│       └── bookworm-rules.conf # Reglas personalizadas
├── logs/
│   ├── nginx/
│   │   ├── access.log
│   │   ├── error.log
│   │   └── waf.log
│   └── modsec/
│       ├── audit.log
│       └── debug.log
├── scripts/
│   ├── setup-waf.sh           # Setup automático
│   └── monitor-waf.sh         # Monitoreo interactivo
└── WAF_DOCUMENTATION.md       # Documentación completa
```

---

## 🔧 Configuración

### Rate Limits

Configurados en `nginx-waf.conf`:

| Zona | Límite | Aplicación |
|------|--------|------------|
| general | 10 req/s | Peticiones generales |
| login | 5 req/m | Intentos de login |
| api | 30 req/s | GraphQL queries |
| register | 3 req/h | Registros (custom rule) |

### Niveles de Seguridad

Configurados en `modsec/modsecurity.conf`:

```apache
# Paranoia Level (1-4)
SecAction "id:900000,phase:1,pass,setvar:tx.paranoia_level=1"

# Anomaly Score Thresholds
SecAction "id:900110,phase:1,pass,setvar:tx.inbound_anomaly_score_threshold=5"
```

**Niveles de Paranoia:**
- **1**: Balance (default, recomendado)
- **2**: Más estricto (puede tener falsos positivos)
- **3-4**: Muy estricto (requiere tuning extensivo)

---

## 🐛 Troubleshooting

### El WAF no inicia

```bash
# Ver logs
docker logs bookworm_nginx_waf

# Verificar sintaxis
docker exec bookworm_nginx_waf nginx -t

# Verificar puertos
sudo lsof -i :443
```

### Falsos Positivos (Bloqueos incorrectos)

```bash
# 1. Identificar regla en logs
grep "403" logs/nginx/access.log | tail -1
grep "id:" logs/modsec/audit.log | tail -5

# 2. Deshabilitar regla para URI específico
# Agregar a modsec/modsecurity.conf:
SecRule REQUEST_URI "@streq /api/endpoint" \
    "id:9999,phase:1,pass,ctl:ruleRemoveById=942100"

# 3. Reiniciar
docker-compose -f docker-compose-waf.yml restart nginx_waf
```

### Performance Lento

```bash
# 1. Reducir nivel de debug
# En modsec/modsecurity.conf:
# SecDebugLogLevel 0

# 2. Audit log solo para bloqueados
# SecAuditEngine RelevantOnly

# 3. Reducir paranoia level
# setvar:tx.paranoia_level=1

# 4. Deshabilitar para assets
# location ~* \.(js|css|png|jpg)$ { modsecurity off; }
```

---

## 📚 Reglas Personalizadas

Las reglas específicas para BookWorm están en `modsec/custom-rules/bookworm-rules.conf`:

### GraphQL Protection

- **Introspection Blocking**: Bloquea `__schema`, `__type`
- **Query Depth Limiting**: Máximo 7 niveles de anidación
- **Batch Query Limiting**: Máximo 10 operaciones
- **Mutation Auth**: Requiere JWT (excepto login/register)

### Rate Limiting Custom

- **Login**: 5 intentos/minuto por IP
- **Register**: 3 intentos/hora por IP
- **API General**: 30 req/segundo

### Content Validation

- **Review Length**: Máximo 5000 caracteres
- **HTML Blocking**: No permite tags HTML en reviews
- **Email Validation**: Formato correcto en registros
- **File Upload**: Máximo 5MB, no ejecutables

---

## 🔐 Seguridad de Transporte

### SSL/TLS Configuration

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:...';
ssl_prefer_server_ciphers on;
```

### Security Headers

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
```

---

## 🔄 Mantenimiento

### Actualizar OWASP CRS

```bash
cd modsec
wget https://github.com/coreruleset/coreruleset/archive/refs/tags/v4.x.x.tar.gz
tar -xzf v4.x.x.tar.gz
mv owasp-crs owasp-crs.old
mv coreruleset-4.x.x owasp-crs
cp owasp-crs/crs-setup.conf.example owasp-crs/crs-setup.conf
docker-compose -f docker-compose-waf.yml restart nginx_waf
```

### Agregar IP a Blacklist

```bash
echo "192.168.1.100" >> modsec/blacklist-ips.txt
docker exec bookworm_nginx_waf nginx -s reload
```

### Rotación de Logs

```bash
# Logs en logs/nginx/ y logs/modsec/
# Configurar logrotate o usar:
find logs/ -name "*.log" -mtime +7 -delete
```

---

## 📖 Documentación

- **Completa**: Ver `WAF_DOCUMENTATION.md` (130+ páginas)
- **ModSecurity Docs**: https://github.com/SpiderLabs/ModSecurity
- **OWASP CRS**: https://coreruleset.org/docs/
- **Nginx Security**: https://www.nginx.com/blog/mitigating-owasp-top-10-threats/

---

## 🎯 Testing de Seguridad

### Herramientas Recomendadas

```bash
# OWASP ZAP (Automated Scanner)
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://localhost

# Nikto (Web Scanner) - Será bloqueado por WAF
nikto -h https://localhost

# SQLMap (SQL Injection) - Será bloqueado por WAF
sqlmap -u "https://localhost/graphql" --data='{"query":"..."}'

# Custom tests
curl -k "https://localhost/?id=1' OR '1'='1"  # SQL Injection
curl -k "https://localhost/?name=<script>alert(1)</script>"  # XSS
curl -k "https://localhost/?file=../../../../etc/passwd"  # Path Traversal
```

### Verificar Protecciones

```bash
# 1. Rate Limiting
for i in {1..20}; do curl -k https://localhost/graphql -X POST; done
# Esperado: 429 Too Many Requests después de límite

# 2. GraphQL Introspection
curl -k https://localhost/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{types{name}}}"}'
# Esperado: 403 Forbidden

# 3. Bot Detection
curl -k https://localhost/ -A "sqlmap/1.0"
# Esperado: 403 Forbidden

# 4. JWT Validation
curl -k https://localhost/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{createReview(...)}"}'
# Esperado: 401 Unauthorized (sin Authorization header)
```

---

## 💡 Tips y Best Practices

1. **Monitoreo Regular**: Revisar logs diariamente con `monitor-waf.sh`
2. **Tuning de Reglas**: Ajustar según falsos positivos en tu aplicación
3. **Backup de Config**: Hacer backup antes de cambios importantes
4. **Testing Staging**: Probar cambios en ambiente de staging primero
5. **SSL Producción**: Usar certificados válidos (Let's Encrypt) en producción
6. **Alertas**: Configurar alertas por email para ataques masivos
7. **Rate Limits**: Ajustar según tráfico real de tu aplicación
8. **Whitelist IPs**: Agregar IPs de confianza (CI/CD, monitoring)

---

## 📞 Soporte

**Issues**: Reportar en GitHub del proyecto
**Documentación Completa**: `WAF_DOCUMENTATION.md`
**Logs**: `logs/modsec/audit.log` y `logs/nginx/error.log`

---

**Última actualización**: 2024-11-10
**Versión**: 1.0
**Autor**: BookWorm Security Team
