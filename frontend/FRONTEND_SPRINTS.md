# Plan de Sprints - Frontend Inventory System

## Estado Actual del Frontend

| Componente | Estado | Progreso |
|------------|--------|----------|
| Setup (Vite, React 19, Tailwind, TypeScript) | Completado | 100% |
| Componentes UI (Shadcn/ui) | Completado | 100% |
| API Layer (Axios) | Placeholder | 0% |
| Contexto de Auth | No existe | 0% |
| Tipos TypeScript | No existe | 0% |
| Hooks personalizados | No existe | 0% |
| Layout y navegacion | No existe | 0% |
| Paginas funcionales | Scaffold parc ial | 5% |

**Stack del Frontend:** React 19 + TypeScript + Vite + Tailwind CSS 4 + Radix UI + React Query + React Router v7 + Recharts + Axios

---

## Sprint 1 - Fundamentos y Autenticacion

**Objetivo:** Establecer la capa de comunicacion con el backend, tipos de datos, contexto de autenticacion, layout principal y pagina de login funcional.

### Tarea 1.1 - Tipos TypeScript (`src/types/`)

Crear las interfaces y tipos que reflejan las entidades del backend:

```
src/types/
  index.ts          - Re-exportaciones
  auth.types.ts     - LoginRequest, LoginResponse, AuthUser
  user.types.ts     - User, CreateUserDto, UpdateUserDto, UserRole
  product.types.ts  - Product, CreateProductDto, UpdateProductDto, ProductStatus, QueryProductDto
  category.types.ts - Category, CreateCategoryDto, UpdateCategoryDto
  supplier.types.ts - Supplier, CreateSupplierDto, UpdateSupplierDto
  inventory.types.ts - Inventory, InventoryMovement, MovementType, EntryDto, ExitDto, AdjustmentDto
  alert.types.ts    - Alert, AlertType, CreateAlertDto, QueryAlertsDto
  report.types.ts   - DashboardData, InventoryReport, MovementReport, ValueReport
  audit.types.ts    - AuditLog, AuditAction
  common.types.ts   - PaginatedResponse, PaginationParams, ApiError
```

**Tipos clave:**
- `UserRole`: `ADMIN | MANAGER | SELLER`
- `ProductStatus`: `ACTIVE | INACTIVE | DISCONTINUED`
- `MovementType`: `ENTRY | SALE | ADJUSTMENT | DAMAGED | LOSS`
- `AlertType`: `LOW_STOCK | NO_MOVEMENT | DISCREPANCY | SLOW_MOVING`
- `PaginatedResponse<T>`: `{ data: T[], total: number, page: number, limit: number }`

### Tarea 1.2 - Cliente API (`src/api/`)

Configurar Axios con interceptores y crear funciones para cada endpoint del backend:

```
src/api/
  axios.ts         - Instancia base con baseURL, interceptores de token y errores
  auth.api.ts      - login(), getProfile()
  users.api.ts     - getUsers(), createUser(), updateUser(), changePassword(), deleteUser()
  products.api.ts  - getProducts(), createProduct(), getProductById(), updateProduct(), deleteProduct()
  categories.api.ts - getCategories(), createCategory(), updateCategory(), deleteCategory()
  suppliers.api.ts  - getSuppliers(), createSupplier(), updateSupplier(), deleteSupplier()
  inventory.api.ts  - getInventory(), getStock(), getMovements(), createEntry(), createExit(), createAdjustment()
  alerts.api.ts     - getAlerts(), getAlertsSummary(), createAlert(), resolveAlert(), deleteAlert(), checkAlerts()
  reports.api.ts    - getDashboard(), getInventoryReport(), getMovementsReport(), getValueReport(), getLowStock()
  audit.api.ts      - getAuditLogs(), getAuditSummary(), getUserLogs(), getRecordHistory()
```

