# TRD - SISTEMA DE GESTIÓN DE INVENTARIO
## 1\. VISIÓN TÉCNICA
Desarrollar una plataforma web modular, escalable y mantenible que separe claramente la lógica de negocio (backend) de la presentación (frontend), permitiendo crecimiento futuro hacia microservicios, múltiples clientes, y integraciones de terceros.

**Stack Recomendado:**

- **Frontend:** React.js + TypeScript
- **Backend:** Node.js/Express o Python/Django
- **Base de Datos:** PostgreSQL
- **Cloud:** AWS/GCP (recomendado: AWS)
- **Versionado:** Git/GitHub
-----
## 2\. ARQUITECTURA GENERAL
~~~
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (NAVEGADOR)               │
│         React.js + TypeScript + Material-UI         │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS/REST API
                     ▼
┌─────────────────────────────────────────────────────┐
│                  API GATEWAY / LOAD BALANCER        │
│              (AWS ALB o similar)                     │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│  BACKEND - INSTANCIA │   │  BACKEND - INSTANCIA │
│  (Node.js/Express)   │   │  (Node.js/Express)   │
│  ├─ Auth Service     │   │  ├─ Auth Service     │
│  ├─ Product Service  │   │  ├─ Product Service  │
│  ├─ Inventory Service│   │  ├─ Inventory Service│
│  ├─ Alert Service    │   │  ├─ Alert Service    │
│  └─ Report Service   │   │  └─ Report Service   │
└──────────────────────┘   └──────────────────────┘
        │                          │
        └────────────┬─────────────┘
                     ▼
        ┌────────────────────────┐
        │   POSTGRESQL DATABASE  │
        │  - Products Table      │
        │  - Inventory Movements │
        │  - Users               │
        │  - Audit Logs          │
        └────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        ▼                           ▼
┌──────────────────────┐  ┌──────────────────────┐
│  REDIS (CACHE)       │  │  S3 (ARCHIVOS/IMG)   │
│  - Sessions          │  │  - Productos Imágenes│
│  - Rate Limiting     │  │  - Reportes PDF      │
│  - Alertas           │  │  - Respaldos         │
└──────────────────────┘  └──────────────────────┘
~~~

-----
## 3\. DESCRIPCIÓN DE COMPONENTES
### 3\.1 Frontend (Cliente)
**Tecnología:** React 18+ con TypeScript

**Estructura de Carpetas:**
~~~
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Header, Footer, Nav
│   ├── products/       # ProductList, ProductForm, ProductDetail
│   ├── inventory/      # StockEntry, StockAdjustment, MovementHistory
│   ├── alerts/         # AlertPanel, AlertSettings
│   └── reports/        # ReportBuilder, ReportViewer
├── pages/              # Páginas/Vistas
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Inventory.tsx
│   ├── Alerts.tsx
│   ├── Reports.tsx
│   └── Login.tsx
├── services/           # Llamadas API
│   ├── apiClient.ts
│   ├── productService.ts
│   ├── inventoryService.ts
│   ├── authService.ts
│   └── reportService.ts
├── hooks/              # React Hooks custom
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useInventory.ts
├── store/              # Estado Global (Redux o Context)
│   ├── authSlice.ts
│   ├── productSlice.ts
│   └── inventorySlice.ts
├── types/              # Tipos TypeScript
│   └── index.ts
├── utils/              # Funciones utilitarias
│   ├── validators.ts
│   ├── formatters.ts
│   └── constants.ts
└── App.tsx
~~~

**Librerías Clave:**

- `react-router-dom`: Enrutamiento
- `axios` o `fetch`: Llamadas HTTP
- `@reduxjs/toolkit`: Manejo de estado
- `material-ui` o `tailwindcss`: Estilos
- `react-query`: Caching de datos
- `recharts` o `chart.js`: Gráficos para reportes
- `jsbarcode`: Generación de códigos de barras
- `pdfmake` o `jspdf`: Generación de PDFs
- `formik` o `react-hook-form`: Manejo de formularios
- `yup` o `zod`: Validación de esquemas

