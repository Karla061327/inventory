# Guia de Pruebas del Frontend

## Requisitos Previos

### 1. Backend corriendo
```bash
cd inventory
npm run start:dev
```
El backend debe estar en `http://localhost:3000`

### 2. Frontend corriendo
```bash
cd frontend
npm run dev
```
El frontend estara en `http://localhost:5173`

### 3. Usuario de prueba
Asegurate de tener un usuario creado en la base de datos. Si usaste el seed del backend, deberia existir un usuario admin.

---

## Pruebas Funcionales

### 1. R edireccion a Login (Ruta Protegida)

**Objetivo:** Verificar que usuarios no autenticados son redirigidos al login.

**Pasos:**
1. Abre una ventana de incognito o limpia el localStorage del navegador
2. Navega a `http://localhost:5173/`
3. **Resultado esperado:** Debes ser redirigido automaticamente a `/login`

**Prueba adicional:**
- Intenta acceder directamente a `/products`, `/inventory`, `/categories`, etc.
- Todas deben redirigir a `/login`

---

### 2. Login con Credenciales Invalidas

**Objetivo:** Verificar el manejo de errores en login.

**Pasos:**
1. En la pagina de login, ingresa:
   - Email: `usuario@falso.com`
   - Password: `passwordincorrecta`
2. Haz clic en "Ingresar"
3. **Resultado esperado:**
   - Aparece un toast con mensaje "Credenciales invalidas"
   - Permaneces en la pagina de login

---

### 3. Login Exitoso

**Objetivo:** Verificar que el login funciona correctamente.

**Pasos:**
1. En la pagina de login, ingresa las credenciales validas:
   - Email: `admin@inventory.com` (o el email de tu usuario)
   - Password: `Admin123!` (o la password de tu usuario)
2. Haz clic en "Ingresar"
3. **Resultado esperado:**
   - El boton muestra "Ingresando..." mientras procesa
   - Eres redirigido al Dashboard (`/`)
   - Ves el mensaje "Bienvenido, [tu email o nombre]"

---

### 4. Verificar Persistencia de Sesion

**Objetivo:** Verificar que la sesion persiste al recargar la pagina.

**Pasos:**
1. Despues de hacer login exitoso
2. Recarga la pagina (F5 o Ctrl+R)
3. **Resultado esperado:**
   - Sigues en el Dashboard (no te redirige a login)
   - Tu informacion de usuario sigue visible en el header

**Verificar token en localStorage:**
1. Abre DevTools (F12)
2. Ve a Application > Local Storage > http://localhost:5173
3. Debe existir una key `token` con un valor JWT

---

### 5. Navegacion del Sidebar

**Objetivo:** Verificar que todos los links del sidebar funcionan.

**Pasos:**
1. Estando logueado, haz clic en cada item del sidebar:

| Link | URL esperada | Titulo de pagina |
|------|--------------|------------------|
| Dashboard | `/` | Dashboard |
| Productos | `/products` | Productos |
| Inventario | `/inventory` | Inventario |
| Categorias | `/categories` | Categorias |
| Proveedores | `/suppliers` | Proveedores |
| Alertas | `/alerts` | Alertas |

2. **Resultado esperado:**
   - Cada link navega a la URL correcta
   - El item activo se resalta en el sidebar
   - La pagina muestra el titulo correspondiente

---

### 6. Pestanas de Inventario

**Objetivo:** Verificar que las tabs de la pagina de inventario funcionan.

**Pasos:**
1. Navega a `/inventory`
2. Haz clic en cada pestana:
   - Stock Actual
   - Entrada
   - Salida
   - Ajuste
   - Movimientos

3. **Resultado esperado:**
   - Cada tab muestra su contenido placeholder
   - La tab activa se resalta visualmente

---

### 7. Header - Informacion de Usuario

**Objetivo:** Verificar que el header muestra la informacion correcta.

**Pasos:**
1. Estando logueado, observa el header (barra superior)
2. **Resultado esperado:**
   - Muestra el email o nombre del usuario
   - Muestra el rol del usuario en un badge (ej: "admin")
   - Aparece el boton "Salir"

---

### 8. Logout

**Objetivo:** Verificar que el logout funciona correctamente.

**Pasos:**
1. Estando logueado, haz clic en el boton "Salir" en el header
2. **Resultado esperado:**
   - Eres redirigido a `/login`
   - El token se elimina del localStorage

**Verificar:**
1. Abre DevTools > Application > Local Storage
2. La key `token` ya no debe existir
3. Intenta navegar a `/` - debe redirigir a `/login`

---

### 9. Expiracion de Token (401)

**Objetivo:** Verificar el manejo de tokens expirados.

**Pasos:**
1. Estando logueado, abre DevTools > Application > Local Storage
2. Modifica el valor del `token` a un valor invalido (ej: "token_invalido")
3. Recarga la pagina
4. **Resultado esperado:**
   - Eres redirigido a `/login`
   - El token invalido se elimina del localStorage

---

## Pruebas con DevTools

### Verificar Peticiones de Red

1. Abre DevTools (F12) > Network
2. Filtra por "Fetch/XHR"
3. Realiza login y observa:
   - `POST /api/auth/login` - debe retornar 200 con access_token
   - `GET /api/auth/profile` - se llama al recargar para verificar sesion

### Verificar Estado de React Query

Si tienes React Query DevTools instalado:
1. Abre el panel de React Query
2. Observa las queries y mutations en cache

---

## Checklist Rapido

- [ ] Redirige a `/login` sin autenticacion
- [ ] Muestra error con credenciales invalidas
- [ ] Login exitoso redirige a Dashboard
- [ ] Token se guarda en localStorage
- [ ] Sesion persiste al recargar
- [ ] Todos los links del sidebar funcionan
- [ ] Item activo se resalta en sidebar
- [ ] Tabs de inventario funcionan
- [ ] Header muestra usuario y rol
- [ ] Logout limpia sesion y redirige
- [ ] Token invalido redirige a login

---

## Troubleshooting

### Error: "Network Error" al hacer login
- Verifica que el backend este corriendo en `http://localhost:3000`
- Verifica CORS en el backend

### No redirige despues del login
- Abre la consola del navegador y busca errores
- Verifica que la respuesta del login incluya `access_token` y `user`

### El sidebar no resalta la ruta activa
- Verifica que la URL coincida exactamente con el path del NavLink
- Para Dashboard, debe ser exactamente `/`

### Error 401 constante
- Limpia el localStorage completamente
- Vuelve a hacer login