**Configuracion de `axios.ts`:**
- `baseURL`: desde variable de entorno `VITE_API_URL` (default `http://localhost:3000/api`)
- Interceptor de request: inyectar `Authorization: Bearer <token>` desde localStorage
- Interceptor de response: manejar errores 401 (redirigir a login), errores de red, formato de errores

### Tarea 1.3 - Contexto de Autenticacion (`src/context/AuthContext.tsx`)

```
src/context/
  AuthContext.tsx   - Provider con login, logout, user, isAuthenticated, isLoading
```

**Funcionalidad:**
- Almacenar JWT en `localStorage`
- Cargar perfil de usuario al iniciar si hay token
- Exponer: `user`, `isAuthenticated`, `isLoading`, `login()`, `logout()`
- Manejar expiracion de token
- Hook `useAuth()` para consumir el contexto

### Tarea 1.4 - Layout Principal (`src/components/layout/`)

```
src/components/layout/
  Layout.tsx        - Layout principal con sidebar y contenido
  Sidebar.tsx       - Navegacion lateral con iconos y enlaces
  Header.tsx        - Barra superior con usuario, notificaciones y logout
  ProtectedRoute.tsx - HOC para proteger rutas autenticadas
```

**Sidebar - Items de navegacion:**
| Icono | Label | Ruta | Roles |
|-------|-------|------|-------|
| LayoutDashboard | Dashboard | `/` | Todos |
| Package | Productos | `/products` | Todos |
| Archive | Inventario | `/inventory` | Todos |
| FolderTree | Categorias | `/categories` | Todos |
| Truck | Proveedores | `/suppliers` | Todos |
| Bell | Alertas | `/alerts` | Todos |
| BarChart3 | Reportes | `/reports` | ADMIN, MANAGER |
| Users | Usuarios | `/users` | ADMIN |
| FileText | Auditoria | `/audit` | ADMIN |

**Header:**
- Nombre del usuario logueado
- Rol del usuario
- Indicador de alertas no resueltas (badge con conteo)
- Boton de logout
- Toggle de tema oscuro/claro

### Tarea 1.5 - Pagina de Login (`src/pages/Login.tsx`)

**Funcionalidad:**
- Formulario con email y password
- Validacion de campos (requeridos, formato email)
- Llamada a `POST /api/auth/login`
- Almacenar token y redirigir al Dashboard
- Mostrar errores de autenticacion (credenciales invalidas)
- Diseno centrado, branding de la aplicacion

### Tarea 1.6 - Actualizar Rutas (`src/App.tsx`)

- Integrar `AuthProvider`
- Envolver rutas protegidas con `ProtectedRoute`
- Ruta `/login` publica
- Redirigir a `/login` si no autenticado
- Agregar rutas faltantes: `/reports`, `/users`, `/audit`

### Entregables del Sprint 1
- [ ] Tipos TypeScript para todas las entidades
- [ ] Cliente API completo con interceptores
- [ ] Contexto de autenticacion funcional
- [ ] Layout con sidebar responsive y header
- [ ] Login funcional con manejo de errores
- [ ] Rutas protegidas por autenticacion
- [ ] Redireccion automatica si no hay sesion

---

## Sprint 2 - Dashboard y CRUD de Catalogos

**Objetivo:** Implementar el dashboard con metricas del negocio y los CRUDs de categorias y proveedores (entidades base que los productos necesitan).

### Tarea 2.1 - Hooks de React Query (`src/hooks/`)

Crear hooks reutilizables para cada modulo:

```
src/hooks/
  useAuth.ts          - Re-export del contexto (ya existe en Sprint 1)
  useCategories.ts    - useCategories(), useCategory(), useCreateCategory(), useUpdateCategory(), useDeleteCategory()
  useSuppliers.ts     - useSuppliers(), useSupplier(), useCreateSupplier(), useUpdateSupplier(), useDeleteSupplier()
  useReports.ts       - useDashboard(), useInventoryReport(), useMovementsReport(), useValueReport()
```

**Patron de cada hook:**
```typescript
// Queries con React Query
const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: getCategories });

// Mutations con invalidacion automatica
const useCreateCategory = () => useMutation({
  mutationFn: createCategory,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
});
```