**Requisitos del Navegador:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
### 3\.2 Backend (API)
**Tecnología:** Node.js v18+ con Express.js y TypeScript

**Estructura de Carpetas:**
~~~
src/
├── controllers/        # Lógica de controladores
│   ├── productController.ts
│   ├── inventoryController.ts
│   ├── authController.ts
│   ├── alertController.ts
│   └── reportController.ts
├── services/           # Lógica de negocio
│   ├── productService.ts
│   ├── inventoryService.ts
│   ├── authService.ts
│   ├── alertService.ts
│   └── reportService.ts
├── models/             # Modelos/Schemas (Sequelize/TypeORM)
│   ├── User.ts
│   ├── Product.ts
│   ├── Inventory.ts
│   ├── InventoryMovement.ts
│   ├── Alert.ts
│   └── AuditLog.ts
├── routes/             # Definición de rutas
│   ├── auth.routes.ts
│   ├── products.routes.ts
│   ├── inventory.routes.ts
│   ├── alerts.routes.ts
│   ├── reports.routes.ts
│   └── index.ts
├── middleware/         # Middleware
│   ├── authMiddleware.ts
│   ├── errorHandler.ts
│   ├── requestLogger.ts
│   ├── rateLimiter.ts
│   └── validator.ts
├── utils/              # Funciones utilitarias
│   ├── database.ts
│   ├── logger.ts
│   ├── errorMessages.ts
│   └── helpers.ts
├── jobs/               # Tareas programadas
│   ├── alertJob.ts     # Procesar alertas cada hora
│   ├── reportJob.ts    # Generar reportes
│   └── backupJob.ts    # Respaldo diario
├── config/             # Configuración
│   ├── database.ts
│   ├── env.ts
│   └── constants.ts
├── types/              # Tipos TypeScript
│   └── index.ts
└── server.ts           # Entrada principal
~~~

**Dependencias Clave:**

- `express`: Framework web
- `typescript`: Tipado estático
- `sequelize` o `typeorm`: ORM
- `pg`: Driver PostgreSQL
- `jsonwebtoken`: JWT para autenticación
- `bcryptjs`: Hash de contraseñas
- `joi` o `express-validator`: Validación
- `node-schedule` o `bull`: Tareas programadas
- `pdfkit` o `reportlab`: Generación de reportes
- `winston` o `bunyan`: Logging
- `dotenv`: Variables de entorno
- `cors`: Control de origen cruzado
- `helmet`: Seguridad HTTP
- `express-rate-limit`: Rate limiting
-----
## 4\. ESPECIFICACIÓN DE BASE DE DATOS
### 4\.1 Diagrama ER
~~~
┌──────────────────┐
│      USERS       │
├──────────────────┤
│ id (PK)          │
│ email (UNIQUE)   │
│ password_hash    │
│ first_name       │
│ last_name        │
│ role             │ ──────┐
│ is_active        │       │
│ created_at       │       │
│ updated_at       │       │
└──────────────────┘       │
                           │
        ┌──────────────────┴────────┐
        │                           │
        ▼                           ▼
┌──────────────────┐      ┌──────────────────┐
│    PRODUCTS      │      │  AUDIT_LOGS      │
├──────────────────┤      ├──────────────────┤
│ id (PK)          │      │ id (PK)          │
│ sku (UNIQUE)     │      │ user_id (FK)     │
│ name             │      │ table_name       │
│ barcode          │      │ record_id        │
│ description      │      │ action           │
│ category_id (FK) │◄─┐   │ old_values       │
│ cost_price       │  │   │ new_values       │
│ sale_price       │  │   │ created_at       │
│ reorder_point    │  │   └──────────────────┘
│ status           │  │
│ image_url        │  │
│ supplier_id (FK) │  │
│ created_at       │  │
│ updated_at       │  │
└──────────────────┘  │
        ▲             │
        │ many        │ one
        │             │
