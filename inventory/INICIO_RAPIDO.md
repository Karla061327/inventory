# 🚀 GUÍA DE INICIO RÁPIDO

## Sistema de Gestión de Inventario

Esta guía te ayudará a poner en marcha el proyecto en menos de 5 minutos.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **PostgreSQL** 14+ ([descargar](https://www.postgresql.org/download/))
- **npm** o **yarn**

---

## 🔧 Instalación

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

**Opción A: PostgreSQL Local**

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear la base de datos
CREATE DATABASE inventory_db;

-- Salir
\q
```

**Opción B: PostgreSQL con Docker**

```bash
docker run --name inventory-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=inventory_db \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Configurar Variables de Entorno

El archivo `.env` ya está creado. Verifica que los valores sean correctos:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=inventory_db

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=1h

# Application
PORT=3000
NODE_ENV=development
```

⚠️ **IMPORTANTE**: Cambia `JWT_SECRET` en producción por un valor seguro.

---

## ▶️ Ejecutar la Aplicación

### Modo Desarrollo (con hot-reload)

```bash
npm run start:dev
```

La aplicación estará disponible en:
- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

### Modo Producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

---

## 🧪 Probar la API

### 1. Crear un Usuario (Admin)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "admin"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'
```

**Respuesta esperada**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "admin"
  }
}
```

### 3. Usar el Token

Copia el `access_token` y úsalo en las siguientes peticiones:

```bash
# Ejemplo: Obtener perfil
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

### 4. Crear una Categoría

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI" \
  -d '{
    "name": "Electrónica",
    "description": "Productos electrónicos y tecnología"
  }'
```

---

## 📚 Usar Swagger UI (Recomendado)

La forma más fácil de probar la API es usando Swagger:

1. Abre tu navegador en: http://localhost:3000/api/docs
2. Prueba el endpoint `POST /api/users` para crear un usuario admin
3. Usa `POST /api/auth/login` para obtener un token
4. Haz clic en el botón **"Authorize"** en la parte superior
5. Ingresa: `Bearer TU_TOKEN_AQUI`
6. Ahora puedes probar todos los endpoints protegidos

---

## 🗃️ Estructura de la Base de Datos

Las tablas se crean automáticamente cuando inicias la aplicación por primera vez (gracias a `synchronize: true`).

Tablas creadas:
- `users` - Usuarios del sistema
- `categories` - Categorías de productos
- `suppliers` - Proveedores
- `products` - Productos
- `inventory` - Stock actual
- `inventory_movements` - Historial de movimientos
- `alerts` - Alertas del sistema
- `audit_logs` - Logs de auditoría

---

## 🔐 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso total a todas las funcionalidades |
| **manager** | Puede gestionar productos, inventario y ver reportes |
| **seller** | Solo puede consultar stock y crear salidas |

---

## 📖 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (requiere auth)

### Usuarios (requiere rol admin)
- `POST /api/users` - Crear usuario
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `PATCH /api/users/:id/change-password` - Cambiar contraseña
- `DELETE /api/users/:id` - Desactivar usuario

### Categorías (requiere auth)
- `POST /api/categories` - Crear categoría
- `GET /api/categories` - Listar categorías
- `GET /api/categories/:id` - Obtener categoría
- `PATCH /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Desactivar categoría

---

## ⚠️ Solución de Problemas

### Error: "cannot connect to database"

**Problema**: No se puede conectar a PostgreSQL

**Solución**:
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # Windows
   sc query postgresql

   # Mac/Linux
   brew services list  # si usaste Homebrew
   sudo systemctl status postgresql
   ```

2. Verifica las credenciales en `.env`
3. Prueba la conexión manualmente:
   ```bash
   psql -U postgres -h localhost
   ```

### Error: "Nest can't resolve dependencies"

**Problema**: Dependencias no resueltas

**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port 3000 already in use"

**Problema**: El puerto ya está ocupado

**Solución**:
1. Cambia el puerto en `.env`:
   ```
   PORT=3001
   ```
2. O mata el proceso que usa el puerto 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -i :3000
   kill -9 <PID>
   ```

---

## 🧪 Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📊 Verificar que Todo Funciona

Lista de comprobación:

- [ ] ✅ La aplicación inicia sin errores
- [ ] ✅ Puedes acceder a http://localhost:3000/api/docs
- [ ] ✅ Puedes crear un usuario
- [ ] ✅ Puedes hacer login y recibir un token
- [ ] ✅ Puedes acceder a `/api/auth/profile` con el token
- [ ] ✅ Puedes crear una categoría

Si todas están marcadas, ¡estás listo! 🎉

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa el archivo `SPRINT_RESUMEN.md` para más detalles técnicos
2. Consulta los logs de la aplicación
3. Verifica los logs de PostgreSQL

---

## 🎯 Próximos Pasos

Ahora que tienes el proyecto funcionando:

1. **Explora la API** con Swagger
2. **Crea usuarios** con diferentes roles
3. **Revisa el código** en `src/` para entender la estructura
4. **Personaliza** según tus necesidades
5. **Contribuye** al Sprint 2 (ver `SPRINT_RESUMEN.md`)

---

**¡Disfruta desarrollando! 🚀**