### Tarea 2.2 - Componentes Compartidos (`src/components/shared/`)

```
src/components/shared/
  DataTable.tsx       - Tabla generica con paginacion, ordenamiento y busqueda
  ConfirmDialog.tsx   - Dialog de confirmacion reutilizable (eliminar, acciones destructivas)
  EmptyState.tsx      - Estado vacio con icono y mensaje
  LoadingSpinner.tsx  - Indicador de carga
  PageHeader.tsx      - Encabezado de pagina con titulo, descripcion y acciones
  StatusBadge.tsx     - Badge de estado con colores segun tipo
  FormField.tsx       - Wrapper de campo de formulario con label y error
```

### Tarea 2.3 - Dashboard (`src/pages/Dashboard.tsx`)

**Endpoint:** `GET /api/reports/dashboard`

**Secciones:**

1. **Tarjetas de metricas (KPIs):**
   - Total de productos activos
   - Valor total del inventario (costo y venta)
   - Movimientos del dia/semana
   - Alertas sin resolver

2. **Grafico de movimientos recientes** (Recharts - BarChart):
   - Entradas vs Salidas por dia (ultimos 7-30 dias)

3. **Tabla de productos con stock bajo** (top 10):
   - Producto | Stock actual | Punto de reorden | Estado

4. **Alertas recientes sin resolver** (ultimas 5):
   - Tipo | Producto | Fecha | Accion

5. **Grafico de valor por categoria** (Recharts - PieChart):
   - Distribucion del valor del inventario por categoria

### Tarea 2.4 - CRUD de Categorias (`src/pages/categories/`)

```
src/pages/categories/
  CategoryList.tsx    - Lista principal con tabla y acciones
  CategoryForm.tsx    - Formulario de crear/editar (en Dialog)
```

**Endpoints usados:**
- `GET /api/categories` - Listar
- `POST /api/categories` - Crear
- `PATCH /api/categories/:id` - Editar
- `DELETE /api/categories/:id` - Eliminar

**Funcionalidad:**
- Tabla con columnas: Nombre, Descripcion, Estado, Productos asociados, Acciones
- Boton "Nueva Categoria" abre dialog con formulario
- Editar inline via dialog
- Eliminar con confirmacion
- Busqueda por nombre

### Tarea 2.5 - CRUD de Proveedores (`src/pages/suppliers/`)

```
src/pages/suppliers/
  SupplierList.tsx    - Lista principal con tabla y acciones
  SupplierForm.tsx    - Formulario de crear/editar (en Dialog)
```

**Endpoints usados:**
- `GET /api/suppliers` - Listar
- `POST /api/suppliers` - Crear
- `PATCH /api/suppliers/:id` - Editar
- `DELETE /api/suppliers/:id` - Desactivar

**Funcionalidad:**
- Tabla con columnas: Nombre, Email, Telefono, Direccion, Estado, Acciones
- Boton "Nuevo Proveedor" abre dialog
- Editar via dialog
- Desactivar con confirmacion (soft delete)
- Busqueda por nombre o email

### Entregables del Sprint 2
- [ ] Hooks de React Query para categorias, proveedores y reportes
- [ ] Componentes compartidos (DataTable, ConfirmDialog, etc.)
- [ ] Dashboard con KPIs, graficos y tablas resumidas
- [ ] CRUD completo de categorias
- [ ] CRUD completo de proveedores
- [ ] Notificaciones toast en operaciones CRUD

---

## Sprint 3 - Gestion de Productos

**Objetivo:** Implementar el modulo completo de productos con listado, creacion, edicion, busqueda avanzada y filtros.

### Tarea 3.1 - Hooks de Productos

```
src/hooks/
  useProducts.ts - useProducts(), useProduct(), useProductBySku(), useCreateProduct(), useUpdateProduct(), useDeleteProduct()
```

### Tarea 3.2 - Listado de Productos (`src/pages/products/`)

