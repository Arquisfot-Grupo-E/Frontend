# Laboratory 5 - Security / Reverse Proxy Pattern

## Integrantes - Equipo 1E

- Diana Valentina Chicuasuque Rodríguez
- Laura Valentina Pabón Cabezas
- Diego Felipe Solórzano Aponte
- Manuel Eduardo Quintana Umbarila
- Daniel Santiago Ramírez Rocha
- Gian Emanuel Morales González
- Luis Esteban León Rojas

## Introducción

El laboratorio 5 tiene como objetivo implementar un patrón arquitectónico de seguridad en el contexto de un proyecto de software. En este caso, se trabajó con el patrón de Reverse Proxy, el cual permite centralizar y controlar el acceso a los servicios backend mediante un servidor intermediario.

Para este laboratorio, la implementación se realizó en el proyecto del grupo 1E: **Bookworm**. Este proyecto sirvió como base para aplicar el patrón de Reverse Proxy y mejorar la seguridad del sistema.

## Vista Arquitectónica

### Vista antes de agregar Reverse Proxy
![original](images/original.svg)

### Vista con Reverse Proxy añadido
![updated](images/updated.svg)

### Descripción del cambio

Se agregó **Nginx** como capa de Reverse Proxy entre los clientes y los servicios backend. Nginx actúa como punto único de entrada en el puerto 80 y redirige las peticiones según la ruta:
- `/` → Frontend Server (puerto 5173)
- `/graphql` → API Gateway (puerto 4000)

Esto oculta la infraestructura interna y centraliza el control de acceso al sistema.

## Descripción del Patrón

El **Reverse Proxy Pattern** es un patrón arquitectónico en el cual un servidor intermediario (proxy inverso) se posiciona entre los clientes y los servidores backend. A diferencia de un proxy tradicional que representa a los clientes, el reverse proxy representa a los servidores.

**Propósito:**
- Centralizar el punto de entrada al sistema
- Ocultar la estructura y ubicación de los servicios internos
- Proporcionar una capa adicional de seguridad y control
- Facilitar el balanceo de carga y la escalabilidad
- Simplificar la gestión de certificados SSL/TLS y políticas de acceso

## Escenario de Calidad Abordado

**Atributo de Calidad:** Seguridad (Security)

**Escenario:**
El sistema debe proteger el acceso a los servicios backend ocultando la infraestructura interna y centralizando el control de acceso. Los clientes externos no deben tener conocimiento directo de los puertos, direcciones IP o arquitectura de los servicios internos.

**Estímulo:** Un cliente (web o móvil) intenta acceder a los servicios del sistema.

**Respuesta:** El Reverse Proxy intercepta todas las peticiones, valida y redirige al servicio correspondiente sin exponer información sobre la infraestructura interna.

**Medida:** 
- Los servicios backend (Frontend Server y Gateway) no son accesibles directamente desde el exterior
- Todas las peticiones pasan por el punto único de entrada (Nginx en puerto 80)
- Los clientes desconocen los puertos internos de los servicios (5173, 4000)

## Pasos de Implementación

### Prerrequisitos

Antes de implementar el patrón de Reverse Proxy, hay que verificar tener instalado:
- **Docker** y **Docker Compose**: Para la creación y gestión de contenedores
- **Nginx**: Se utilizará como imagen de Docker, por lo que no es necesario instalarlo localmente

Para verificar que Docker está instalado:
```bash
docker --version
docker-compose --version
```

### Paso 1: Crear el archivo de configuración de Nginx

Se crea un archivo llamado `nginx.conf` en la raíz del proyecto con la siguiente configuración:

