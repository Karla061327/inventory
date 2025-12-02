# 🧪 GUÍA COMPLETA DE PRUEBAS - API

## Sistema de Gestión de Inventario

Esta guía te permitirá probar todos los endpoints del sistema paso a paso.

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Autenticación](#autenticación)
3. [Usuarios](#usuarios)
4. [Categorías](#categorías)
5. [Proveedores](#proveedores)
6. [Productos](#productos)
7. [Inventario](#inventario)
8. [Flujos Completos](#flujos-completos)
9. [Casos de Error](#casos-de-error)
10. [Colección Postman](#colección-postman)

---

## 🚀 Configuración Inicial

### 1. Iniciar el Servidor

```bash
# Terminal 1: Asegúrate que PostgreSQL esté corriendo
# Terminal 2: Inicia la aplicación
npm run start:dev
```

Deberías ver:
```
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api/docs
```

### 2. Verificar que el Servidor Está Activo

```bash
curl http://localhost:3000/api/docs
```

### 3. Variables de Entorno

Para las siguientes pruebas, vamos a usar estas variables:

```bash
# Base URL
export BASE_URL="http://localhost:3000/api"

# Token (lo obtendremos después del login)
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsImVtYWlsIjoiYWRtaW1AaW52ZW50b3J5LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2NDYyNTY0NSwiZXhwIjoxNzY0NjI5MjQ1fQ.MjjhK64kFe2ztIwLPBN046zFQG4_Anb7a1LVVa4-4Kk"
```

---

## 🔐 AUTENTICACIÓN

### Paso 1: Crear el Primer Usuario (Admin)

```bash
curl -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "Principal",
    "role": "admin"
  }'
```

**Respuesta Esperada (201)**:
```json
{
  "id": 1,
  "email": "admin@inventory.com",
  "firstName": "Admin",
  "lastName": "Principal",
  "role": "admin",
  "isActive": true,
  "createdAt": "2024-11-29T...",
  "updatedAt": "2024-11-29T..."
}
```

### Paso 2: Login

```bash
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "Admin123!"
  }'
```

**Respuesta Esperada (200)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "email": "admin@inventory.com",
    "firstName": "Admin",
    "lastName": "Principal",
    "role": "admin"
  }
}
```

**🔑 IMPORTANTE**: Copia el `access_token` y guárdalo en la variable:

```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Paso 3: Verificar Autenticación

```bash
curl -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta Esperada (200)**:
```json
{
  "userId": 1,
  "email": "admin@inventory.com",
  "role": "admin"
}
```

**✅ CHECKPOINT**: Si llegaste aquí, la autenticación funciona correctamente.

---

## 👥 USUARIOS

### 1. Crear Usuario Manager

```bash
curl -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "manager@inventory.com",
    "password": "Manager123!",
    "firstName": "Juan",
    "lastName": "Pérez",
    "role": "manager"
  }'
```

### 2. Crear Usuario Seller

```bash
curl -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "seller@inventory.com",
    "password": "Seller123!",
    "firstName": "María",
    "lastName": "García",
    "role": "seller"
  }'
```

### 3. Listar Todos los Usuarios

```bash
curl -X GET $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta Esperada**: Array con 3 usuarios

### 4. Obtener Usuario por ID

```bash
curl -X GET $BASE_URL/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Actualizar Usuario

```bash
curl -X PATCH $BASE_URL/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Juan Carlos",
    "isActive": true
  }'
```

### 6. Cambiar Contraseña

```bash
curl -X PATCH $BASE_URL/users/1/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "Admin123!",
    "newPassword": "NewAdmin123!"
  }'
```

### 7. Desactivar Usuario

```bash
curl -X DELETE $BASE_URL/users/3 \
  -H "Authorization: Bearer $TOKEN"
```

**✅ CHECKPOINT**: Deberías tener 3 usuarios creados (1 admin, 1 manager, 1 seller)

---

## 📁 CATEGORÍAS 

### 1. Crear Categoría

```bash
curl -X POST $BASE_URL/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Electrónica",
    "description": "Productos electrónicos y tecn  ología"
  }'
```

### 2. Crear Más Categorías

```bash
# Categoría 2
curl -X POST $BASE_URL/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Muebles",
    "description": "Muebles de oficina y hogar"
  }'

# Categoría 3
curl -X POST $BASE_URL/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Papelería",
    "description": "Artículos de oficina y papelería"
  }'