```
src/pages/products/
  ProductList.tsx     - Lista principal con tabla, filtros y paginacion
  ProductForm.tsx     - Formulario de crear/editar producto (en Dialog o pagina)
  ProductDetail.tsx   - Vista detallada de un producto (opcional, en Dialog)
  ProductFilters.tsx  - Panel de filtros avanzados
```

**Funcionalidad de ProductList:**
- Tabla con columnas: SKU, Nombre, Categoria, Proveedor, Precio Costo, Precio Venta, Stock, Estado, Acciones
- Paginacion del lado del servidor (page, limit)
- Busqueda por nombre, SKU o codigo de barras
- Filtros:
  - Por categoria (select)
  - Por proveedor (select)
  - Por estado (ACTIVE, INACTIVE, DISCONTINUED)
- Ordenamiento por columnas
- Indicador visual de stock bajo (resaltar filas con stock < reorderPoint)

**Funcionalidad de ProductForm:**
- Campos:
  - SKU (requerido, unico)
  - Nombre (requerido)
  - Codigo de barras (opcional, unico)
  - Descripcion (opcional, textarea)
  - Categoria (select, requerido)
  - Proveedor (select, opcional)
  - Precio de costo (requerido, numerico > 0)
  - Precio de venta (requerido, numerico > 0)
  - Punto de reorden (opcional, numerico >= 0)
  - Estado (select: ACTIVE, INACTIVE, DISCONTINUED)
- Validacion de formulario
- Selects de categoria y proveedor cargados desde la API
- Modo crear y modo editar con el mismo componente

### Entregables del Sprint 3
- [ ] Hooks de React Query para productos
- [ ] Listado de productos con tabla paginada
- [ ] Filtros avanzados (categoria, proveedor, estado, busqueda)
- [ ] Formulario de crear producto con validacion
- [ ] Formulario de editar producto
- [ ] Desactivar producto con confirmacion
- [ ] Indicadores visuales de stock bajo
- [ ] Navegacion desde producto a su categoria/proveedor

---

## Sprint 4 - Gestion de Inventario

**Objetivo:** Implementar el modulo central de inventario: stock actual, registro de entradas, salidas, ajustes e historial de movimientos.

### Tarea 4.1 - Hooks de Inventario

```
src/hooks/
  useInventory.ts - useInventory(), useStock(), useMovements(), useCreateEntry(), useCreateExit(), useCreateAdjustment()
```

### Tarea 4.2 - Completar Sub-paginas de Inventario

Ya existe el scaffold en `src/pages/inventory/InventoryPage.tsx` con 5 tabs. Implementar cada sub-componente:

```
src/pages/inventory/
  InventoryPage.tsx   - (Ya existe) Contenedor con tabs
  InventoryList.tsx   - Tab "Stock Actual"
  StockEntry.tsx      - Tab "Entrada"
  StockExit.tsx       - Tab "Salida"
  StockAdjust.tsx     - Tab "Ajuste"
  Movements.tsx       - Tab "Movimientos"
```

**InventoryList (Stock Actual):**
- Tabla con: Producto (SKU + Nombre), Stock Actual, Precio Costo, Valor Total, Punto de Reorden, Ultimo Movimiento
- Resumen superior: Total productos, Valor total costo, Valor total venta
- Busqueda por producto
- Filtro por estado de stock (normal, bajo, sin stock)
- Indicadores de color: verde (normal), amarillo (bajo), rojo (sin stock)

**StockEntry (Entrada de Stock):**
- Formulario:
  - Producto (select con busqueda, requerido)
  - Cantidad (numerico > 0, requerido)
  - Proveedor (select, opcional)
  - Documento de referencia (texto, opcional - ej: factura)
  - Notas (textarea, opcional)
- Mostrar stock actual del producto seleccionado
- Mostrar preview: "Stock actual: X -> Nuevo stock: X + cantidad"
- Validacion antes de enviar
- Endpoint: `POST /api/inventory/entry`

