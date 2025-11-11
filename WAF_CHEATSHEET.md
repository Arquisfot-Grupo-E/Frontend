# WAF Quick Reference - Cheat Sheet

## 🚀 Quick Commands

### Instalación y Setup
```bash
# Setup completo (primera vez)
bash scripts/setup-waf.sh

# Iniciar WAF
docker-compose -f docker-compose-waf.yml up -d

# Ver logs en tiempo real
docker-compose -f docker-compose-waf.yml logs -f nginx_waf

# Detener WAF
docker-compose -f docker-compose-waf.yml down
```

### Verificación y Testing
```bash
# Health check
curl -k https://localhost/health

# WAF status
curl -k https://localhost/waf-status

# Suite completa de tests
bash scripts/test-waf.sh

# Test específico (SQL Injection)
curl -k "https://localhost/?id=1' OR '1'='1"
# Esperado: 403 Forbidden
```

### Monitoreo
```bash
# Dashboard interactivo
bash scripts/monitor-waf.sh

# Ver últimos 50 bloqueados
grep " 403 " logs/nginx/access.log | tail -50

# Ver ataques en tiempo real
tail -f logs/modsec/audit.log

# Top 10 IPs atacantes
awk '($9 == 403)' logs/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10
```

---

## 📁 Archivos de Configuración Clave

```
Dockerfile.nginx          → Imagen Nginx + ModSecurity
nginx-waf.conf           → Config principal Nginx
docker-compose-waf.yml   → Orquestación Docker
modsec/modsecurity.conf  → Config ModSecurity
modsec/custom-rules/bookworm-rules.conf → Reglas personalizadas
```

---

## 🔧 Comandos de Mantenimiento

### Recargar Configuración (sin downtime)
```bash
docker exec bookworm_nginx_waf nginx -s reload
```

### Verificar Sintaxis
```bash
docker exec bookworm_nginx_waf nginx -t
```

### Ver Procesos
```bash
docker exec bookworm_nginx_waf ps aux
```

### Acceder al Contenedor
```bash
docker exec -it bookworm_nginx_waf /bin/sh
```

### Reiniciar WAF
```bash
docker-compose -f docker-compose-waf.yml restart nginx_waf
```

### Ver Uso de Recursos
```bash
docker stats bookworm_nginx_waf
```

---

## 🛡️ Reglas Personalizadas (IDs)

### Rangos de IDs
- **1000-1999**: Reglas generales
- **2000-2999**: Reglas específicas GraphQL
- **3000-3999**: Blacklists (IPs, UAs)
- **4000-4999**: Reglas custom BookWorm
- **5000-5999**: Whitelists y excepciones
- **9000-9999**: Testing y temporales

### Reglas Importantes
```apache
# 1001-1002: Rate limiting general
# 1003: SQL Injection
# 1004: XSS
# 1005: Path Traversal
# 1006: Command Injection
# 2000-2003: GraphQL introspection y depth
# 4001-4006: JWT y autenticación
# 4010-4020: GraphQL específico
# 4030-4035: Rate limiting API
# 4040-4046: Validación de contenido
# 4050-4051: File upload protection
# 4060-4062: Anti-automation
```

---

## 🔍 Consultas de Logs Útiles

### Análisis de Ataques
```bash
# Contar ataques por tipo
echo "SQL Injection: $(grep -i 'sql injection' logs/modsec/audit.log | wc -l)"
echo "XSS: $(grep -i 'xss' logs/modsec/audit.log | wc -l)"
echo "Path Traversal: $(grep -i 'path traversal' logs/modsec/audit.log | wc -l)"
echo "Rate Limit: $(grep -i 'rate limit' logs/modsec/audit.log | wc -l)"

# Ataques en las últimas 24 horas
find logs/modsec/audit.log -mtime -1 -exec grep -c "ModSecurity:" {} \;

# Top User-Agents bloqueados
awk '($9 == 403)' logs/nginx/access.log | awk -F'"' '{print $6}' | sort | uniq -c | sort -rn | head -10
```

### Performance
```bash
# Tiempos de respuesta promedio
awk '{print $NF}' logs/nginx/access.log | awk '{sum+=$1; count++} END {print "Avg:", sum/count "ms"}'

# Peticiones por minuto
grep "$(date +%d/%b/%Y:%H:%M)" logs/nginx/access.log | wc -l

# Status codes
awk '{print $9}' logs/nginx/access.log | sort | uniq -c | sort -rn
```

---

## 🚨 Troubleshooting Rápido

### WAF No Inicia
```bash
# 1. Ver logs de error
docker logs bookworm_nginx_waf

# 2. Verificar puertos ocupados
sudo lsof -i :443
sudo lsof -i :80

# 3. Verificar sintaxis config
docker exec bookworm_nginx_waf nginx -t

# 4. Rebuild completo
docker-compose -f docker-compose-waf.yml down
docker-compose -f docker-compose-waf.yml build --no-cache
docker-compose -f docker-compose-waf.yml up -d
```

### Falso Positivo (Bloqueo Incorrecto)
```bash
# 1. Identificar regla en logs
grep "403" logs/nginx/access.log | tail -1
grep "id:" logs/modsec/audit.log | tail -5

# 2. Temporal: Reducir paranoia level
# En modsec/modsecurity.conf cambiar:
# setvar:tx.paranoia_level=1  (de 2 a 1)

# 3. Permanente: Deshabilitar regla para URI
# Agregar a modsec/modsecurity.conf:
SecRule REQUEST_URI "@streq /api/endpoint" \
    "id:9999,phase:1,pass,ctl:ruleRemoveById=942100"

# 4. Reiniciar
docker exec bookworm_nginx_waf nginx -s reload
```

