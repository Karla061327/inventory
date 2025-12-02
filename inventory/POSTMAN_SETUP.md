# 📮 Guía de Postman - Colección de API

## Importar la Colección

### Opción 1: Importar Archivo JSON

1. Abre Postman
2. Click en **"Import"** (esquina superior izquierda)
3. Click en **"Upload Files"**
4. Selecciona el archivo: `Inventory-API.postman_collection.json`
5. Click en **"Import"**

### Opción 2: Arrastrar y Soltar

1. Abre Postman
2. Arrastra el archivo `Inventory-API.postman_collection.json` a la ventana de Postman
3. La colección se importará automáticamente

---

## 📋 Contenido de la Colección

### Estructura de la Colección (31 Endpoints)

```
Inventory Management System API
├── Authentication (2)
│   ├── Login ⭐ (Auto-guarda token)
│   └── Get Profile
├── Users (6)
│   ├── Create User ⭐ (Primera ejecución)
│   ├── Get All Users
│   ├── Get User by ID
│   ├── Update User
│   ├── Change Password
│   └── Delete User
├── Categories (5)
│   ├── Create Category ⭐ (Auto-guarda ID)
│   ├── Get All Categories
│   ├── Get Category by ID
│   ├── Update Category
│   └── Delete Category
├── Suppliers (5)
│   ├── Create Supplier ⭐ (Auto-guarda ID)
│   ├── Get All Suppliers
│   ├── Get Supplier by ID
│   ├── Update Supplier
│   └── Delete Supplier
├── Products (7)
│   ├── Create Product ⭐ (Auto-guarda ID)
│   ├── Get All Products
│   ├── Get Product by ID
│   ├── Get Product by SKU
│   ├── Get Product by Barcode
│   ├── Update Product
│   └── Delete Product
├── Inventory (7)
│   ├── Stock Entry (Purchase)
│   ├── Stock Exit (Sale)
│   ├── Stock Exit (Damage)
│   ├── Inventory Adjustment
│   ├── Get Movement History
│   ├── Get Current Stock
│   └── Get All Inventory
└── Tests & Validation (3)
    ├── Test Overselling (Should Fail)
    ├── Test Adjustment Without Evidence (Should Fail)
    └── Test Duplicate SKU (Should Fail)
```

---

## 🚀 Flujo Completo de Uso (Paso a Paso)

### Paso 1: Crear Primer Usuario (Solo Primera Vez)

1. Ve a carpeta **"Users"**
2. Ejecuta **"Create User"**
3. Se creará el usuario admin
4. El ID se guardará automáticamente en variables

### Paso 2: Hacer Login ⭐ IMPORTANTE

1. Ve a carpeta **"Authentication"**
2. Ejecuta **"Login"**
3. ✨ **El token se guarda automáticamente** en la variable `access_token`
4. Todos los demás endpoints usarán este token automáticamente

### Paso 3: Crear Categoría

1. Ve a carpeta **"Categories"**
2. Ejecuta **"Create Category"**
3. El ID se guarda automáticamente en `category_id`

### Paso 4: Crear Proveedor

1. Ve a carpeta **"Suppliers"**
2. Ejecuta **"Create Supplier"**
3. El ID se guarda automáticamente en `supplier_id`

### Paso 5: Crear Producto

1. Ve a carpeta **"Products"**
2. Ejecuta **"Create Product"**
3. El ID se guarda automáticamente en `product_id`
4. ⚠️ Usa los IDs de categoría y proveedor creados anteriormente

### Paso 6: Operaciones de Inventario

1. Ve a carpeta **"Inventory"**
2. Ejecuta en orden:
   - **Stock Entry** → Añade 100 unidades
   - **Get Current Stock** → Verifica el stock
   - **Stock Exit (Sale)** → Vende 5 unidades
   - **Get Movement History** → Ve el historial
   - **Inventory Adjustment** → Ajusta inventario
   - **Get All Inventory** → Ve resumen completo

---

## 🔧 Variables de la Colección

### Variables Automáticas (Se Configuran Solas)

| Variable | Se Guarda En | Uso |
|----------|--------------|-----|
| `access_token` | Login | Autenticación automática |
| `user_id` | Login | Operaciones de usuario |
| `category_id` | Create Category | Referencia en productos |
| `supplier_id` | Create Supplier | Referencia en productos |
| `product_id` | Create Product | Operaciones de inventario |

### Variables Configurables

| Variable | Valor por Defecto | Descripción |
|----------|-------------------|-------------|
| `base_url` | http://localhost:3000/api | URL base de la API |

### Ver/Editar Variables

1. Click derecho en la colección **"Inventory Management System API"**
2. Selecciona **"Edit"**
3. Ve a la pestaña **"Variables"**
4. Aquí puedes ver y editar todas las variables

---

## 🎯 Autenticación Automática

### Cómo Funciona

La colección está configurada con **Bearer Token Authentication**:

1. Ejecutas **Login** → Token se guarda en `{{access_token}}`
2. Todos los demás requests usan automáticamente: `Authorization: Bearer {{access_token}}`
3. ✨ **No necesitas copiar/pegar el token manualmente**

### Si el Token Expira (después de 1 hora)

1. Simplemente ejecuta **Login** de nuevo
2. El nuevo token reemplazará al anterior automáticamente

---

## 📊 Tests Automáticos Incluidos

### Scripts de Test en Login

```javascript
// Guarda el token automáticamente
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set("access_token", jsonData.access_token);
    pm.collectionVariables.set("user_id", jsonData.user.id);
    console.log("Token saved: " + jsonData.access_token);
}
```

