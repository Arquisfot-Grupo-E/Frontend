# React + TypeScript + Vite + WAF

## 🛡️ Web Application Firewall (WAF)

Este proyecto incluye un WAF completo implementado con **ModSecurity 3** + **Nginx** + **OWASP CRS** para protección contra ataques web.

### Características de Seguridad

✅ **OWASP Top 10 Protection**: SQL Injection, XSS, CSRF, Path Traversal, etc.
✅ **GraphQL Security**: Introspection blocking, query depth limiting, rate limiting
✅ **Anti-Bot**: Detección de scrapers, scanners y headless browsers
✅ **TLS/SSL**: Configuración moderna con HSTS, OCSP stapling
✅ **Rate Limiting**: Protección contra brute force y DDoS
✅ **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options, etc.

### Quick Start con WAF

```bash
# Setup automático (recomendado)
bash scripts/setup-waf.sh

# Iniciar con WAF
docker-compose -f docker-compose-waf.yml up -d

# Verificar estado
curl -k https://localhost/health
bash scripts/test-waf.sh
```

### Documentación WAF

- 📘 [Quick Start Guide](WAF_README.md) - Inicio rápido
- 📕 [Documentación Completa](WAF_DOCUMENTATION.md) - Guía detallada (130+ páginas)
- 🚀 [Production Deployment](PRODUCTION_DEPLOYMENT.md) - Despliegue en producción
- 📊 [Monitoreo](scripts/monitor-waf.sh) - Script interactivo de monitoreo

### Arquitectura

```
Internet → [Nginx WAF:443] → [Frontend:5173] + [GraphQL Gateway:4000]
            ↓ ModSecurity
            ↓ OWASP CRS
            ↓ Custom Rules
```

---

## 🛠️ Instalación

### 1. Clona el repositorio
```bash
git clone <url-del-repositorio>
cd FRONTEND
```

### 2. Docker
docker-compose up --build

Corre en el puerto 5173



This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
