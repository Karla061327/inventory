# GUÍA DE PRUEBAS DE API - Sistema de Gestión de Inventario

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Autenticación](#autenticación)
3. [Usuarios](#usuarios)
4. [Categorías](#categorías)
5. [Proveedores](#proveedores)
6. [Productos](#productos)
7. [Inventario](#inventario)
8. [Notas Importantes](#notas-importantes)

---

## Configuración Inicial

### Variables de Entorno
Asegúrate de tener un archivo `.env` en el directorio `inventory/` con:

```env 
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=inventory_db

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRATION=1h

# Server
PORT=3000
NODE_ENV=development
```

### Iniciar el Servidor

```bash
cd inventory
npm install
npm run start:dev
```

El servidor estará disponible en `http://localhost:3000`

### Documentación Swagger
Una vez iniciado el servidor, accede a:
```
http://localhost:3000/api
```

---

## Autenticación

### 1. Crear Usuario Inicial (Admin)

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "email": "admin@inventory.com",
  "password": "Admin123!",
  "firstName": "Admin",
  "lastName": "Sistema",
  "role": "admin"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "Sistema",
    "role": "admin"
  }'
```

**Respuesta Esperada (201):**
```json
{
  "id": 1,
  "email": "admin@inventory.com",
  "firstName": "Admin",
  "lastName": "Sistema",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-12-20T10:30:00.000Z",
  "updatedAt": "2024-12-20T10:30:00.000Z"
}
```

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "admin@inventory.com",
  "password": "Admin123!"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "Admin123!"
  }'
```

**Respuesta Esperada (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "admin@inventory.com",
    "role": "admin"
  }
}
```

**⚠️ IMPORTANTE:** Guarda el `access_token` para usarlo en las siguientes peticiones.

---

### 3. Obtener Perfil de Usuario

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer {tu_access_token}
```

**cURL:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Respuesta Esperada (200):**
```json
{
  "userId": 1,
  "email": "admin@inventory.com",
  "role": "admin",
  "iat": 1703073000,
  "exp": 1703076600
}
```

---

## Usuarios

**Nota:** Todos los endpoints de usuarios requieren autenticación (Bearer Token).

### 1. Crear Usuario

**Endpoint:** `POST /users`

**Headers:**
```
Authorization: Bearer {tu_access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "gerente@inventory.com",
  "password": "Gerente123!",
  "firstName": "Carlos",
  "lastName": "Rodríguez",
  "role": "manager"
}
```

**Roles Disponibles:**
- `admin` - Administrador (acceso total)
- `manager` - Gerente (gestión de inventario)
- `seller` - Vendedor (solo consultas y ventas)

**cURL:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gerente@inventory.com",
    "password": "Gerente123!",
    "firstName": "Carlos",
    "lastName": "Rodríguez",
    "role": "manager"
  }'
```

---

### 2. Listar Usuarios

**Endpoint:** `GET /users`

**cURL:**
```bash
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 3. Obtener Usuario por ID

**Endpoint:** `GET /users/:id`

**cURL:**
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 4. Actualizar Usuario

**Endpoint:** `PATCH /users/:id`

**Request Body:**
```json
{
  "firstName": "Carlos Alberto",
  "role": "admin"
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/users/2 \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Carlos Alberto",
    "role": "admin"
  }'
```

---

### 5. Cambiar Contraseña

**Endpoint:** `PATCH /users/:id/change-password`

**Request Body:**
```json
{
  "currentPassword": "Gerente123!",
  "newPassword": "NuevaPass456!"
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/users/2/change-password \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Gerente123!",
    "newPassword": "NuevaPass456!"
  }'
```

---

### 6. Desactivar Usuario

**Endpoint:** `DELETE /users/:id`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

## Categorías

### 1. Crear Categoría

**Endpoint:** `POST /categories`

**Request Body:**
```json
{
  "name": "Electrónica",
  "description": "Productos electrónicos y tecnología",
  "status": "active"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electrónica",
    "description": "Productos electrónicos y tecnología",
    "status": "active"
  }'
```

**Respuesta Esperada (201):**
```json
{
  "id": 1,
  "name": "Electrónica",
  "description": "Productos electrónicos y tecnología",
  "status": "active",
  "createdAt": "2024-12-20T10:35:00.000Z"
}
```

---

### 2. Listar Categorías

**Endpoint:** `GET /categories`

**cURL:**
```bash
curl -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 3. Obtener Categoría por ID

**Endpoint:** `GET /categories/:id`

**cURL:**
```bash
curl -X GET http://localhost:3000/categories/1 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 4. Actualizar Categoría

**Endpoint:** `PATCH /categories/:id`

**Request Body:**
```json
{
  "description": "Productos electrónicos, tecnología y accesorios"
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/categories/1 \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Productos electrónicos, tecnología y accesorios"
  }'
```

---

### 5. Eliminar Categoría

**Endpoint:** `DELETE /categories/:id`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/categories/1 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

## Proveedores

### 1. Crear Proveedor

**Endpoint:** `POST /suppliers`

**Request Body:**
```json
{
  "name": "Tech Supplies Inc",
  "contactEmail": "ventas@techsupplies.com",
  "phone": "+1-555-0123",
  "address": "123 Tech Street, Silicon Valley, CA 94025",
  "status": "active"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/suppliers \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Supplies Inc",
    "contactEmail": "ventas@techsupplies.com",
    "phone": "+1-555-0123",
    "address": "123 Tech Street, Silicon Valley, CA 94025",
    "status": "active"
  }'
```

**Respuesta Esperada (201):**
```json
{
  "id": 1,
  "name": "Tech Supplies Inc",
  "contactEmail": "ventas@techsupplies.com",
  "phone": "+1-555-0123",
  "address": "123 Tech Street, Silicon Valley, CA 94025",
  "status": "active",
  "createdAt": "2024-12-20T10:40:00.000Z"
}
```

---

### 2. Listar Proveedores

**Endpoint:** `GET /suppliers`

**cURL:**
```bash
curl -X GET http://localhost:3000/suppliers \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 3. Obtener Proveedor por ID

**Endpoint:** `GET /suppliers/:id`

**cURL:**
```bash
curl -X GET http://localhost:3000/suppliers/1 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 4. Actualizar Proveedor

**Endpoint:** `PATCH /suppliers/:id`

**Request Body:**
```json
{
  "phone": "+1-555-9999",
  "address": "456 New Address, Silicon Valley, CA 94025"
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/suppliers/1 \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1-555-9999",
    "address": "456 New Address, Silicon Valley, CA 94025"
  }'
```

---

### 5. Desactivar Proveedor

**Endpoint:** `DELETE /suppliers/:id`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/suppliers/1 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

## Productos

### 1. Crear Producto

**Endpoint:** `POST /products`

**Request Body:**
```json
{
  "sku": "LAPTOP-001",
  "name": "Laptop Dell XPS 15",
  "barcode": "5901234123457",
  "description": "Laptop de alto rendimiento con pantalla 4K",
  "categoryId": 1,
  "costPrice": 999.99,
  "salePrice": 1499.99,
  "reorderPoint": 5,
  "status": "active",
  "imageUrl": "https://example.com/images/laptop-dell-xps15.jpg",
  "supplierId": 1
}
```

**Campos Obligatorios:**
- `sku` - Código único del producto
- `name` - Nombre del producto
- `categoryId` - ID de categoría (debe existir)
- `costPrice` - Precio de costo
- `salePrice` - Precio de venta (debe ser mayor que costPrice)

**cURL:**
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LAPTOP-001",
    "name": "Laptop Dell XPS 15",
    "barcode": "5901234123457",
    "description": "Laptop de alto rendimiento con pantalla 4K",
    "categoryId": 1,
    "costPrice": 999.99,
    "salePrice": 1499.99,
    "reorderPoint": 5,
    "status": "active",
    "imageUrl": "https://example.com/images/laptop-dell-xps15.jpg",
    "supplierId": 1
  }'
```

**Respuesta Esperada (201):**
```json
{
  "id": 1,
  "sku": "LAPTOP-001",
  "name": "Laptop Dell XPS 15",
  "barcode": "5901234123457",
  "description": "Laptop de alto rendimiento con pantalla 4K",
  "categoryId": 1,
  "costPrice": 999.99,
  "salePrice": 1499.99,
  "reorderPoint": 5,
  "status": "active",
  "imageUrl": "https://example.com/images/laptop-dell-xps15.jpg",
  "supplierId": 1,
  "createdAt": "2024-12-20T10:45:00.000Z",
  "updatedAt": "2024-12-20T10:45:00.000Z"
}
```

---

### 2. Listar Productos (con filtros y paginación)

**Endpoint:** `GET /products`

**Query Parameters:**
- `page` - Número de página (default: 1)
- `limit` - Items por página (default: 25)
- `search` - Búsqueda por nombre, SKU o barcode
- `categoryId` - Filtrar por categoría
- `status` - Filtrar por estado (active, inactive, discontinued)
- `sortBy` - Ordenar por (name, sku, price, stock)
- `order` - Orden (ASC, DESC)

**Ejemplos:**

```bash
# Listar todos los productos
curl -X GET "http://localhost:3000/products" \
  -H "Authorization: Bearer {tu_access_token}"

# Búsqueda
curl -X GET "http://localhost:3000/products?search=laptop" \
  -H "Authorization: Bearer {tu_access_token}"

# Filtrar por categoría
curl -X GET "http://localhost:3000/products?categoryId=1" \
  -H "Authorization: Bearer {tu_access_token}"

# Paginación
curl -X GET "http://localhost:3000/products?page=1&limit=10" \
  -H "Authorization: Bearer {tu_access_token}"

# Ordenamiento
curl -X GET "http://localhost:3000/products?sortBy=price&order=DESC" \
  -H "Authorization: Bearer {tu_access_token}"

# Combinado
curl -X GET "http://localhost:3000/products?search=laptop&categoryId=1&page=1&limit=10&sortBy=price&order=ASC" \
  -H "Authorization: Bearer {tu_access_token}"
```

**Respuesta Esperada (200):**
```json
{
  "data": [
    {
      "id": 1,
      "sku": "LAPTOP-001",
      "name": "Laptop Dell XPS 15",
      "salePrice": 1499.99,
      "category": {
        "id": 1,
        "name": "Electrónica"
      },
      "supplier": {
        "id": 1,
        "name": "Tech Supplies Inc"
      },
      "inventory": {
        "id": 1,
        "currentStock": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1,
    "pages": 1
  }
}
```

---

### 3. Obtener Producto por ID

**Endpoint:** `GET /products/:id`

**cURL:**
```bash
curl -X GET http://localhost:3000/products/1 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 4. Obtener Producto por SKU

**Endpoint:** `GET /products/sku/:sku`

**cURL:**
```bash
curl -X GET http://localhost:3000/products/sku/LAPTOP-001 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 5. Obtener Producto por Código de Barras

**Endpoint:** `GET /products/barcode/:barcode`

**cURL:**
```bash
curl -X GET http://localhost:3000/products/barcode/5901234123457 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

### 6. Actualizar Producto

**Endpoint:** `PATCH /products/:id`

**Request Body:**
```json
{
  "salePrice": 1399.99,
  "reorderPoint": 10,
  "description": "Laptop de alto rendimiento con pantalla 4K y 16GB RAM"
}
```

**cURL:**
```bash
curl -X PATCH http://localhost:3000/products/1 \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "salePrice": 1399.99,
    "reorderPoint": 10,
    "description": "Laptop de alto rendimiento con pantalla 4K y 16GB RAM"
  }'
```

---

### 7. Desactivar Producto

**Endpoint:** `DELETE /products/:id`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/products/1 \
  -H "Authorization: Bearer {tu_access_token}"
```

---

## Inventario

### 1. Entrada de Inventario (Compra/Recepción)

**Endpoint:** `POST /inventory/entry`

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 50,
  "referenceDoc": "PO-2024-001",
  "notes": "Compra inicial de laptops Dell XPS 15"
}
```

**Campos Obligatorios:**
- `productId` - ID del producto
- `quantity` - Cantidad a agregar (debe ser > 0)

**cURL:**
```bash
curl -X POST http://localhost:3000/inventory/entry \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 50,
    "referenceDoc": "PO-2024-001",
    "notes": "Compra inicial de laptops Dell XPS 15"
  }'
```

**Respuesta Esperada (201):**
```json
{
  "id": 1,
  "productId": 1,
  "movementType": "entry",
  "quantity": 50,
  "stockBefore": 0,
  "stockAfter": 50,
  "referenceDoc": "PO-2024-001",
  "notes": "Compra inicial de laptops Dell XPS 15",
  "createdById": 1,
  "createdAt": "2024-12-20T11:00:00.000Z"
}
```

---

### 2. Salida de Inventario (Venta/Pérdida/Daño)

**Endpoint:** `POST /inventory/exit`

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2,
  "exitType": "sale",
  "referenceDoc": "SALE-2024-001",
  "notes": "Venta a cliente corporativo"
}
```

**Tipos de Salida (`exitType`):**
- `sale` - Venta
- `damaged` - Producto dañado
- `loss` - Pérdida
- `adjustment` - Ajuste

**cURL:**
```bash
curl -X POST http://localhost:3000/inventory/exit \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 2,
    "exitType": "sale",
    "referenceDoc": "SALE-2024-001",
    "notes": "Venta a cliente corporativo"
  }'
```

**Respuesta Esperada (201):**
```json
{
  "id": 2,
  "productId": 1,
  "movementType": "sale",
  "quantity": 2,
  "stockBefore": 50,
  "stockAfter": 48,
  "referenceDoc": "SALE-2024-001",
  "notes": "Venta a cliente corporativo",
  "createdById": 1,
  "createdAt": "2024-12-20T11:05:00.000Z"
}
```

---

### 3. Ajuste de Inventario (Conteo Físico)

**Endpoint:** `POST /inventory/adjustment`

**Request Body:**
```json
{
  "productId": 1,
  "newQuantity": 47,
  "reason": "Conteo físico - producto dañado encontrado",
  "imageUrl": "https://example.com/evidence/damaged-laptop.jpg"
}
```

**Campos Obligatorios:**
- `productId` - ID del producto
- `newQuantity` - Nueva cantidad después del ajuste
- `reason` - Razón del ajuste

**⚠️ Importante:** Si el ajuste es mayor al 10% del stock actual, se requiere `imageUrl` como evidencia.

**cURL:**
```bash
curl -X POST http://localhost:3000/inventory/adjustment \
  -H "Authorization: Bearer {tu_access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "newQuantity": 47,
    "reason": "Conteo físico - producto dañado encontrado",
    "imageUrl": "https://example.com/evidence/damaged-laptop.jpg"
  }'
```

**Respuesta Esperada (201):**
```json
{
  "id": 3,
  "productId": 1,
  "movementType": "adjustment",
  "quantity": 1,
  "stockBefore": 48,
  "stockAfter": 47,
  "notes": "Conteo físico - producto dañado encontrado - Evidence: https://example.com/evidence/damaged-laptop.jpg",
  "createdById": 1,
  "createdAt": "2024-12-20T11:10:00.000Z"
}
```

---

### 4. Obtener Stock Actual de un Producto

**Endpoint:** `GET /inventory/stock/:productId`

**cURL:**
```bash
curl -X GET http://localhost:3000/inventory/stock/1 \
  -H "Authorization: Bearer {tu_access_token}"
```

**Respuesta Esperada (200):**
```json
{
  "id": 1,
  "productId": 1,
  "currentStock": 47,
  "lastMovementAt": "2024-12-20T11:10:00.000Z",
  "updatedAt": "2024-12-20T11:10:00.000Z",
  "product": {
    "id": 1,
    "sku": "LAPTOP-001",
    "name": "Laptop Dell XPS 15",
    "reorderPoint": 5
  }
}
```

---

### 5. Obtener Todo el Inventario

**Endpoint:** `GET /inventory`

**cURL:**
```bash
curl -X GET http://localhost:3000/inventory \
  -H "Authorization: Bearer {tu_access_token}"
```

**Respuesta Esperada (200):**
```json
{
  "data": [
    {
      "id": 1,
      "productId": 1,
      "currentStock": 47,
      "lastMovementAt": "2024-12-20T11:10:00.000Z",
      "product": {
        "id": 1,
        "sku": "LAPTOP-001",
        "name": "Laptop Dell XPS 15",
        "costPrice": 999.99,
        "salePrice": 1399.99,
        "reorderPoint": 5,
        "category": {
          "id": 1,
          "name": "Electrónica"
        },
        "supplier": {
          "id": 1,
          "name": "Tech Supplies Inc"
        }
      }
    }
  ],
  "summary": {
    "totalProducts": 1,
    "totalValue": 46999.53,
    "lowStockCount": 0
  }
}
```

---

### 6. Historial de Movimientos

**Endpoint:** `GET /inventory/movements`

**Query Parameters:**
- `productId` - Filtrar por producto específico
- `movementType` - Filtrar por tipo (entry, sale, damaged, loss, adjustment)
- `startDate` - Fecha inicial (ISO 8601)
- `endDate` - Fecha final (ISO 8601)
- `page` - Número de página (default: 1)
- `limit` - Items por página (default: 50)

**Ejemplos:**

```bash
# Todos los movimientos
curl -X GET "http://localhost:3000/inventory/movements" \
  -H "Authorization: Bearer {tu_access_token}"

# Movimientos de un producto específico
curl -X GET "http://localhost:3000/inventory/movements?productId=1" \
  -H "Authorization: Bearer {tu_access_token}"

# Movimientos por tipo
curl -X GET "http://localhost:3000/inventory/movements?movementType=sale" \
  -H "Authorization: Bearer {tu_access_token}"

# Movimientos por rango de fechas
curl -X GET "http://localhost:3000/inventory/movements?startDate=2024-12-01&endDate=2024-12-31" \
  -H "Authorization: Bearer {tu_access_token}"

# Combinado
curl -X GET "http://localhost:3000/inventory/movements?productId=1&movementType=entry&startDate=2024-12-01&page=1&limit=10" \
  -H "Authorization: Bearer {tu_access_token}"
```

**Respuesta Esperada (200):**
```json
{
  "data": [
    {
      "id": 3,
      "productId": 1,
      "movementType": "adjustment",
      "quantity": 1,
      "stockBefore": 48,
      "stockAfter": 47,
      "referenceDoc": null,
      "notes": "Conteo físico - producto dañado encontrado - Evidence: https://example.com/evidence/damaged-laptop.jpg",
      "createdAt": "2024-12-20T11:10:00.000Z",
      "product": {
        "id": 1,
        "sku": "LAPTOP-001",
        "name": "Laptop Dell XPS 15"
      },
      "createdBy": {
        "id": 1,
        "email": "admin@inventory.com",
        "firstName": "Admin",
        "lastName": "Sistema"
      }
    },
    {
      "id": 2,
      "productId": 1,
      "movementType": "sale",
      "quantity": 2,
      "stockBefore": 50,
      "stockAfter": 48,
      "referenceDoc": "SALE-2024-001",
      "notes": "Venta a cliente corporativo",
      "createdAt": "2024-12-20T11:05:00.000Z",
      "product": {
        "id": 1,
        "sku": "LAPTOP-001",
        "name": "Laptop Dell XPS 15"
      },
      "createdBy": {
        "id": 1,
        "email": "admin@inventory.com",
        "firstName": "Admin",
        "lastName": "Sistema"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 3,
    "pages": 1
  }
}
```

---

## Notas Importantes

### 1. Autenticación
- Todos los endpoints (excepto `/auth/login`) requieren el header `Authorization: Bearer {token}`
- Los tokens expiran según la configuración de `JWT_EXPIRATION` (default: 1 hora)
- Si recibes un error 401, obtén un nuevo token haciendo login nuevamente

### 2. Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Operación exitosa sin contenido de respuesta |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - No autorizado para esta acción |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: SKU duplicado) |
| 500 | Internal Server Error - Error del servidor |

### 3. Errores Comunes

**Error: SKU already exists**
```json
{
  "statusCode": 409,
  "message": "SKU already exists",
  "error": "Conflict"
}
```
Solución: Usa un SKU diferente

**Error: Insufficient stock**
```json
{
  "statusCode": 400,
  "message": "Insufficient stock. Available: 5, Requested: 10",
  "error": "Bad Request"
}
```
Solución: Verifica el stock disponible antes de hacer la salida

**Error: Sale price must be greater than cost price**
```json
{
  "statusCode": 400,
  "message": "Sale price must be greater than cost price",
  "error": "Bad Request"
}
```
Solución: Asegúrate de que `salePrice` > `costPrice`

**Error: Adjustments >10% require evidence**
```json
{
  "statusCode": 400,
  "message": "Adjustments greater than 10% require photographic evidence (imageUrl)",
  "error": "Bad Request"
}
```
Solución: Incluye el campo `imageUrl` en el ajuste

### 4. Flujo Recomendado de Prueba

1. **Configuración Inicial**
   - Crear usuario admin
   - Login para obtener token

2. **Setup de Datos Maestros**
   - Crear categorías
   - Crear proveedores

3. **Gestión de Productos**
   - Crear productos
   - Listar y buscar productos

4. **Operaciones de Inventario**
   - Registrar entrada de stock
   - Consultar stock actual
   - Registrar salidas (ventas)
   - Hacer ajustes si es necesario
   - Revisar historial de movimientos

### 5. Herramientas Recomendadas

- **Postman** - Colección de pruebas con interfaz gráfica
- **Thunder Client** - Extension de VS Code
- **cURL** - Línea de comandos (incluido en todos los ejemplos)
- **Swagger UI** - `http://localhost:3000/api` (documentación interactiva)

### 6. Variables de Entorno para Postman

Si usas Postman, configura estas variables:

```
baseUrl: http://localhost:3000
token: {tu_access_token_aqui}
```

Luego puedes usar:
- `{{baseUrl}}/products`
- Header: `Authorization: Bearer {{token}}`

---

## Próximos Pasos

Una vez que hayas probado todas las funcionalidades básicas:

1. Implementar el módulo de **Alertas** para notificaciones de stock bajo
2. Implementar el módulo de **Reportes** para análisis de inventario
3. Crear el **Frontend** en React
4. Configurar **Tests automatizados**

---

**Fecha de creación:** 2024-12-20
**Versión:** 1.0
**Autor:** Sistema de Inventario