┌──────────────────┐  │
│INVENTORY_        │  │
│MOVEMENTS         │  │
├──────────────────┤  │
│ id (PK)          │  │
│ product_id (FK)──┼──┘
│ movement_type    │
│ quantity         │
│ stock_before     │
│ stock_after      │
│ reference_doc    │
│ notes            │
│ created_by (FK)  │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│  CATEGORIES      │
├──────────────────┤
│ id (PK)          │
│ name             │
│ description      │
│ status           │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│    SUPPLIERS     │
├──────────────────┤
│ id (PK)          │
│ name             │
│ contact_email    │
│ phone            │
│ address          │
│ status           │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│     ALERTS       │
├──────────────────┤
│ id (PK)          │
│ product_id (FK)  │
│ alert_type       │
│ is_resolved      │
│ created_at       │
│ resolved_at      │
└──────────────────┘
~~~
### 4\.2 Tablas Principales
**USERS**
~~~ sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'manager', 'seller') DEFAULT 'seller',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
~~~

**PRODUCTS**
~~~ sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  cost_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  reorder_point INTEGER DEFAULT 10,
  status ENUM('active', 'inactive', 'discontinued') DEFAULT 'active',
  image_url VARCHAR(500),
  supplier_id INTEGER REFERENCES suppliers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT price_positive CHECK (cost_price > 0 AND sale_price > 0)
);
~~~

**INVENTORY\_MOVEMENTS**
~~~ sql
CREATE TABLE inventory_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  movement_type ENUM('entry', 'sale', 'adjustment', 'damaged', 'loss') NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  reference_doc VARCHAR(100),
  notes TEXT,
  created_by INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_stock CHECK (stock_before >= 0 AND stock_after >= 0)
);
~~~

**INVENTORY** (Stock actual)
~~~ sql
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER UNIQUE NOT NULL REFERENCES products(id),
  current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
  last_movement_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
~~~

**ALERTS**
~~~ sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  alert_type ENUM('low_stock', 'no_movement', 'discrepancy', 'slow_moving') NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);
~~~

**AUDIT\_LOGS**
~~~ sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_table (table_name, record_id)
);
~~~
### 4\.3 Índices Críticos
~~~ sql
-- Búsqueda rápida
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('spanish', name));
CREATE INDEX idx_products_category ON products(category_id);

-- Performance de inventario
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_date ON inventory_movements(created_at);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(movement_type);

-- Alertas
CREATE INDEX idx_alerts_product ON alerts(product_id);
CREATE INDEX idx_alerts_resolved ON alerts(is_resolved);
CREATE INDEX idx_alerts_date ON alerts(created_at);
~~~

-----
## 5\. ESPECIFICACIÓN DE API REST
### 5\.1 Autenticación
**POST /api/auth/login**
~~~ json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "Juan",
    "role": "manager"
  },
  "expiresIn": 3600
}
~~~

**POST /api/auth/logout**

- Elimina sesión en servidor/Redis

**POST /api/auth/refresh**

- Obtiene nuevo token
### 5\.2 Productos
**GET /api/products**
~~~
Query Params:
- page: number (default: 1)
- limit: number (default: 25)
- category: string
- status: 'active' | 'inactive'
- search: string (busca en nombre, SKU)
- sort: 'name' | 'sku' | 'price' (default: 'name')
- order: 'asc' | 'desc' (default: 'asc')