```nginx
worker_processes 1;

events {
  worker_connections 1024;
}

http {
  # Definir upstream para el frontend
  upstream frontend {
    server frontend:5173;
  }

  # Definir upstream para el gateway
  upstream gateway {
    server gateway:4000;
  }

  server {
    listen 80;

    # Redirigir peticiones a la raíz hacia el frontend
    location / {
      proxy_pass http://frontend;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_cache_bypass $http_upgrade;
    }

    # Redirigir peticiones a /graphql hacia el gateway
    location /graphql {
      proxy_pass http://gateway;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

**Explicación de la configuración:**
- `upstream`: Define los servicios backend y sus puertos internos
- `location /`: Redirige todas las peticiones a la raíz hacia el servicio frontend
- `location /graphql`: Redirige las peticiones GraphQL hacia el gateway
- `proxy_set_header`: Preserva información importante del cliente original en las cabeceras HTTP
- `Upgrade` y `Connection 'upgrade'`: Habilita soporte para WebSockets

### Paso 2: Actualizar el archivo docker-compose.yml

Agregar el servicio de Nginx al archivo `docker-compose.yml`:

```yaml
services:
  frontend:
    build: .
    container_name: bookworm_frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_GRAPHQL_URL=http://gateway:4000/graphql
    networks:
      - bookworm_network

  gateway:
    build:
      context: ../Middleware-Graphql
    container_name: graphql_gateway
    ports:
      - "4000:4000"
    networks:
      - bookworm_network

  # Servicio de Nginx como Reverse Proxy
  nginx:
    image: nginx:latest
    container_name: bookworm_nginx
    ports:
      - "80:80"  # Exponer el puerto 80 al exterior
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro  # Montar configuración personalizada
    depends_on:
      - frontend
      - gateway
    networks:
      - bookworm_network

networks:
  bookworm_network:
    external: true
    name: bookworm_network
```

**Puntos clave:**
- `image: nginx:latest`: Utiliza la imagen oficial de Nginx
- `ports: "80:80"`: Expone el puerto 80 del contenedor al puerto 80 del host
- `volumes`: Monta el archivo `nginx.conf` local dentro del contenedor en modo solo lectura (`:ro`)
- `depends_on`: Asegura que Nginx se inicie después del frontend y el gateway

### Paso 3: Configurar la red de Docker

Asegurarse de que todos los servicios estén en la misma red de Docker para que puedan comunicarse entre sí. Si la red no existe, debe crearse:

```bash
docker network create bookworm_network
```

### Paso 4: Construir y levantar los servicios

Ejecutar el siguiente comando para construir las imágenes y levantar todos los contenedores:

```bash
docker-compose up --build
```

Esto iniciará:
1. El contenedor del frontend (puerto interno 5173)
2. El contenedor del gateway (puerto interno 4000)
3. El contenedor de Nginx (puerto externo 80)

### Paso 5: Verificar la implementación

Una vez que los contenedores estén corriendo, verificar que el reverse proxy funciona correctamente:

**a) Verificar que los contenedores están activos:**
```bash
docker ps
```

Deberían verse tres contenedores corriendo: `bookworm_frontend`, `graphql_gateway` y `bookworm_nginx`.

**b) Acceder al frontend a través de Nginx:**
Abrir el navegador y acceder a:
```
http://localhost
```

El reverse proxy debe redirigir la petición al frontend.

**c) Probar el endpoint de GraphQL:**
Se puede hacer una petición a GraphQL a través del reverse proxy:
```bash
curl -X POST http://localhost/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

**d) Verificar los logs de Nginx:**
```bash
docker logs bookworm_nginx
```

Esto mostrará las peticiones que Nginx está procesando.

### Paso 6: Verificar que los puertos internos no son accesibles directamente

Para confirmar que el patrón de seguridad está funcionando, verificar que:
- Los servicios internos (5173, 4000) no son accesibles directamente desde el navegador si no están expuestos explícitamente
- Todas las peticiones deben pasar por el puerto 80 (Nginx)

**Opcional:** Si se desea ocultar completamente los puertos internos, modificar el `docker-compose.yml` para no exponerlos:

```yaml
services:
  frontend:
    build: .
    container_name: bookworm_frontend
    # Eliminar la exposición de puertos externos
    # ports:
    #   - "5173:5173"
    networks:
      - bookworm_network

  gateway:
    build:
      context: ../Middleware-Graphql
    container_name: graphql_gateway
    # Eliminar la exposición de puertos externos
    # ports:
    #   - "4000:4000"
    networks:
      - bookworm_network
```

De esta manera, solo Nginx (puerto 80) estará accesible desde el exterior.

### Paso 7: Detener los servicios

Cuando se haya terminado de probar, detener todos los contenedores con:

```bash
docker-compose down
```