```

### 3. Listar Categorías

```bash
curl -X GET $BASE_URL/categories \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Obtener Categoría por ID

```bash
curl -X GET $BASE_URL/categories/1 \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Actualizar Categoría

```bash
curl -X PATCH $BASE_URL/categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Productos electrónicos, tecnología e informática"
  }'
```

### 6. Desactivar Categoría

```bash
curl -X DELETE $BASE_URL/categories/3 \
  -H "Authorization: Bearer $TOKEN"
```

**✅ CHECKPOINT**: Deberías tener 3 categorías (2 activas)

---

## 🏢 PROVEEDORES

### 1. Crear Proveedor

```bash
curl -X POST $BASE_URL/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Tech Supplies Inc",
    "contactEmail": "contact@techsupplies.com",
    "phone": "+1-555-0123",
    "address": "123 Tech Street, Silicon Valley, CA 94000"
  }'
```

### 2. Crear Más Proveedores

```bash
# Proveedor 2
curl -X POST $BASE_URL/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Office Furniture Co",
    "contactEmail": "sales@officefurniture.com",
    "phone": "+1-555-0456"
  }'

# Proveedor 3
curl -X POST $BASE_URL/suppliers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Global Electronics",
    "contactEmail": "info@globalelectronics.com",
    "phone": "+1-555-0789",
    "address": "456 Electronics Ave, New York, NY 10001"
  }'
```

### 3. Listar Proveedores

```bash
curl -X GET $BASE_URL/suppliers \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Actualizar Proveedor

```bash
curl -X PATCH $BASE_URL/suppliers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "phone": "+1-555-9999"
  }'
```

**✅ CHECKPOINT**: Deberías tener 3 proveedores activos

---

## 📦 PRODUCTOS

### 1. Crear Producto

```bash
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "LAPTOP001",
    "name": "Laptop Dell XPS 15",
    "barcode": "5901234123457",
    "description": "Laptop de alto rendimiento con pantalla 4K",
    "categoryId": 1,
    "costPrice": 999.99,
    "salePrice": 1499.99,
    "reorderPoint": 10,
    "supplierId": 1,
    "imageUrl": "https://example.com/laptop.jpg"
  }'
```

**Respuesta**: Nota que `id: 1` - lo usaremos después

### 2. Crear Más Productos

```bash
# Producto 2
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "MOUSE001",
    "name": "Mouse Inalámbrico Logitech",
    "barcode": "5901234123458",
    "categoryId": 1,
    "costPrice": 15.00,
    "salePrice": 29.99,
    "reorderPoint": 20,
    "supplierId": 1
  }'

# Producto 3
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "DESK001",
    "name": "Escritorio Ejecutivo",
    "categoryId": 2,
    "costPrice": 200.00,
    "salePrice": 399.99,
    "reorderPoint": 5,
    "supplierId": 2
  }'

# Producto 4
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "KEYBOARD001",
    "name": "Teclado Mecánico RGB",
    "barcode": "5901234123459",
    "categoryId": 1,
    "costPrice": 50.00,
    "salePrice": 89.99,
    "reorderPoint": 15,
    "supplierId": 3
  }'
```

### 3. Listar Productos (Sin Filtros)

```bash
curl -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Listar Productos con Paginación

```bash
curl -X GET "$BASE_URL/products?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Buscar Productos por Texto

