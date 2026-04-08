# Guía de Deployment

## Sistema de Gestión de Inventario

---

## Opciones de Deployment

### Opción 1: Docker Compose (Recomendado)

#### Prerequisitos
- Docker 20.10+
- Docker Compose 2.0+

#### Pasos

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd inventory
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con valores de producción
```

3. **Variables importantes para producción**
```env
NODE_ENV=production
JWT_SECRET=<genera-un-string-aleatorio-de-64-caracteres>
DB_PASSWORD=<contraseña-segura>
```

4. **Iniciar servicios**
```bash
# Solo API y PostgreSQL
docker-compose up -d

# Con pgAdmin para administración
docker-compose --profile tools up -d
```

5. **Verificar estado**
```bash
docker-compose ps
docker-compose logs -f api
```

6. **Acceder a la aplicación**
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- pgAdmin (opcional): http://localhost:5050

---

### Opción 2: Deployment Manual

#### Prerequisitos
- Node.js 20+
- PostgreSQL 14+
- npm o yarn

#### Pasos

1. **Instalar dependencias**
```bash
npm ci --only=production
```

2. **Compilar**
```bash
npm run build
```

3. **Configurar base de datos**
```bash
# Crear base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE inventory_db;"
```

4. **Configurar variables de entorno**
```bash
export NODE_ENV=production
export DB_HOST=localhost
export DB_PORT=5432
export DB_USERNAME=postgres
export DB_PASSWORD=<password>
export DB_DATABASE=inventory_db
export JWT_SECRET=<secret>
export PORT=3000
```

5. **Iniciar aplicación**
```bash
node dist/main.js
```

---

## Configuración de Producción

### Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto de la API | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de BD | `postgres` |
| `DB_PASSWORD` | Contraseña de BD | `SecurePass123!` |
| `DB_DATABASE` | Nombre de BD | `inventory_db` |
| `JWT_SECRET` | Secret para JWT | `random-64-char-string` |
| `JWT_EXPIRES_IN` | Expiración de token | `1h` |

### Generar JWT_SECRET Seguro
```bash
# Linux/Mac
openssl rand -base64 64

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## Health Checks

### Endpoint de Salud
```bash
curl http://localhost:3000/api
```

### Docker Health Check
El contenedor incluye health check automático que verifica:
- Respuesta del servidor en /api
- Intervalo: 30 segundos
- Timeout: 10 segundos
- Reintentos: 3

---

## Comandos Útiles

### Docker
```bash
# Ver logs
docker-compose logs -f api

# Reiniciar API
docker-compose restart api

# Reconstruir imagen
docker-compose build api

# Detener todo
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v
```

### Base de Datos
```bash
# Backup
docker exec inventory-postgres pg_dump -U postgres inventory_db > backup.sql

# Restore
cat backup.sql | docker exec -i inventory-postgres psql -U postgres inventory_db
```

---

## Escalabilidad

### Múltiples Instancias de API
```yaml
# docker-compose.override.yml
services:
  api:
    deploy:
      replicas: 3
```

### Load Balancer (Nginx)
```nginx
upstream inventory_api {
    server api:3000;
    server api:3001;
    server api:3002;
}

server {
    listen 80;

    location / {
        proxy_pass http://inventory_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoreo

### Logs
- Los logs se escriben en stdout/stderr
- Usar `docker logs` o sistema de logging centralizado

### Métricas Recomendadas
- Tiempo de respuesta de API
- Uso de CPU/Memoria
- Conexiones a base de datos
- Tasa de errores

---

## Seguridad

### Checklist de Producción
- [ ] JWT_SECRET único y seguro (mín 64 caracteres)
- [ ] Contraseñas de BD seguras
- [ ] HTTPS configurado (usar reverse proxy)
- [ ] Firewall configurado
- [ ] Acceso a pgAdmin restringido
- [ ] Backups automáticos configurados
- [ ] Rate limiting habilitado
- [ ] CORS configurado correctamente

### Rate Limiting (futuro)
```typescript
// Recomendado: implementar en app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100,
}),
```

---

## Troubleshooting

### Error: Cannot connect to database
```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps postgres

# Verificar logs
docker-compose logs postgres

# Verificar conectividad
docker exec inventory-api ping postgres
```

### Error: JWT invalid
- Verificar que JWT_SECRET es el mismo en todas las instancias
- Verificar que el token no ha expirado

### Error: Port already in use
```bash
# Encontrar proceso usando el puerto
lsof -i :3000

# Cambiar puerto en .env
PORT=3001
```

---

## Soporte

- Documentación API: `/api/docs`
- Issues: GitHub Issues
- Logs: `docker-compose logs`