**StockExit (Salida de Stock):**
- Formulario:
  - Producto (select con busqueda, requerido)
  - Cantidad (numerico > 0, requerido)
  - Tipo de movimiento (select: SALE, DAMAGED, LOSS, requerido)
  - Documento de referencia (texto, opcional)
  - Notas (textarea, opcional)
- Mostrar stock actual y validar que cantidad <= stock disponible
- Mostrar preview: "Stock actual: X -> Nuevo stock: X - cantidad"
- Alerta si el stock resultante queda por debajo del punto de reorden
- Endpoint: `POST /api/inventory/exit`

**StockAdjust (Ajuste de Inventario):**
- Formulario:
  - Producto (select con busqueda, requerido)
  - Cantidad real (conteo fisico, requerido)
  - Notas/Evidencia (textarea, requerido si diferencia > 10%)
- Mostrar: Stock en sistema vs Conteo fisico, Diferencia
- Advertencia si la diferencia supera el 10%
- Endpoint: `POST /api/inventory/adjustment`

**Movements (Historial de Movimientos):**
- Tabla con: Fecha, Producto, Tipo, Cantidad, Stock Antes, Stock Despues, Usuario, Referencia
- Filtros:
  - Por producto (select)
  - Por tipo de movimiento (select)
  - Por rango de fechas (date pickers)
- Paginacion del servidor
- Badge de color segun tipo de movimiento:
  - ENTRY: verde
  - SALE: azul
  - ADJUSTMENT: amarillo
  - DAMAGED: naranja
  - LOSS: rojo
- Endpoint: `GET /api/inventory/movements`

### Entregables del Sprint 4
- [ ] Hooks de React Query para inventario
- [ ] Vista de stock actual con resumen y filtros
- [ ] Formulario de entrada de stock funcional
- [ ] Formulario de salida de stock con validacion de disponibilidad
- [ ] Formulario de ajuste con deteccion de discrepancias
- [ ] Historial de movimientos con filtros y paginacion
- [ ] Preview de cambios en stock antes de confirmar
- [ ] Notificaciones toast en cada operacion

---

## Sprint 5 - Alertas y Reportes

**Objetivo:** Implementar el sistema de alertas y el modulo de reportes con graficos y exportacion.

### Tarea 5.1 - Hooks de Alertas y Reportes

```
src/hooks/
  useAlerts.ts  - useAlerts(), useAlertsSummary(), useUnresolvedAlerts(), useResolveAlert(), useCreateAlert(), useCheckAlerts()
  useReports.ts - (extender) useLowStock()
```

### Tarea 5.2 - Pagina de Alertas (`src/pages/alerts/`)

```
src/pages/alerts/
  AlertList.tsx       - Lista principal con filtros
  AlertSummary.tsx    - Resumen estadistico de alertas
```

**AlertSummary (parte superior):**
- 4 tarjetas con conteo por tipo: LOW_STOCK, NO_MOVEMENT, DISCREPANCY, SLOW_MOVING
- Total sin resolver vs Total resueltas

**AlertList:**
- Tabla con: Tipo, Producto (SKU + Nombre), Descripcion, Fecha, Estado, Resuelto por, Acciones
- Filtros:
  - Por tipo de alerta (select)
  - Por estado (resueltas / sin resolver)
- Paginacion
- Accion "Resolver" (ADMIN/MANAGER):
  - Abre dialog con campo de notas opcional
  - Endpoint: `PATCH /api/alerts/:id/resolve`
- Accion "Eliminar" (solo ADMIN):
  - Dialog de confirmacion
  - Endpoint: `DELETE /api/alerts/:id`
- Boton "Ejecutar Verificacion" (ADMIN/MANAGER):
  - Ejecuta chequeo manual de alertas
  - Endpoint: `POST /api/alerts/check`
- Badge de color segun tipo y estado
- Indicador visual para alertas criticas (LOW_STOCK con stock = 0)

### Tarea 5.3 - Pagina de Reportes (`src/pages/reports/`)