```bash
# Buscar "laptop"
curl -X GET "$BASE_URL/products?search=laptop" \
  -H "Authorization: Bearer $TOKEN"

# Buscar "mouse"
curl -X GET "$BASE_URL/products?search=mouse" \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Filtrar por Categoría

```bash
# Solo productos de Electrónica (categoryId=1)
curl -X GET "$BASE_URL/products?categoryId=1" \
  -H "Authorization: Bearer $TOKEN"
```

### 7. Filtrar por Estado

```bash
curl -X GET "$BASE_URL/products?status=active" \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Ordenar Productos

```bash
# Por precio (más caro primero)
curl -X GET "$BASE_URL/products?sortBy=price&order=DESC" \
  -H "Authorization: Bearer $TOKEN"

# Por nombre (A-Z)
curl -X GET "$BASE_URL/products?sortBy=name&order=ASC" \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Búsqueda Combinada

```bash
curl -X GET "$BASE_URL/products?search=laptop&categoryId=1&sortBy=price&order=DESC&page=1&limit=25" \
  -H "Authorization: Bearer $TOKEN"
```

### 10. Buscar por SKU

```bash
curl -X GET "$BASE_URL/products/sku/LAPTOP001" \
  -H "Authorization: Bearer $TOKEN"
```

### 11. Buscar por Código de Barras

```bash
curl -X GET "$BASE_URL/products/barcode/5901234123457" \
  -H "Authorization: Bearer $TOKEN"
```

### 12. Obtener Producto por ID

```bash
curl -X GET "$BASE_URL/products/1" \
  -H "Authorization: Bearer $TOKEN"
```

### 13. Actualizar Producto

```bash
curl -X PATCH $BASE_URL/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "salePrice": 1399.99,
    "description": "Laptop de alto rendimiento con pantalla 4K y 16GB RAM"
  }'
```

### 14. Desactivar Producto

```bash
curl -X DELETE $BASE_URL/products/4 \
  -H "Authorization: Bearer $TOKEN"
```

**✅ CHECKPOINT**: Deberías tener 4 productos (3 activos, 1 inactivo)

---

## 📊 INVENTARIO

Esta es la parte más importante. Vamos a simular operaciones reales.

### 1. Ver Inventario Completo (Inicial)

```bash
curl -X GET $BASE_URL/inventory \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta Esperada**:
- Todos los productos con `currentStock: 0`
- `totalValue: 0`
- `lowStockCount: 3` (porque están por debajo del reorderPoint)

### 2. Entrada de Stock - Compra de Laptops

```bash
curl -X POST $BASE_URL/inventory/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 1, 
    "quantity": 50,
    "referenceDoc": "ORD-2024-001",
    "supplierId": 1,
    "notes": "Compra mensual de laptops a Tech Supplies"
  }'
```

**Respuesta Esperada**:
```json
{
  "id": 1,
  "productId": 1,
  "movementType": "entry",
  "quantity": 50,
  "stockBefore": 0,
  "stockAfter": 50,
  "referenceDoc": "ORD-2024-001",
  "notes": "Compra mensual de laptops a Tech Supplies",
  "createdById": 1,
  "createdAt": "2024-11-29T..."
}
```

### 3. Más Entradas de Stock

```bash
# Mouse
curl -X POST $BASE_URL/inventory/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 2,
    "quantity": 100,
    "referenceDoc": "ORD-2024-002",
    "supplierId": 1,
    "notes": "Stock de mouse inalámbricos"
  }'

# Escritorio
curl -X POST $BASE_URL/inventory/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 3,
    "quantity": 20,
    "referenceDoc": "ORD-2024-003",
    "supplierId": 2,
    "notes": "Escritorios ejecutivos"
  }'
```

### 4. Verificar Stock de un Producto