Response (200):
{
  "data": [
    {
      "id": 1,
      "sku": "PROD001",
      "name": "Laptop",
      "price": 999.99,
      "current_stock": 15,
      "reorder_point": 5,
      "category": "Electronics"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "pages": 6
  }
}
~~~

**POST /api/products** (Admin/Manager)
~~~ json
Request:
{
  "sku": "PROD002",
  "name": "Mouse Inalámbrico",
  "barcode": "5901234123457",
  "description": "Mouse inalámbrico con batería 3 meses",
  "category_id": 2,
  "cost_price": 15.00,
  "sale_price": 29.99,
  "reorder_point": 20,
  "supplier_id": 5,
  "image_url": "https://..."
}

Response (201):
{
  "id": 2,
  "sku": "PROD002",
  ...
}
~~~

**GET /api/products/:id**
~~~
Response (200):
{
  "id": 1,
  "sku": "PROD001",
  "name": "Laptop",
  "barcode": "...",
  "description": "...",
  "category": { "id": 1, "name": "Electronics" },
  "cost_price": 800.00,
  "sale_price": 999.99,
  "current_stock": 15,
  "reorder_point": 5,
  "supplier": { "id": 1, "name": "Tech Supplies Inc" },
  "status": "active",
  "image_url": "...",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:22:00Z"
}
~~~

**PUT /api/products/:id** (Admin/Manager)
~~~
Actualiza el producto
Response (200): Producto actualizado
~~~

**DELETE /api/products/:id** (Admin only)
~~~
Marca como inactivo (soft delete)
Response (204): No content
~~~
### 5\.3 Inventario
**GET /api/inventory**
~~~
Obtiene stock actual de todos los productos

Response (200):
{
  "data": [
    {
      "product_id": 1,
      "sku": "PROD001",
      "name": "Laptop",
      "current_stock": 15,
      "reorder_point": 5,
      "status": "ok",
      "last_movement": "2024-01-20T14:22:00Z",
      "value": 14999.85
    }
  ],
  "total_inventory_value": 45230.50,
  "low_stock_count": 3
}
~~~

**POST /api/inventory/entry** (Manager)
~~~ json
Request:
{
  "product_id": 1,
  "quantity": 50,
  "reference_doc": "ORD-2024-001",
  "supplier_id": 1,
  "notes": "Compra a Tech Supplies"
}

Response (201):
{
  "movement_id": 1001,
  "product_id": 1,
  "movement_type": "entry",
  "quantity": 50,
  "stock_before": 15,
  "stock_after": 65,
  "created_at": "2024-01-20T15:00:00Z"
}
~~~

**POST /api/inventory/sale** (All authenticated)
~~~ json
Request:
{
  "product_id": 1,
  "quantity": 2,
  "reference_doc": "VTA-2024-001"
}

Response (201): Movimiento registrado
~~~

**POST /api/inventory/adjustment** (Manager)
~~~ json
Request:
{
  "product_id": 1,
  "quantity": 5,
  "adjustment_type": "loss",
  "notes": "Producto dañado en almacén",
  "image_url": "https://..." (opcional, requerido si qty > 10% stock)
}

Response (201): Ajuste registrado
~~~

**GET /api/inventory/movements/:product\_id**
~~~
Query Params:
- start_date: ISO date
- end_date: ISO date
- type: 'entry' | 'sale' | 'adjustment'
- limit: number (default: 50)

Response (200):
{
  "data": [
    {
      "id": 1001,
      "movement_type": "entry",
      "quantity": 50,
      "stock_before": 15,
      "stock_after": 65,
      "reference_doc": "ORD-2024-001",
      "notes": "Compra a Tech Supplies",
      "created_by": "Juan Pérez",
      "created_at": "2024-01-20T15:00:00Z"
    }
  ]
}
~~~
### 5\.4 Alertas
**GET /api/alerts**
~~~
Query Params:
- resolved: true | false (default: false)
- type: 'low_stock' | 'no_movement' | 'discrepancy'
- limit: 50

Response (200):
{
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Laptop",
      "alert_type": "low_stock",
      "current_stock": 3,
      "reorder_point": 5,
      "is_resolved": false,
      "created_at": "2024-01-20T14:00:00Z"
    }
  ]
}
~~~

**PUT /api/alerts/:id/resolve** (Manager)
~~~ json
Request:
{
  "notes": "Orden de compra enviada"
}

Response (200): Alerta resuelta
~~~
### 5\.5 Reportes
**GET /api/reports/inventory**
~~~
Query Params:
- format: 'json' | 'pdf' | 'excel'
- category_id: number (opcional)
- include_inactive: true | false

Response (200):
{
  "title": "Reporte de Inventario",
  "generated_at": "2024-01-20T15:30:00Z",
  "total_products": 150,
  "total_inventory_value": 45230.50,
  "products": [...]
}
~~~