### Scripts en Create Endpoints

Todos los endpoints de creación guardan automáticamente los IDs:
- Create Category → `category_id`
- Create Supplier → `supplier_id`
- Create Product → `product_id`

---

## 🧪 Tests de Validación

La carpeta **"Tests & Validation"** contiene pruebas que **deben fallar**:

### 1. Test Overselling (Debe retornar 400)
```json
{
  "statusCode": 400,
  "message": "Insufficient stock. Available: 95, Requested: 999999"
}
```

### 2. Test Adjustment Without Evidence (Debe retornar 400)
```json
{
  "statusCode": 400,
  "message": "Adjustments greater than 10% require photographic evidence (imageUrl)"
}
```

### 3. Test Duplicate SKU (Debe retornar 409)
```json
{
  "statusCode": 409,
  "message": "Product with SKU LAPTOP001 already exists"
}
```

---

## 📝 Ejemplos de Requests

### Búsqueda Avanzada de Productos

```
GET {{base_url}}/products?search=laptop&categoryId=1&status=active&page=1&limit=25
```

### Filtrar Movimientos de Inventario

```
GET {{base_url}}/inventory/movements?productId=1&movementType=sale&startDate=2024-01-01&endDate=2024-12-31
```

### Búsqueda de Categorías

```
GET {{base_url}}/categories?search=electr
```

---

## 🔄 Flujo Completo Automatizado

### Runner de Postman (Ejecutar Múltiples Requests)

1. Click derecho en la colección
2. Selecciona **"Run collection"**
3. Selecciona los requests en orden:
   ```
   1. Create User
   2. Login
   3. Create Category
   4. Create Supplier
   5. Create Product
   6. Stock Entry
   7. Get Current Stock
   ```
4. Click en **"Run"**
5. ✨ Se ejecutarán todos en secuencia automáticamente

---

## ⚙️ Configuración de Entornos

### Crear Entorno de Desarrollo

1. Click en **"Environments"** (sidebar izquierdo)
2. Click en **"+"** para crear nuevo entorno
3. Nombre: **"Development"**
4. Variables:
   ```
   base_url: http://localhost:3000/api
   ```

### Crear Entorno de Producción

1. Nombre: **"Production"**
2. Variables:
   ```
   base_url: https://api.tudominio.com/api
   ```

### Cambiar entre Entornos

- Dropdown en la esquina superior derecha
- Selecciona "Development" o "Production"

---

## 🐛 Solución de Problemas

### Error: 401 Unauthorized

**Causa**: Token expiró o no existe

**Solución**:
1. Ejecuta **Login** de nuevo
2. Verifica que la variable `access_token` tenga valor

### Error: Cannot connect to server

**Causa**: La aplicación no está corriendo

**Solución**:
```bash
npm run start:dev
```

### Error: 404 Not Found en productos/categorías

**Causa**: Los IDs no están configurados

**Solución**:
1. Ejecuta los endpoints de creación primero
2. Verifica las variables en la colección

### Request no incluye token

**Causa**: La autenticación no está heredada

**Solución**:
1. Verifica que el request no tenga "Auth Type: No Auth"
2. Debe usar "Inherit auth from parent"

---

## 📋 Checklist de Verificación

- [ ] Colección importada correctamente
- [ ] Variable `base_url` apunta a http://localhost:3000/api
- [ ] Servidor está corriendo (npm run start:dev)
- [ ] PostgreSQL está corriendo (Docker)
- [ ] Ejecutado "Create User" (primera vez)
- [ ] Ejecutado "Login" (token guardado)
- [ ] Puede ver el token en Variables → `access_token`

---

## 🎓 Tips y Mejores Prácticas

### 1. Usa la Consola de Postman
- Click en **"Console"** (parte inferior)
- Ve requests/responses en detalle
- Debug de tokens y variables

### 2. Guarda Requests Exitosos
- Click en **"Save as Example"** después de ejecutar
- Documenta respuestas exitosas

### 3. Organiza con Carpetas
- Crea subcarpetas para diferentes flujos
- Ejemplo: "Happy Path", "Error Cases"

### 4. Usa Pre-request Scripts
```javascript
// Generar timestamp dinámico
pm.collectionVariables.set("timestamp", Date.now());
```

### 5. Comentarios en Body
```json
{
  "sku": "LAPTOP001",
  "name": "Laptop Dell XPS 15",
  // Este comentario explica el campo
  "categoryId": {{category_id}}
}
```

---

## 📖 Documentación Swagger

La colección de Postman es complementaria a Swagger:

| Herramienta | Mejor Para |
|-------------|------------|
| **Swagger** | Explorar, documentación |
| **Postman** | Testing, automatización, workflows |

Accede a Swagger: **http://localhost:3000/api/docs**

---

## 🔗 Recursos Adicionales

- **GUIA_PRUEBAS_API.md** - Guía completa con curl
- **DOCKER_SETUP.md** - Configuración de base de datos
- **ESTADO_PROYECTO.md** - Estado del proyecto
- **MODULO_INVENTARIO.md** - Documentación del inventario

---

## ✅ Estado de la Colección

- **Versión**: 1.0
- **Última actualización**: 2025-12-01
- **Endpoints**: 31 funcionales
- **Scripts automáticos**: ✅ Implementados
- **Variables**: ✅ Auto-configuradas
- **Tests de validación**: ✅ Incluidos

---

**¡Listo para usar!** 🚀

Si tienes problemas, verifica:
1. Servidor corriendo (`npm run start:dev`)
2. Token guardado (ejecuta Login)
3. Variables configuradas (click derecho → Edit → Variables)