```bash
curl -X GET $BASE_URL/inventory/stock/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta Esperada**:
```json
{
  "id": 1,
  "productId": 1,
  "currentStock": 50,
  "lastMovementAt": "2024-11-29T...",
  "product": {
    "id": 1,
    "sku": "LAPTOP001",
    "name": "Laptop Dell XPS 15",
    ...
  }
}
```

### 5. Salida de Stock - Venta

```bash
curl -X POST $BASE_URL/inventory/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 1,
    "quantity": 3,
    "exitType": "sale",
    "referenceDoc": "VTA-2024-001",
    "notes": "Venta a empresa ABC Corp"
  }'
```

**Respuesta Esperada**:
```json
{
  "id": 4,
  "productId": 1,
  "movementType": "sale",
  "quantity": 3,
  "stockBefore": 50,
  "stockAfter": 47,
  ...
}
```

### 6. Más Ventas

```bash
# Venta de 5 mouse
curl -X POST $BASE_URL/inventory/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 2,
    "quantity": 5,
    "exitType": "sale",
    "referenceDoc": "VTA-2024-002",
    "notes": "Venta a cliente individual"
  }'

# Venta de 2 laptops más
curl -X POST $BASE_URL/inventory/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 1,
    "quantity": 2,
    "exitType": "sale",
    "referenceDoc": "VTA-2024-003"
  }'
```

### 7. Salida por Daño

```bash
curl -X POST $BASE_URL/inventory/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 2,
    "quantity": 3,
    "exitType": "damaged",
    "notes": "Mouse defectuosos detectados en control de calidad"
  }'
```

### 8. Salida por Pérdida

```bash
curl -X POST $BASE_URL/inventory/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 1,
    "quantity": 1,
    "exitType": "loss",
    "notes": "Producto no encontrado en inventario físico"
  }'
```

### 9. Ajuste de Inventario (Pequeño <10%)

```bash
curl -X POST $BASE_URL/inventory/adjustment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 2,
    "newQuantity": 90,
    "reason": "Conteo físico mensual - diferencia menor detectada"
  }'
```

### 10. Ajuste de Inventario (Grande >10% con evidencia)

```bash
curl -X POST $BASE_URL/inventory/adjustment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 3,
    "newQuantity": 15,
    "reason": "Conteo físico - 5 escritorios dañados en bodega",
    "imageUrl": "https://storage.example.com/evidence-2024-11-29.jpg"
  }'
```

### 11. Ver Historial de Movimientos (Todos)

```bash
curl -X GET "$BASE_URL/inventory/movements?page=1&limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

### 12. Historial de un Producto Específico

```bash
curl -X GET "$BASE_URL/inventory/movements?productId=1" \
  -H "Authorization: Bearer $TOKEN"
```

### 13. Historial por Tipo de Movimiento

```bash
# Solo ventas
curl -X GET "$BASE_URL/inventory/movements?movementType=sale" \
  -H "Authorization: Bearer $TOKEN"

# Solo entradas
curl -X GET "$BASE_URL/inventory/movements?movementType=entry" \
  -H "Authorization: Bearer $TOKEN"

# Solo ajustes
curl -X GET "$BASE_URL/inventory/movements?movementType=adjustment" \
  -H "Authorization: Bearer $TOKEN"
```

### 14. Historial por Rango de Fechas

```bash
curl -X GET "$BASE_URL/inventory/movements?startDate=2024-11-01&endDate=2024-11-30" \
  -H "Authorization: Bearer $TOKEN"
```

### 15. Ver Inventario Completo (Final)

```bash
curl -X GET $BASE_URL/inventory \
  -H "Authorization: Bearer $TOKEN"
```

**Deberías ver**:
- Stock actualizado de todos los productos
- `totalValue` calculado
- `lowStockCount` actualizado

**✅ CHECKPOINT**: El inventario debería mostrar:
- Laptop: 44 unidades (50 - 3 - 2 - 1)
- Mouse: 90 unidades (ajustado)
- Escritorio: 15 unidades (ajustado)

---

## 🔄 FLUJOS COMPLETOS

### Flujo 1: Ciclo Completo de un Producto