**GET /api/reports/movements**
~~~
Query Params:
- start_date, end_date (requerido)
- type: 'entry' | 'sale'
- format: 'json' | 'pdf' | 'excel'

Response: Reporte de movimientos
~~~

**GET /api/reports/low-stock**
~~~
Productos con stock bajo
Response: Lista de productos bajo reorden
~~~
### 5\.6 Usuarios (Admin only)
**GET /api/users** **POST /api/users** **PUT /api/users/:id** **DELETE /api/users/:id** (desactiva)

-----
## 6\. SEGURIDAD
### 6\.1 Autenticación y Autorización
- **JWT (JSON Web Tokens):** Tokens con expiración 1 hora
- **Refresh Tokens:** Duración 7 días, almacenados en Redis
- **Hashing:** bcryptjs con salt rounds 10
- **CORS:** Whitelist de dominios permitidos
- **HTTPS:** Obligatorio en producción
- **Rate Limiting:** 100 requests/minuto por IP
### 6\.2 Validación de Entrada
- Sanitización de todos los inputs (XSS prevention)
- Validación de tipos con Joi/Zod
- Validación de longitud de campos
- Códigos de barras y SKU: validación de formato
- SQL Injection: Prepared statements obligatorios
### 6\.3 Protección de Datos
- Encriptación en tránsito: TLS 1.2+
- Encriptación en reposo: RDS encryption en AWS
- Contraseñas: Mínimo 8 caracteres, complejidad requerida
- PII: Logs no contienen datos sensibles
- GDPR: Right to deletion implementado
### 6\.4 Auditoría
- Todas las operaciones críticas registradas
- Quién, qué, cuándo, desde dónde
- Retención: 2 años
- No se pueden modificar/eliminar logs
-----
## 7\. INFRAESTRUCTURA Y DEPLOYMENT
### 7\.1 Ambiente de Desarrollo
- **Local:** Docker Compose para PostgreSQL, Redis
- **VSCode Extensions:** ESLint, Prettier, Thunder Client
- **Pre-commit Hooks:** Lint automático
### 7\.2 Ambiente de Producción (AWS)
~~~
Load Balancer (ALB)
      ↓
EC2 Auto Scaling Group (2-5 instancias)
      ├─ Node.js + Express
      └─ Nginx reverse proxy
      ↓
RDS PostgreSQL (Multi-AZ)
      ↓
ElastiCache Redis (Cluster mode)
      ↓
S3 para archivos (backup diario)
      ↓
CloudWatch para logs y monitoring
~~~
### 7\.3 CI/CD Pipeline
~~~
Git Push
   ↓
GitHub Actions
   ├─ Lint + Tests
   ├─ Build Docker Image
   ├─ Push a ECR
   └─ Deploy a ECS/EC2
   ↓
Staging Environment (verificación)
   ↓
Production (si todo pasa)
~~~
### 7\.4 Respaldos
- **Frequency:** Diario a las 2 AM UTC
- **Retention:** 30 días
- **Location:** S3 con replicación a otra región
- **RTO:** 4 horas
- **RPO:** 24 horas
-----
## 8\. MONITOREO Y PERFORMANCE
### 8\.1 Métricas Clave
~~~
Application:
- Requests/segundo
- Latencia promedio (p50, p95, p99)
- Tasa de errores (4xx, 5xx)
- Request size promedio
- Response time por endpoint

Database:
- Query tiempo promedio
- Conexiones activas
- CPU/Memory usage
- Locks/Deadlocks
- Tamaño de base de datos

Infrastructure:
- CPU usage
- Memory usage
- Disk space
- Network I/O
- Uptime
~~~
### 8\.2 Alertas
- Error rate > 1% → Critical
- Latencia p95 > 2s → Warning
- Disk space > 80% → Warning
- CPU > 75% → Warning
- RDS connections > 80 → Critical
### 8\.3 Logging
- **Level:** DEBUG, INFO, WARN, ERROR
- **Format:** JSON para fácil parsing
- **Centralized:** CloudWatch o ELK Stack
- **Retention:** 30 días
-----
## 9\. TESTING
### 9\.1 Estrategia de Testing
**Backend:**

