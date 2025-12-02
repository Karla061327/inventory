# ⚡ TablePlus - Inicio Rápido (2 Minutos)

## 🎯 Configuración en 3 Pasos

### Paso 1: Descarga e Instala (30 segundos)
```
🔗 https://tableplus.com/windows
O ejecuta: winget install TablePlus.TablePlus
```

### Paso 2: Crear Conexión (60 segundos)

Abre TablePlus → `Ctrl+N` → PostgreSQL

```
┌────────────────────────────────────────┐
│  📝 Configuración                      │
├────────────────────────────────────────┤
│  Name:       Inventory DB              │
│  Color:      🟢 Verde                  │
├────────────────────────────────────────┤
│  Host:       localhost                 │
│  Port:       5433          ⚠️ NO 5432  │
│  User:       postgres                  │
│  Password:   postgres                  │
│  Database:   inventory_db              │
└────────────────────────────────────────┘

✅ Click "Test" → ✅ Success
✅ Click "Connect"
```

### Paso 3: ¡Listo! (30 segundos)

Deberías ver:
```
📁 inventory_db
 ├── 📋 Tables (8)
 │   ├── ✅ alerts
 │   ├── ✅ audit_logs
 │   ├── ✅ categories
 │   ├── ✅ inventory
 │   ├── ✅ inventory_movements
 │   ├── ✅ products
 │   ├── ✅ suppliers
 │   └── ✅ users
```

---

## 🚀 Primeros Queries (Copiar y Pegar)

### 1. Ver Todos los Productos
```sql
SELECT * FROM products;
```
`Ctrl+T` → Pega → `Ctrl+Enter`

### 2. Dashboard de Inventario
```sql
SELECT
    p.name as producto,
    i.current_stock as stock,
    p.reorder_point,
    CASE
        WHEN i.current_stock < p.reorder_point THEN '⚠️ BAJO'
        ELSE '✅ OK'
    END as estado
FROM products p
JOIN inventory i ON i.product_id = p.id
ORDER BY i.current_stock;
```

### 3. Movimientos de Hoy
```sql
SELECT
    p.name as producto,
    im.movement_type as tipo,
    im.quantity as cantidad,
    im.created_at as hora
FROM inventory_movements im
JOIN products p ON p.id = im.product_id
WHERE DATE(im.created_at) = CURRENT_DATE
ORDER BY im.created_at DESC;
```

---

## 🎨 Vista Rápida

### Explorar Tabla
```
Double click en "products" → Ver datos
```

### Filtrar
```
Click en filtro (arriba)
Escribe: name LIKE '%laptop%'
Enter
```

### Editar (Solo desarrollo)
```
Double click en celda → Edita → Enter
```

---

## ⌨️ Atajos Esenciales

| Atajo | Acción |
|-------|--------|
| `Ctrl+N` | Nueva conexión |
| `Ctrl+T` | Nueva pestaña SQL |
| `Ctrl+Enter` | Ejecutar query |
| `Ctrl+R` | Refrescar |
| `Ctrl+F` | Buscar |

---

## 🔧 Si No Conecta

### Error: "Connection refused"
```bash
# Verifica Docker
docker ps | findstr inventory-postgres

# Si no aparece:
docker-compose up -d
```

### Error: Puerto incorrecto
```
✅ Usa: 5433
❌ NO uses: 5432
```

---

## 📚 Archivos Útiles

- **TABLEPLUS_SETUP.md** → Guía completa con detalles
- **TABLEPLUS_QUERIES.sql** → 30+ queries listos para usar
  - Abre este archivo en TablePlus
  - Copia cualquier query
  - Pega y ejecuta

---

## 🎯 Queries Más Útiles

### Productos con Stock Bajo
```sql
SELECT
    p.name,
    i.current_stock,
    p.reorder_point
FROM products p
JOIN inventory i ON i.product_id = p.id
WHERE i.current_stock < p.reorder_point;
```

### Ventas de Hoy
```sql
SELECT
    p.name,
    SUM(im.quantity) as vendidas,
    SUM(im.quantity * p.sale_price) as total_$
FROM inventory_movements im
JOIN products p ON p.id = im.product_id
WHERE im.movement_type = 'sale'
  AND DATE(im.created_at) = CURRENT_DATE
GROUP BY p.name;
```

### Top 5 Productos Más Vendidos
```sql
SELECT
    p.name,
    SUM(im.quantity) as total_vendido
FROM inventory_movements im
JOIN products p ON p.id = im.product_id
WHERE im.movement_type = 'sale'
GROUP BY p.name
ORDER BY total_vendido DESC
LIMIT 5;
```

---

## ✅ Checklist

- [ ] TablePlus instalado
- [ ] Conexión creada con puerto 5433
- [ ] Test conexión exitoso
- [ ] Veo 8 tablas en sidebar
- [ ] Ejecuté query de prueba
- [ ] Query retornó datos correctamente

---

## 💡 Tips Rápidos

### Guardar Query Favorito
```
Ctrl+D → Agrega a favoritos
Acceso rápido desde sidebar
```

### Múltiples Queries
```sql
-- Ejecuta todos:
SELECT * FROM products;
SELECT * FROM categories;
SELECT * FROM suppliers;
-- Selecciona todos → Ctrl+Enter
```

### Exportar Datos
```
Ejecuta query → Click "Export" → CSV/JSON/Excel
```

### Tema Oscuro
```
Ctrl+, → Appearance → Dark
```

---

## 🎓 Próximos Pasos

1. ✅ **Abre TABLEPLUS_QUERIES.sql**
   - Tiene 30+ queries listos
2. ✅ **Prueba el Dashboard Query**
   - Ver resumen completo
3. ✅ **Explora cada tabla**
   - Familiarízate con la estructura
4. ✅ **Crea tus propias vistas**
   - Personaliza dashboards

---

## 🆘 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| No conecta | `docker ps` → `docker-compose up -d` |
| Puerto wrong | Usa 5433, no 5432 |
| No data | Ejecuta endpoints en Postman primero |
| Lento | Cierra pestañas no usadas |

---

## 🔗 Recursos

- **Documentación completa**: TABLEPLUS_SETUP.md
- **30+ Queries útiles**: TABLEPLUS_QUERIES.sql
- **Configurar Docker**: DOCKER_SETUP.md
- **Probar API**: POSTMAN_SETUP.md

---

**⏱️ Tiempo total: 2 minutos**
**🎯 Resultado: Base de datos visual y funcional**

🚀 **¡A explorar tu inventario!**