```bash
# 1. Crear producto
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "MONITOR001",
    "name": "Monitor 27 pulgadas",
    "categoryId": 1,
    "costPrice": 200.00,
    "salePrice": 349.99,
    "reorderPoint": 8,
    "supplierId": 3
  }'

# 2. Comprar stock
curl -X POST $BASE_URL/inventory/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 5,
    "quantity": 25,
    "referenceDoc": "ORD-2024-010",
    "notes": "Compra inicial de monitores"
  }'

# 3. Vender algunas unidades
curl -X POST $BASE_URL/inventory/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 5,
    "quantity": 10,
    "exitType": "sale",
    "referenceDoc": "VTA-2024-010"
  }'

# 4. Hacer conteo físico
curl -X POST $BASE_URL/inventory/adjustment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 5,
    "newQuantity": 15,
    "reason": "Conteo físico - stock correcto"
  }'

# 5. Ver historial completo del producto
curl -X GET "$BASE_URL/inventory/movements?productId=5" \
  -H "Authorization: Bearer $TOKEN"

# 6. Ver stock actual
curl -X GET $BASE_URL/inventory/stock/5 \
  -H "Authorization: Bearer $TOKEN"
```

### Flujo 2: Búsqueda y Filtrado Avanzado

```bash
# 1. Buscar productos de electrónica
curl -X GET "$BASE_URL/products?categoryId=1" \
  -H "Authorization: Bearer $TOKEN"

# 2. Buscar los más caros
curl -X GET "$BASE_URL/products?categoryId=1&sortBy=price&order=DESC" \
  -H "Authorization: Bearer $TOKEN"

# 3. Buscar por palabra clave
curl -X GET "$BASE_URL/products?search=laptop" \
  -H "Authorization: Bearer $TOKEN"

# 4. Combinar filtros
curl -X GET "$BASE_URL/products?categoryId=1&search=monitor&sortBy=price&order=ASC&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Flujo 3: Gestión de Usuarios por Roles

```bash
# Login como Manager
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@inventory.com",
    "password": "Manager123!"
  }'

# Guardar token del manager
export MANAGER_TOKEN="..."

# El manager puede crear productos
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{
    "sku": "TEST001",
    "name": "Producto de Prueba",
    "categoryId": 1,
    "costPrice": 10.00,
    "salePrice": 20.00
  }'

# El manager puede registrar movimientos
curl -X POST $BASE_URL/inventory/entry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{
    "productId": 6,
    "quantity": 100
  }'
```

---

## ❌ CASOS DE ERROR

Estos son los errores que el sistema debe manejar correctamente.

### Error 1: Vender Más de lo Disponible (❌ DEBE FALLAR)

```bash
curl -X POST $BASE_URL/inventory/exit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 1,
    "quantity": 1000,
    "exitType": "sale"
  }'
```

**Respuesta Esperada (400)**:
```json
{
  "statusCode": 400,
  "message": "Insufficient stock. Available: 44, Requested: 1000",
  "error": "Bad Request"
}
```

### Error 2: Ajuste >10% sin Evidencia (❌ DEBE FALLAR)

```bash
curl -X POST $BASE_URL/inventory/adjustment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "productId": 1,
    "newQuantity": 10,
    "reason": "Ajuste grande sin foto"
  }'
```

**Respuesta Esperada (400)**:
```json
{
  "statusCode": 400,
  "message": "Adjustments greater than 10% require photographic evidence (imageUrl)",
  "error": "Bad Request"
}
```

### Error 3: Crear Producto con SKU Duplicado (❌ DEBE FALLAR)

```bash
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "LAPTOP001",
    "name": "Otro Producto",
    "categoryId": 1,
    "costPrice": 100,
    "salePrice": 200
  }'
```

**Respuesta Esperada (409)**:
```json
{
  "statusCode": 409,
  "message": "SKU already exists",
  "error": "Conflict"
}
```

### Error 4: Precio de Venta Menor que Costo (❌ DEBE FALLAR)

```bash
curl -X POST $BASE_URL/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sku": "FAIL001",
    "name": "Producto Inválido",
    "categoryId": 1,
    "costPrice": 100.00,
    "salePrice": 50.00
  }'