- Unit Tests: Jest (mínimo 80% coverage)
- Integration Tests: Supertest para APIs
- E2E Tests: Cypress (flujos críticos)
- Load Tests: Apache JMeter (500 usuarios)

**Frontend:**

- Unit Tests: Jest + React Testing Library
- Component Tests: Storybook
- E2E Tests: Cypress
- Visual Regression: Percy o similar

**Database:**

- Script de seed para datos de prueba
- Migrations probadas en cada cambio
### 9\.2 Ejemplo Test Unit
~~~ typescript
// productService.test.ts
describe('ProductService', () => {
  it('should create a product with valid data', async () => {
    const productData = {
      sku: 'TEST001',
      name: 'Test Product',
      cost_price: 10,
      sale_price: 20
    };
    
    const product = await productService.create(productData);
    
    expect(product.sku).toBe('TEST001');
    expect(product.sale_price).toBe(20);
  });

  it('should throw error for duplicate SKU', async () => {
    await expect(
      productService.create({ sku: 'DUP001', ... })
    ).rejects.toThrow('SKU already exists');
  });
});
~~~

-----
## 10\. DOCUMENTACIÓN
### 10\.1 Documentación Técnica
- **API Docs:** Swagger/OpenAPI (autogenerado de comentarios)
- **Architecture Decision Records (ADRs):** Decisiones técnicas
- **Database Schema:** Diagrama ER actualizado
- **Deployment Guide:** Pasos para desplegar
- **Troubleshooting Guide:** Problemas comunes y soluciones
### 10\.2 Documentación de Usuario
- **User Manual:** Paso a paso con screenshots
- **Video Tutorials:** Funcionalidades clave
- **FAQ:** Preguntas frecuentes
- **Video Demo:** 5 minutos mostrando el sistema
-----
## 11\. TECNOLOGÍAS Y VERSIONES
~~~
Frontend:
- Node.js: 18.x LTS
- React: 18.2+
- TypeScript: 5.x
- Material-UI: 5.x
- React Router: 6.x
- Redux: 4.2+
- Axios: 1.4+

Backend:
- Node.js: 18.x LTS
- Express: 4.18+
- TypeScript: 5.x
- Sequelize: 6.35+ (ORM)
- PostgreSQL: 14+
- Redis: 7.x
- Jest: 29.x

Infrastructure:
- Docker: 24.x
- AWS: Latest APIs
- GitHub: For version control
~~~

-----
## 12\. ROADMAP TÉCNICO
**Sprint 1 (Semanas 1-2):** Setup inicial, auth, CRUD básico **Sprint 2 (Semanas 3-4):** Inventario, movimientos, alertas **Sprint 3 (Semanas 5-6):** Reportes, UI, optimizaciones **Sprint 4 (Semanas 7-8):** Testing, deployment, documentación

-----
## 13\. LISTA DE VERIFICACIÓN PRE-PRODUCCIÓN
- [ ] Tests: 80%+ coverage
- [ ] Seguridad: Penetration test completado
- [ ] Performance: Load testing con 500 usuarios simultáneos
- [ ] Database: Backup y restore probado
- [ ] Disaster Recovery: Plan probado
- [ ] Documentation: Completa y actualizada
- [ ] Training: Equipo capacitado
- [ ] Monitoring: Dashboards configurados
- [ ] Alertas: Configuradas y probadas
- [ ] SSL Certificate: Válido y configurado
-----
## 14\. PREGUNTAS TÉCNICAS ABIERTAS
1. ¿Usar Sequelize o TypeORM como ORM?
1. ¿Redux o Context API para estado del frontend?
1. ¿Docker Compose para local o setup manual?
1. ¿GraphQL o REST para API?
1. ¿Server-side rendering (Next.js) o SPA?
1. ¿Microservicios desde inicio o monolito escalable?