### Performance Lento
```bash
# 1. Reducir debug logging
# En modsec/modsecurity.conf:
# SecDebugLogLevel 0

# 2. Audit solo bloqueados
# SecAuditEngine RelevantOnly

# 3. Deshabilitar para assets
# En nginx-waf.conf agregar:
location ~* \.(js|css|png|jpg)$ {
    modsecurity off;
    # ...
}

# 4. Reiniciar
docker exec bookworm_nginx_waf nginx -s reload
```

---

## 🎯 Tests Rápidos de Seguridad

### SQL Injection
```bash
curl -k "https://localhost/?id=1' OR '1'='1"
curl -k "https://localhost/?query=UNION SELECT * FROM users"
# Esperado: 403
```

### XSS
```bash
curl -k "https://localhost/?name=<script>alert(1)</script>"
curl -k "https://localhost/?img=<img src=x onerror=alert(1)>"
# Esperado: 403
```

### Path Traversal
```bash
curl -k "https://localhost/../../../etc/passwd"
curl -k "https://localhost/%2e%2e%2f%2e%2e%2fetc/passwd"
# Esperado: 403
```

### GraphQL Introspection
```bash
curl -k -X POST https://localhost/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{__schema{types{name}}}"}'
# Esperado: 403
```

### Bot Detection
```bash
curl -k https://localhost/ -A "sqlmap/1.0"
curl -k https://localhost/ -A "nikto/2.1"
# Esperado: 403
```

### Rate Limiting
```bash
for i in {1..20}; do curl -k https://localhost/; done
# Esperado: 429 después del límite
```

---

## 📝 Configuración Rápida

### Agregar IP a Blacklist
```bash
echo "192.168.1.100" >> modsec/blacklist-ips.txt
docker exec bookworm_nginx_waf nginx -s reload
```

### Agregar User-Agent Malicioso
```bash
echo "evilbot" >> modsec/blacklist-user-agents.txt
docker exec bookworm_nginx_waf nginx -s reload
```

### Cambiar Rate Limits
```nginx
# En nginx-waf.conf:
limit_req_zone $binary_remote_addr zone=general:10m rate=20r/s;  # de 10r/s
# Reiniciar
docker exec bookworm_nginx_waf nginx -s reload
```

### Cambiar Paranoia Level
```apache
# En modsec/modsecurity.conf:
SecAction "id:900000,phase:1,pass,setvar:tx.paranoia_level=2"  # 1-4
# Reiniciar
docker exec bookworm_nginx_waf nginx -s reload
```

---

## 🔐 Seguridad Headers

```bash
# Verificar headers presentes
curl -I -k https://localhost/ | grep -E '(Strict-Transport|X-Frame|X-Content|X-XSS|Content-Security)'

# Esperado:
# Strict-Transport-Security: max-age=31536000; includeSubDomains
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
# Content-Security-Policy: default-src 'self'; ...
```

---

## 📊 Métricas Rápidas

```bash
# Total peticiones hoy
grep "$(date +%d/%b/%Y)" logs/nginx/access.log | wc -l

# Total bloqueados hoy
grep "$(date +%d/%b/%Y)" logs/nginx/access.log | grep " 403 " | wc -l

# Porcentaje de bloqueo
TOTAL=$(grep "$(date +%d/%b/%Y)" logs/nginx/access.log | wc -l)
BLOCKED=$(grep "$(date +%d/%b/%Y)" logs/nginx/access.log | grep " 403 " | wc -l)
echo "scale=2; ($BLOCKED / $TOTAL) * 100" | bc

# Top 5 endpoints atacados
awk '($9 == 403)' logs/nginx/access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -5
```

---

## 🆘 Comandos de Emergencia

### Deshabilitar WAF Temporalmente (¡CUIDADO!)
```bash
docker exec bookworm_nginx_waf sed -i 's/modsecurity on/modsecurity off/' /etc/nginx/nginx.conf
docker exec bookworm_nginx_waf nginx -s reload

# Para reactivar:
docker exec bookworm_nginx_waf sed -i 's/modsecurity off/modsecurity on/' /etc/nginx/nginx.conf
docker exec bookworm_nginx_waf nginx -s reload
```

### Rollback a Configuración Anterior
```bash
# Restaurar desde backup
cd /path/to/Frontend
tar -xzf /backup/config-YYYYMMDD.tar.gz
docker-compose -f docker-compose-waf.yml restart nginx_waf
```

### Whitelist IP Temporalmente
```bash
# Agregar al inicio de modsec/modsecurity.conf:
SecRule REMOTE_ADDR "@ipMatch 192.168.1.50" \
    "id:9000,phase:1,pass,ctl:ruleEngine=Off"

docker exec bookworm_nginx_waf nginx -s reload
```

---

## 📚 Recursos de Referencia

| Documento | Descripción | Tiempo |
|-----------|-------------|--------|
| WAF_README.md | Quick start guide | 15 min |
| WAF_DOCUMENTATION.md | Manual completo | 2-3 h |
| PRODUCTION_DEPLOYMENT.md | Guía producción | 1 h |
| WAF_SUMMARY.md | Executive summary | 30 min |

---

## 🔗 Links Útiles

- **ModSecurity Docs**: https://github.com/SpiderLabs/ModSecurity/wiki
- **OWASP CRS**: https://coreruleset.org/docs/
- **Nginx Docs**: https://nginx.org/en/docs/
- **SSL Test**: https://www.ssllabs.com/ssltest/
- **Security Headers**: https://securityheaders.com/

---

**Última actualización**: 2024-11-10
**Versión**: 1.0
**Para soporte completo**: Ver WAF_DOCUMENTATION.md
