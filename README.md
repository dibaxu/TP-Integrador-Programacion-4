# TPI Food Store - Pedro Sota

Programación IV - Tecnicatura Universitaria en Programación a Distancia, UTN.

Aplicación de pedidos de comida construida según el UML. Se toman como referencia el frontend de TP10, adaptando sus contratos al TPI.

- Repositorio de GitHub: [Repositorio](https://github.com/dibaxu/TP-Integrador-Programacion-4)
- Video: [Video](https://www.youtube.com/watch?v=HiS9Pj_yoMU)

## Requisitos

- Python 3.11, 3.12 o 3.13 disponible como `python` (validado con 3.12).
- PostgreSQL 15 o superior (validado con 18.6).
- Node.js 24 y pnpm 9 o superior (validado con pnpm 12.10.1).
- Dos terminales: una para el backend y otra para el frontend.


## Backend

Crear una base **nueva** llamada `foodstore_tpi` en PostgreSQL, desde pgAdmin o con `createdb -U postgres foodstore_tpi`. No reutilizar bases de trabajos anteriores: `create_all` crea tablas, no migra modelos existentes.

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Editar `backend/.env` y completar `DATABASE_URL` con el usuario, la contraseña y el puerto de PostgreSQL. Generar una clave para `SECRET_KEY` y pegarla en ese archivo:

```powershell
.\.venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(48))"
```

Inicializar los datos y ejecutar:

```powershell
.\.venv\Scripts\python.exe -m app.db.seed
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

API: `http://localhost:8000/api/v1`. Documentación: `http://localhost:8000/docs` y `http://localhost:8000/redoc`.

El seed crea, sin duplicar ni modificar registros existentes:

- Usuario **admin**, contraseña **Admin1234!**, email `admin@foodstore.com`, rol `admin`.
- Tres categorías y ocho productos con 20 unidades de stock cada uno.

El login usa el **username**, no el email. Para crear un cliente, usar el formulario de registro. El registro público asigna siempre `user`. Las imágenes iniciales usan una URL al recurso `comida.svg` servido por el frontend; el administrador puede sustituirla por otra URL HTTP/HTTPS.

### Variables del backend

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL, por ejemplo `postgresql+psycopg2://postgres:CONTRASENA@localhost:5432/foodstore_tpi` |
| `SECRET_KEY` | Clave de firma del JWT, de al menos 32 caracteres |
| `ALGORITHM` | Algoritmo del JWT: `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie: `30` |
| `FRONTEND_ORIGIN` | Origen autorizado por CORS: `http://localhost:5173` |


## Frontend

En otra terminal, desde la carpeta que contiene este README:

```powershell
cd frontend
Copy-Item .env.example .env
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

Abrir `http://localhost:5173`. La variable `VITE_API_URL` es `http://localhost:8000/api/v1`: incluye el prefijo. Reiniciar Vite si se modifica `.env`. Usar `localhost` tanto en el navegador como en la URL de la API para que la cookie viaje correctamente.

## Funcionalidades y rutas

| Ruta frontend | Acceso | Función |
| --- | --- | --- |
| `/` | Público | Catálogo con búsqueda, filtro por categoría, paginación en servidor y estados de carga, vacío y error |
| `/login`, `/register` | Público | Autenticación y registro con TanStack Form |
| `/carrito` | Público | Productos, cantidades, subtotales y total estimado; persiste al recargar |
| `/checkout` | Sesión | Dirección, efectivo o transferencia y notas; crea el pedido y vacía el carrito solo si tiene éxito |
| `/mis-pedidos` | Sesión | Listado, detalle y cancelación propia en PENDIENTE; la API devuelve todos al admin |
| `/admin/resumen` | Admin | Tarjetas de conteos e ingresos por pedidos entregados |
| `/admin/categorias` | Admin | Altas, edición y bajas lógicas con TanStack Form y Table |
| `/admin/productos` | Admin | ABM, categoría, precio, imagen URL, stock y disponibilidad |
| `/admin/pedidos` | Admin | Filtro por estado, detalle, avance y cancelación |
| `/admin/usuarios` | Admin | TanStack Table; activar y desactivar; sin desactivación de la cuenta propia |
| `/unauthorized` | Público | Acceso denegado |

El panel de productos solicita `limit=100` y pagina con TanStack Table, según la consigna. Pedidos usa lotes de hasta 100 y permite acceder a los siguientes si se supera esa cantidad. Los indicadores de «hoy» se calculan en UTC, igual que las fechas almacenadas; las fechas de los pedidos se muestran en el horario del navegador.

## Arquitectura

```text
backend/app/
  main.py
  core/       config, database, security, deps, schemas, errors,
              base_repository, unit_of_work
  modules/
    auth/       router, service, schemas
    usuarios/   models, schemas, repository, unit_of_work, service, router
    categorias/ models, schemas, repository, unit_of_work, service, router
    productos/  models, schemas, repository, unit_of_work, service, router
    pedidos/    models, schemas, repository, unit_of_work, service, router
  db/seed.py

frontend/src/
  features/   auth, categorias, productos, pedidos, usuarios
              (pages, components, hooks, api y types según cada dominio)
  shared/     api, components, ui, layout
  store/      authStore, cartStore
  routes/     AppRouter, ProtectedRoute
  App.tsx
  main.tsx
```

El Router valida HTTP y permisos con `Depends`, delega al Service y traduce excepciones de dominio a `HTTPException`. El Service abre `with self.uow as uow`, aplica reglas y construye el schema de salida dentro del bloque. Los repositorios heredan de `BaseRepository[T]`. El Unit of Work comparte una sesión y concentra `commit`, `rollback` y `close` en `__exit__`; ni Router ni Service confirman transacciones.

Las cinco tablas y sus relaciones son las del UML: `Usuario`, `Categoria`, `Producto`, `Pedido` y `DetallePedido`. Categorías y productos usan `activo`; usuarios usa `disabled`. Los pedidos no se borran. Se conservan los nombres de relaciones `productos/categoria`, `pedidos/usuario`, `items/pedido` y `detalles/producto`.

TanStack Query administra datos del servidor e invalidaciones. Zustand conserva sesión y carrito con `persist`; `partialize` guarda únicamente el usuario en auth. La aplicación confirma la sesión con `/auth/me` antes de habilitar rutas protegidas: un perfil persistido no autoriza operaciones. Axios usa credenciales; un 401 fuera de login y verificación de sesión, o una cuenta desactivada, limpia auth y las consultas privadas. El catálogo público se conserva. El JWT solo viaja en una cookie HttpOnly y nunca se expone en el cuerpo ni en localStorage.

## API y reglas de negocio

Todos los endpoints están bajo `/api/v1`; `/docs` contiene los schemas y parámetros completos.

| Recurso | Operaciones |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/token` (formulario OAuth2), `/auth/logout`; `GET /auth/me` |
| Usuarios | `GET /admin/usuarios`; `POST /admin/usuarios/{id}/activar` y `/desactivar` |
| Categorías | `GET/POST /categorias`; `GET/PUT/DELETE /categorias/{id}` |
| Productos | `GET/POST /productos`; `GET/PUT/DELETE /productos/{id}`; `PATCH /productos/{id}/stock` |
| Pedidos | `POST/GET /pedidos`; `GET /pedidos/resumen`; `GET /pedidos/{id}`; `PATCH /pedidos/{id}/estado` y `/cancelar` |

Productos acepta `skip`, `limit` (20 por defecto, máximo 100), `search`, `categoria_id` y `disponible`; pedidos acepta `skip`, `limit` y `estado`. Ambos devuelven `{total, items}`. `PUT` conserva campos omitidos. Un registro dado de baja responde 404; los DELETE de catálogo responden 204 sin cuerpo. Dar de baja una categoría no libera su nombre ni oculta sus productos.

- RN-01: carrito con al menos un ítem, sin productos repetidos. La compra verifica actividad, disponibilidad y stock; descuenta y crea cada línea en la misma transacción. El servidor calcula precios y total. Si falla un ítem, se revierte todo.
- RN-02: `PENDIENTE -> EN_PREPARACION -> ENTREGADO`; desde los dos primeros se puede pasar a `CANCELADO`. Los terminales no admiten cambios. El mapa vive en el Service.
- RN-03: cancelar devuelve el stock dentro de la misma transacción, incluso si el producto fue dado de baja después de comprarlo. Se bloquea el pedido para impedir restituciones dobles.
- RN-04: un cliente solo consulta y cancela sus pedidos, en PENDIENTE. El admin ve todos y avanza o cancela los no terminales. Las escrituras de catálogo y gestión de usuarios exigen admin.
- RN-05: nombre, precio, líneas y total quedan fijos al crear el pedido. No hay endpoints para editar líneas, total o borrar pedidos.
- RN-06: pago `EFECTIVO` o `TRANSFERENCIA`, dirección de 5 a 200 caracteres.

Los productos se bloquean por id en orden ascendente al comprar o restituir stock, para evitar ventas simultáneas del mismo stock y cruces de bloqueos. Los códigos de respuesta siguen la consigna: 401 sesión o credenciales, 400 cuenta desactivada y reglas de negocio, 403 rol o pedido ajeno, 404 inexistentes, 409 duplicados y 422 validación del schema.