```

**Respuesta Esperada (400)**:
```json
{
  "statusCode": 400,
  "message": "Sale price must be greater than cost price",
  "error": "Bad Request"
}
```

### Error 5: Acceso sin Token (❌ DEBE FALLAR)

```bash
curl -X GET $BASE_URL/products
```

**Respuesta Esperada (401)**:
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Error 6: Producto No Existe (❌ DEBE FALLAR)

```bash
curl -X GET $BASE_URL/products/9999 \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta Esperada (404)**:
```json
{
  "statusCode": 404,
  "message": "Product with ID 9999 not found",
  "error": "Not Found"
}
```

### Error 7: Login con Credenciales Incorrectas (❌ DEBE FALLAR)

```bash
curl -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventory.com",
    "password": "WrongPassword"
  }'
```

**Respuesta Esperada (401)**:
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## 📊 VERIFICACIÓN FINAL

Ejecuta estos comandos para verificar el estado final:

```bash
# 1. Total de usuarios
echo "=== USUARIOS ==="
curl -X GET $BASE_URL/users \
  -H "Authorization: Bearer $TOKEN" | jq 'length'

# 2. Total de categorías activas
echo "=== CATEGORÍAS ==="
curl -X GET $BASE_URL/categories \
  -H "Authorization: Bearer $TOKEN" | jq 'length'

# 3. Total de proveedores
echo "=== PROVEEDORES ==="
curl -X GET $BASE_URL/suppliers \
  -H "Authorization: Bearer $TOKEN" | jq 'length'

# 4. Total de productos
echo "=== PRODUCTOS ==="
curl -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN" | jq '.pagination.total'

# 5. Resumen de inventario
echo "=== INVENTARIO ==="
curl -X GET $BASE_URL/inventory \
  -H "Authorization: Bearer $TOKEN" | jq '.summary'

# 6. Total de movimientos
echo "=== MOVIMIENTOS ==="
curl -X GET "$BASE_URL/inventory/movements" \
  -H "Authorization: Bearer $TOKEN" | jq '.pagination.total'
```

**Resultados Esperados**:
- Usuarios: 3
- Categorías: 2
- Proveedores: 3
- Productos: 5-6
- Valor de inventario: >0
- Movimientos: 10+

---

## 🎯 COLECCIÓN POSTMAN

Crea un archivo `inventory-api.postman_collection.json`:

```json
{
  "info": {
    "name": "Inventory API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set('token', jsonData.access_token);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@inventory.com\",\n  \"password\": \"Admin123!\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/auth/profile",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "profile"]
            }
          }
        }
      ]
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "List Products",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/products?page=1&limit=25",
              "host": ["{{baseUrl}}"],
              "path": ["products"],
              "query": [
                {"key": "page", "value": "1"},
                {"key": "limit", "value": "25"}
              ]
            }
          }
        },
        {
          "name": "Create Product",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"sku\": \"LAPTOP001\",\n  \"name\": \"Laptop Dell XPS 15\",\n  \"categoryId\": 1,\n  \"costPrice\": 999.99,\n  \"salePrice\": 1499.99,\n  \"reorderPoint\": 10\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/products",
              "host": ["{{baseUrl}}"],
              "path": ["products"]
            }
          }
        }
      ]
    },
    {
      "name": "Inventory",
      "item": [
        {
          "name": "Get All Inventory",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "{{baseUrl}}/inventory",
              "host": ["{{baseUrl}}"],
              "path": ["inventory"]
            }
          }
        },
        {
          "name": "Stock Entry",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"productId\": 1,\n  \"quantity\": 50,\n  \"referenceDoc\": \"ORD-2024-001\",\n  \"notes\": \"Compra mensual\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/inventory/entry",
              "host": ["{{baseUrl}}"],
              "path": ["inventory", "entry"]
            }
          }
        },
        {
          "name": "Stock Exit",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"productId\": 1,\n  \"quantity\": 5,\n  \"exitType\": \"sale\",\n  \"referenceDoc\": \"VTA-2024-001\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/inventory/exit",
              "host": ["{{baseUrl}}"],
              "path": ["inventory", "exit"]
            }
          }
        }
      ]
    }
  ]
}
```