## Resultados y Mejoras Observadas

### Mejoras en Seguridad

**Antes de la implementación:**
- Los servicios backend estaban expuestos directamente en puertos específicos (5173, 4000)
- Los clientes necesitaban conocer la arquitectura interna del sistema
- No existía un punto centralizado de control de acceso

**Después de la implementación:**
- **Ocultamiento de infraestructura**: Los clientes solo conocen el puerto 80, sin información sobre servicios internos
- **Punto único de entrada**: Todas las peticiones pasan por Nginx, facilitando la implementación de políticas de seguridad
- **Reducción de superficie de ataque**: Menor exposición de servicios al exterior

### Mejoras en Arquitectura

1. **Simplicidad para el cliente**: 
   - Antes: `http://localhost:5173` y `http://localhost:4000/graphql`
   - Ahora: `http://localhost` y `http://localhost/graphql`

2. **Flexibilidad**: Los cambios en la infraestructura backend (puertos, servidores) no afectan a los clientes

3. **Escalabilidad**: El reverse proxy facilita la adición de balanceo de carga y múltiples instancias de servicios

4. **Mantenibilidad**: Configuración centralizada de enrutamiento y políticas de acceso

### Resultados de Pruebas

**Acceso al Frontend:**
- URL: `http://localhost/`
- Estado: Funcionando correctamente

**Acceso al Gateway GraphQL:**
- URL: `http://localhost/graphql`
- Estado: Funcionando correctamente
- Las consultas GraphQL se procesan sin problemas

**Verificación de seguridad:**
- Los puertos 5173 y 4000 pueden configurarse para no ser accesibles directamente
- Todas las peticiones pasan obligatoriamente por el puerto 80
- Los logs de Nginx registran todas las peticiones entrantes

### Beneficios Adicionales

- **Preparación para HTTPS**: La configuración de Nginx facilita la implementación de certificados SSL/TLS
- **Posibilidad de implementar rate limiting**: Para proteger contra ataques de fuerza bruta o DDoS
- **Logs centralizados**: Todas las peticiones quedan registradas en un único punto
- **Base para futuras mejoras**: El reverse proxy permite agregar fácilmente autenticación, CORS, compresión, etc.

## Recomendaciones para Otros Equipos

Si se desea replicar esta implementación en otro proyecto, se deben considerar las siguientes recomendaciones:

### 1. Adaptación de Puertos y Servicios

**⚠️ Importante**: Los puertos utilizados en este ejemplo (5173, 4000) son específicos del proyecto Bookworm. Se deben ajustarl según la infraestructura:

```nginx
upstream tu_frontend {
  server tu_servicio_frontend:TU_PUERTO;  # Reemplaza con tu puerto
}

upstream tu_backend {
  server tu_servicio_backend:TU_PUERTO;   # Reemplaza con tu puerto
}
```

### 2. Configuración de Redes Docker

Se debe asegurar que todos los servicios estén en la misma red de Docker para que puedan comunicarse:

```yaml
networks:
  tu_red_personalizada:      # Usa el nombre de tu red
    external: true
    name: tu_red_personalizada
```

Verificar que la red exista antes de levantar los servicios:
```bash
docker network create tu_red_personalizada
```

### 3. Nombres de Servicios Consistentes

Los nombres de servicios en `docker-compose.yml` deben coincidir con los nombres en `nginx.conf`:

```yaml
# docker-compose.yml
services:
  mi_frontend:  # Este nombre debe usarse en nginx.conf
    ...
```

```nginx
# nginx.conf
upstream mi_frontend {
  server mi_frontend:puerto;  # Mismo nombre aquí
}
```

### 4. Rutas de Enrutamiento

Definir las rutas según los endpoints de la aplicación. Por ejemplo:

```nginx
location /api {
  proxy_pass http://tu_api_backend;
}

location /auth {
  proxy_pass http://tu_servicio_auth;
}
```

### 5. Configuración de CORS (si es necesario)

Si el frontend y backend están en dominios diferentes, puede que se necesite configurar CORS en Nginx:

```nginx
location /api {
  add_header 'Access-Control-Allow-Origin' '*';
  add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
  add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
  
  proxy_pass http://tu_backend;
}
```