```
src/pages/reports/
  ReportsPage.tsx        - Contenedor con tabs o sub-navegacion
  InventoryReport.tsx    - Reporte de niveles de stock
  MovementsReport.tsx    - Reporte de movimientos por periodo
  ValueReport.tsx        - Reporte de valor del inventario
  LowStockReport.tsx     - Reporte de productos con stock bajo
```

**InventoryReport:**
- Tabla completa de inventario con niveles de stock
- Graficos de distribucion por categoria
- Filtros por categoria, estado
- Endpoint: `GET /api/reports/inventory`

**MovementsReport:**
- Selector de rango de fechas
- Grafico de barras: entradas vs salidas por dia/semana/mes (Recharts)
- Tabla de movimientos agrupados
- Resumen: total entradas, total salidas, neto
- Endpoint: `GET /api/reports/movements`

**ValueReport (ADMIN/MANAGER):**
- Valor total del inventario (costo vs venta)
- Desglose por categoria (tabla + PieChart)
- Desglose por proveedor (tabla + PieChart)
- Margen estimado
- Endpoint: `GET /api/reports/value`

**LowStockReport:**
- Lista de productos por debajo del punto de reorden
- Columnas: Producto, Stock Actual, Punto de Reorden, Deficit, Proveedor
- Ordenado por deficit (mayor primero)
- Accion rapida: crear orden de reabastecimiento (link a StockEntry con producto pre-seleccionado)
- Endpoint: `GET /api/reports/low-stock`

### Entregables del Sprint 5
- [ ] Hooks de React Query para alertas y reportes
- [ ] Resumen de alertas con conteos por tipo
- [ ] Lista de alertas con filtros y paginacion
- [ ] Resolver y eliminar alertas
- [ ] Verificacion manual de alertas
- [ ] Reporte de inventario con graficos
- [ ] Reporte de movimientos con rangos de fecha
- [ ] Reporte de valor por categoria/proveedor
- [ ] Reporte de stock bajo con acciones rapidas
- [ ] Permisos por rol en reportes y alertas

---

## Sprint 6 - Administracion y Auditoria

**Objetivo:** Implementar gestion de usuarios (ADMIN) y visor de auditoria para trazabilidad completa.

### Tarea 6.1 - Hooks de Usuarios y Auditoria

```
src/hooks/
  useUsers.ts     - useUsers(), useUser(), useCreateUser(), useUpdateUser(), useChangePassword(), useDeleteUser()
  useAuditLogs.ts - useAuditLogs(), useAuditSummary(), useUserLogs(), useRecordHistory()
```

### Tarea 6.2 - Gestion de Usuarios (`src/pages/users/`)

```
src/pages/users/
  UserList.tsx    - Lista de usuarios
  UserForm.tsx    - Formulario de crear/editar usuario
```

**Acceso:** Solo ADMIN

**UserList:**
- Tabla con: Nombre, Email, Rol, Estado (activo/inactivo), Ultimo login, Acciones
- Boton "Nuevo Usuario"
- Acciones: Editar, Cambiar contrasena, Desactivar

**UserForm:**
- Campos: Email, Contrasena (solo crear), Nombre, Apellido, Rol (select: ADMIN, MANAGER, SELLER)
- Validacion de email unico
- Password con requisitos minimos

**Cambiar Contrasena (Dialog):**
- Contrasena actual (solo si es su propia cuenta)
- Nueva contrasena
- Confirmar nueva contrasena
- Endpoint: `PATCH /api/users/:id/change-password`

### Tarea 6.3 - Visor de Auditoria (`src/pages/audit/`)

```
src/pages/audit/
  AuditLogList.tsx    - Lista de logs con filtros
  AuditLogDetail.tsx  - Detalle de un cambio (diff viewer)
  AuditSummary.tsx    - Estadisticas de actividad
```

**Acceso:** Solo ADMIN

**AuditSummary:**
- Acciones por periodo (hoy, semana, mes)
- Top usuarios por actividad
- Tablas mas modificadas