### Importar en Postman

1. Abre Postman
2. Click en "Import"
3. Pega el JSON anterior
4. La variable `{{token}}` se actualizará automáticamente al hacer login

---

## 🎓 TIPS DE PRUEBA

### 1. Usar `jq` para Formatear

```bash
curl -X GET $BASE_URL/products \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 2. Guardar Respuestas

```bash
curl -X GET $BASE_URL/inventory \
  -H "Authorization: Bearer $TOKEN" > inventory-backup.json
```

### 3. Pruebas Automatizadas con Script

Crea un archivo `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

# Login y obtener token
TOKEN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.com","password":"Admin123!"}' \
  | jq -r '.access_token')

echo "Token: $TOKEN"

# Probar endpoints
echo "=== Testing Products ==="
curl -s -X GET "$BASE_URL/products" \
  -H "Authorization: Bearer $TOKEN" | jq '.pagination'

echo "=== Testing Inventory ==="
curl -s -X GET "$BASE_URL/inventory" \
  -H "Authorization: Bearer $TOKEN" | jq '.summary'
```

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## ✅ CHECKLIST DE PRUEBAS

Marca cada item cuando lo hayas probado:

### Autenticación
- [ ] Login exitoso
- [ ] Login con credenciales incorrectas (debe fallar)
- [ ] Obtener perfil con token válido
- [ ] Acceder sin token (debe fallar)

### Usuarios
- [ ] Crear usuario admin
- [ ] Crear usuario manager
- [ ] Crear usuario seller
- [ ] Listar usuarios
- [ ] Actualizar usuario
- [ ] Cambiar contraseña
- [ ] Desactivar usuario

### Categorías
- [ ] Crear categoría
- [ ] Listar categorías
- [ ] Actualizar categoría
- [ ] Desactivar categoría

### Proveedores
- [ ] Crear proveedor
- [ ] Listar proveedores
- [ ] Actualizar proveedor
- [ ] Verificar validaciones

### Productos
- [ ] Crear producto completo
- [ ] Listar con paginación
- [ ] Buscar por texto
- [ ] Filtrar por categoría
- [ ] Ordenar por precio
- [ ] Buscar por SKU
- [ ] Buscar por código de barras
- [ ] Actualizar producto
- [ ] SKU duplicado (debe fallar)
- [ ] Precio venta < costo (debe fallar)

### Inventario
- [ ] Ver inventario vacío inicial
- [ ] Registrar entrada de stock
- [ ] Ver stock actualizado
- [ ] Registrar venta
- [ ] Vender más de lo disponible (debe fallar)
- [ ] Registrar salida por daño
- [ ] Registrar salida por pérdida
- [ ] Ajustar inventario (<10%)
- [ ] Ajustar inventario (>10% con evidencia)
- [ ] Ajustar inventario (>10% sin evidencia - debe fallar)
- [ ] Ver historial completo
- [ ] Filtrar historial por producto
- [ ] Filtrar historial por tipo
- [ ] Filtrar historial por fechas
- [ ] Ver resumen de inventario

---

## 📞 SOPORTE

Si algo no funciona:

1. Verifica que el servidor esté corriendo: `npm run start:dev`
2. Verifica que PostgreSQL esté activo
3. Revisa los logs del servidor en la terminal
4. Verifica que el token no haya expirado (dura 1 hora)
5. Usa Swagger UI para debug visual: http://localhost:3000/api/docs

---

**¡Disfruta probando el sistema! 🚀**

Creado: 29 de noviembre de 2025
Versión: 1.0