**AuditLogList:**
- Tabla con: Fecha, Usuario, Tabla, Accion, Registro, IP
- Filtros:
  - Por usuario (select)
  - Por tabla (select: products, inventory, categories, suppliers, etc.)
  - Por accion (CREATE, UPDATE, DELETE)
  - Por rango de fechas
- Paginacion del servidor

**AuditLogDetail (expandible o dialog):**
- Mostrar valores anteriores vs nuevos (diff visual)
- Resaltar campos que cambiaron
- Info del usuario que realizo el cambio
- Timestamp exacto y direccion IP

### Entregables del Sprint 6
- [ ] Hooks de React Query para usuarios y auditoria
- [ ] Lista de usuarios con tabla y acciones
- [ ] Crear y editar usuarios (solo ADMIN)
- [ ] Cambiar contrasena
- [ ] Desactivar usuarios (soft delete)
- [ ] Resumen de auditoria con estadisticas
- [ ] Lista de logs con filtros avanzados
- [ ] Detalle de cambios con diff visual
- [ ] Proteccion de rutas por rol (ADMIN)

---

## Sprint 7 - UX, Responsividad y Pulido Final

**Objetivo:** Mejorar la experiencia de usuario, hacer responsive para mobile/tablet, agregar funcionalidades transversales y optimizar rendimiento.

### Tarea 7.1 - Responsive Design

- Sidebar colapsable en mobile (hamburger menu)
- Tablas con scroll horizontal en pantallas pequenas
- Formularios en columna unica en mobile
- Dashboard con grid responsive (1 col mobile, 2 cols tablet, 4 cols desktop)
- Dialogs full-screen en mobile
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`

### Tarea 7.2 - Mejoras de UX

- **Loading states:** Skeleton loaders en tablas y tarjetas
- **Empty states:** Mensajes con ilustracion cuando no hay datos
- **Error boundaries:** Captura de errores de React con UI de fallback
- **Breadcrumbs:** Navegacion contextual en paginas internas
- **Keyboard shortcuts:**
  - `Ctrl+K` / `Cmd+K`: Busqueda global
  - `Escape`: Cerrar modales
- **Busqueda global:** Barra de busqueda en el header que busca en productos, categorias, proveedores
- **Notificaciones mejoradas:** Sonner toasts con acciones (ej: "Deshacer")

### Tarea 7.3 - Tema Oscuro/Claro

- Toggle en el header (ya configurado con next-themes)
- Verificar que todos los componentes se vean bien en ambos temas
- Persistir preferencia en localStorage
- Respetar preferencia del sistema operativo por defecto

### Tarea 7.4 - Optimizacion de Rendimiento

- **Lazy loading** de rutas con `React.lazy()` y `Suspense`
- **Debounce** en campos de busqueda (300ms)
- **Memoizacion** de componentes pesados con `React.memo`
- **Virtualizacion** de tablas grandes (si aplica, con `@tanstack/react-virtual`)
- **Cache de React Query:**
  - `staleTime: 5 minutos` para datos que cambian poco (categorias, proveedores)
  - `staleTime: 1 minuto` para datos dinamicos (inventario, alertas)
  - `refetchOnWindowFocus: true` para datos criticos

### Tarea 7.5 - Accesibilidad (a11y)

- Labels en todos los inputs de formularios
- Roles ARIA en componentes custom
- Navegacion completa con teclado
- Contraste de colores WCAG AA
- Focus visible en elementos interactivos
- Skip navigation link

### Tarea 7.6 - Manejo de Errores Global

- Interceptor de Axios para errores de red
- Pagina 404 para rutas no encontradas
- Pagina 403 para acceso denegado
- Reintentos automaticos en React Query (3 intentos con backoff)
- Mensajes de error amigables (traducir errores del backend)

### Entregables del Sprint 7
- [ ] Sidebar responsive con hamburger menu
- [ ] Todas las tablas responsive
- [ ] Skeleton loaders en vistas principales
- [ ] Empty states en todas las listas
- [ ] Error boundaries implementados
- [ ] Busqueda global funcional
- [ ] Tema oscuro verificado en todos los componentes
- [ ] Lazy loading de rutas
- [ ] Debounce en busquedas
- [ ] Paginas de error (404, 403)
- [ ] Navegacion completa con teclado

---

## Resumen de Sprints

| Sprint | Enfoque | Paginas/Features |
|--------|---------|-----------------|
| **Sprint 1** | Fundamentos y Auth | Tipos, API, Auth, Layout, Login |
| **Sprint 2** | Dashboard y Catalogos | Dashboard, Categorias, Proveedores |
| **Sprint 3** | Productos | CRUD completo de productos |
| **Sprint 4** | Inventario | Entradas, salidas, ajustes, movimientos |
| **Sprint 5** | Alertas y Reportes | Alertas, 4 tipos de reportes, graficos |
| **Sprint 6** | Admin y Auditoria | Usuarios, logs de auditoria |
| **Sprint 7** | UX y Pulido | Responsive, performance, accesibilidad |

## Dependencias entre Sprints

```
Sprint 1 (Fundamentos)
   |
   v
Sprint 2 (Dashboard + Catalogos)
   |
   v
Sprint 3 (Productos) -- depende de Categorias y Proveedores del Sprint 2
   |
   v
Sprint 4 (Inventario) -- depende de Productos del Sprint 3
   |
   +---> Sprint 5 (Alertas/Reportes) -- puede iniciar en paralelo parcial
   |
   +---> Sprint 6 (Admin/Auditoria) -- puede iniciar en paralelo parcial
   |
   v
Sprint 7 (UX/Pulido) -- depende de que todas las paginas existan
```

## Estructura Final de Archivos

```
frontend/src/
  api/
    axios.ts
    auth.api.ts
    users.api.ts
    products.api.ts
    categories.api.ts
    suppliers.api.ts
    inventory.api.ts
    alerts.api.ts
    reports.api.ts
    audit.api.ts
  components/
    layout/
      Layout.tsx
      Sidebar.tsx
      Header.tsx
      ProtectedRoute.tsx
    shared/
      DataTable.tsx
      ConfirmDialog.tsx
      EmptyState.tsx
      LoadingSpinner.tsx
      PageHeader.tsx
      StatusBadge.tsx
      FormField.tsx
      SearchGlobal.tsx
    ui/
      (componentes Shadcn/ui ya existentes)
  context/
    AuthContext.tsx
  hooks/
    useAuth.ts
    useCategories.ts
    useSuppliers.ts
    useProducts.ts
    useInventory.ts
    useAlerts.ts
    useReports.ts
    useUsers.ts
    useAuditLogs.ts
  pages/
    Login.tsx
    Dashboard.tsx
    NotFound.tsx
    Forbidden.tsx
    products/
      ProductList.tsx
      ProductForm.tsx
      ProductFilters.tsx
    inventory/
      InventoryPage.tsx
      InventoryList.tsx
      StockEntry.tsx
      StockExit.tsx
      StockAdjust.tsx
      Movements.tsx
    categories/
      CategoryList.tsx
      CategoryForm.tsx
    suppliers/
      SupplierList.tsx
      SupplierForm.tsx
    alerts/
      AlertList.tsx
      AlertSummary.tsx
    reports/
      ReportsPage.tsx
      InventoryReport.tsx
      MovementsReport.tsx
      ValueReport.tsx
      LowStockReport.tsx
    users/
      UserList.tsx
      UserForm.tsx
    audit/
      AuditLogList.tsx
      AuditLogDetail.tsx
      AuditSummary.tsx
  types/
    index.ts
    auth.types.ts
    user.types.ts
    product.types.ts
    category.types.ts
    supplier.types.ts
    inventory.types.ts
    alert.types.ts
    report.types.ts
    audit.types.ts
    common.types.ts
  lib/
    utils.ts
  assets/
  App.tsx
  main.tsx
  index.css
```
