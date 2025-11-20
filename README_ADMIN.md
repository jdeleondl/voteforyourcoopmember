# 🔐 Panel de Administración - COOPINTEC 2025

## 📋 Resumen

El Panel de Administración permite a los administradores del sistema gestionar todos los aspectos del proceso de votación, incluyendo miembros, asistencia, candidatos, configuración y más.

## 🚀 Acceso al Panel

### URL de Acceso
```
http://localhost:3000/admin/login
```

### Credenciales por Defecto
```
Usuario: admin
Contraseña: admin123
```

**⚠️ IMPORTANTE:** Cambia estas credenciales después del primer inicio de sesión en producción.

## ✨ Características Implementadas

### ✅ 1. Sistema de Autenticación
- Login seguro con usuario y contraseña
- Gestión de sesiones con cookies HTTP-only
- Middleware para proteger rutas administrativas
- Logout con limpieza de sesión
- Verificación automática de sesión

### ✅ 2. Dashboard Principal
**Estadísticas en Tiempo Real:**
- Total de miembros (activos/inactivos)
- Asistentes confirmados con porcentaje
- Votos emitidos con participación
- Candidatos registrados por consejo

**Accesos Rápidos:**
- Gestionar Miembros
- Códigos de Votación
- Configuración del Sistema

**Estado del Sistema:**
- Base de Datos (conectado/desconectado)
- API (operativo/error)
- Email (configurado/pendiente)
- Votación (activa/inactiva)

### ✅ 3. Layout y Navegación
- Sidebar responsivo con menú colapsable
- Navegación por módulos
- Información del usuario logueado
- Botón de cerrar sesión
- Vista móvil optimizada

### ✅ 4. Base de Datos Actualizada
**Nuevas Tablas:**
- `Admin` - Administradores del sistema
- `ActivityLog` - Registro de actividades

**Campos Adicionales:**
- Member: phone, status, updatedAt
- Attendance: emailSentAt, status, regeneratedCount, updatedAt
- Candidate: photoUrl, status, updatedAt
- Config: description, category, updatedBy

## 📊 Módulos del Panel

### 🏠 Dashboard (/)
Vista general con estadísticas y accesos rápidos

### 👥 Miembros (/admin/members) - PRÓXIMAMENTE
- Lista completa de miembros
- Búsqueda y filtros
- Crear nuevo miembro
- Editar información
- Cambiar estado (activo/inactivo/suspendido)
- Eliminar miembro
- Exportar lista a CSV/Excel
- Importar miembros desde CSV

### ✅ Asistencia (/admin/attendance) - PRÓXIMAMENTE
- Lista de asistentes confirmados
- Ver códigos de votación
- Regenerar código individual
- Cambiar estado de asistencia
- Reenviar código por email
- Cancelar asistencia
- Exportar códigos

### 🗳️ Candidatos (/admin/candidates) - PRÓXIMAMENTE
- Lista de candidatos por consejo
- Agregar nuevo candidato
- Editar información y biografía
- Subir foto del candidato
- Cambiar estado (activo/inactivo)
- Eliminar candidato

### 📊 Votación (/admin/votes) - PRÓXIMAMENTE
- Resultados en tiempo real
- Votos por candidato
- Votos por cargo
- Estadísticas de participación
- Validación de integridad
- Exportar resultados

### ⚙️ Configuración (/admin/config) - PRÓXIMAMENTE
**Variables de Entorno:**
- Configuración de Base de Datos
- Configuración de Email (SMTP)
- Parámetros de la aplicación
- Opciones de votación

**Gestión:**
- Ver todas las configuraciones
- Editar valores
- Probar conexiones
- Resetear a valores por defecto

### 📝 Logs (/admin/logs) - PRÓXIMAMENTE
- Historial de actividades
- Filtrar por acción/usuario/fecha
- Ver detalles de cada acción
- Exportar logs
- Limpiar logs antiguos

## 🔒 Seguridad

### Autenticación
- Contraseñas hasheadas (base64 en demo, bcrypt en producción)
- Sesiones con expiración (8 horas)
- Cookies HTTP-only
- CSRF protection (en producción)

### Autorización
- Middleware de autenticación en todas las rutas admin
- Roles de usuario (admin, superadmin)
- Logs de todas las acciones administrativas

### Auditoría
- Registro automático de todas las acciones
- IP y User-Agent capturados
- Timestamp de cada actividad
- Detalles en formato JSON

## 📁 Estructura de Archivos

```
app/
├── admin/
│   ├── layout.tsx              # Layout del panel con sidebar
│   ├── login/
│   │   └── page.tsx            # Página de login
│   ├── page.tsx                # Dashboard principal
│   ├── members/                # (A crear)
│   ├── attendance/             # (A crear)
│   ├── candidates/             # (A crear)
│   ├── votes/                  # (A crear)
│   ├── config/                 # (A crear)
│   └── logs/                   # (A crear)
├── api/
│   └── admin/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── session/route.ts
│       └── dashboard/
│           └── stats/route.ts
lib/
├── auth.ts                     # Funciones de autenticación
└── admin-middleware.ts         # Middleware de protección

prisma/
└── schema.prisma               # Schema actualizado con Admin y ActivityLog
```

## 🔄 Flujo de Autenticación

```
1. Usuario → /admin/login
2. Ingresa credenciales
3. POST /api/admin/auth/login
4. Validar credenciales
5. Crear sesión (cookie)
6. Registrar login en logs
7. Redirigir a /admin
8. Verificar sesión en cada request
9. Mostrar contenido protegido
```

## 🛠️ Uso del Panel

### Primer Inicio

```bash
# 1. Asegúrate de que la base de datos esté actualizada
npm run db:push

# 2. Ejecuta el seed para crear el administrador
npm run db:seed

# 3. Inicia el servidor
npm run dev

# 4. Accede al panel
http://localhost:3000/admin/login

# 5. Inicia sesión con:
Usuario: admin
Contraseña: admin123
```

### Navegación

1. **Dashboard:** Vista general y estadísticas
2. **Sidebar:** Click en cualquier módulo para navegar
3. **Responsive:** Click en el menú hamburguesa en móvil
4. **Cerrar Sesión:** Botón rojo en la parte inferior del sidebar

### Cambiar Contraseña

(Funcionalidad a implementar en la página de configuración)

## 🔧 Desarrollo Futuro

### Funcionalidades Planeadas

#### Módulo de Miembros
- [ ] Lista paginada de miembros
- [ ] Búsqueda en tiempo real
- [ ] Filtros por estado
- [ ] CRUD completo
- [ ] Importar CSV
- [ ] Exportar Excel

#### Módulo de Asistencia
- [ ] Gestión de códigos
- [ ] Regenerar códigos
- [ ] Reenviar emails
- [ ] Cambiar estado
- [ ] Estadísticas detalladas

#### Módulo de Configuración
- [ ] Editor de variables de entorno
- [ ] Test de conexión a BD
- [ ] Test de envío de email
- [ ] Backup de configuración
- [ ] Restore de configuración

#### Mejoras de Seguridad
- [ ] Implementar bcrypt real
- [ ] Two-Factor Authentication (2FA)
- [ ] Recuperación de contraseña
- [ ] Política de contraseñas
- [ ] Bloqueo por intentos fallidos
- [ ] Sesiones múltiples

#### Funcionalidades Adicionales
- [ ] Dashboard personalizable
- [ ] Notificaciones en tiempo real
- [ ] Modo oscuro
- [ ] Exportar reportes
- [ ] Gráficos interactivos
- [ ] Scheduled backups

## 📊 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Iniciar sesión |
| POST | `/api/admin/auth/logout` | Cerrar sesión |
| GET | `/api/admin/auth/session` | Verificar sesión |

### Dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/dashboard/stats` | Estadísticas generales |

### Próximos Endpoints

```
GET    /api/admin/members          # Lista de miembros
POST   /api/admin/members          # Crear miembro
GET    /api/admin/members/:id      # Obtener miembro
PUT    /api/admin/members/:id      # Actualizar miembro
DELETE /api/admin/members/:id      # Eliminar miembro

GET    /api/admin/attendance       # Lista de asistencias
PUT    /api/admin/attendance/:id   # Actualizar asistencia
POST   /api/admin/attendance/:id/regenerate  # Regenerar código
POST   /api/admin/attendance/:id/resend      # Reenviar email

GET    /api/admin/candidates       # Lista de candidatos
POST   /api/admin/candidates       # Crear candidato
PUT    /api/admin/candidates/:id   # Actualizar candidato
DELETE /api/admin/candidates/:id   # Eliminar candidato

GET    /api/admin/config           # Lista de configuraciones
PUT    /api/admin/config/:key      # Actualizar configuración

GET    /api/admin/logs             # Lista de logs
GET    /api/admin/logs/:id         # Detalles de log
```

## 🐛 Solución de Problemas

### No puedo iniciar sesión
- Verifica que ejecutaste `npm run db:seed`
- Verifica que la base de datos existe
- Usa las credenciales correctas: admin/admin123
- Revisa la consola del navegador para errores

### Error "Not authenticated"
- La sesión expiró (8 horas)
- Cierra sesión y vuelve a iniciar
- Limpia las cookies del navegador

### El dashboard no muestra datos
- Verifica que la base de datos tenga datos
- Ejecuta `npm run db:seed`
- Revisa la consola del servidor para errores

### Los cambios no se guardan
- Verifica la conexión a la base de datos
- Revisa los logs en la consola
- Verifica que no haya errores de validación

## 📝 Notas de Desarrollo

### Consideraciones de Seguridad en Producción

1. **Cambiar Sistema de Hash:**
   ```typescript
   // En lib/auth.ts, cambiar:
   import bcrypt from 'bcrypt'

   export async function hashPassword(password: string): Promise<string> {
     return bcrypt.hash(password, 10)
   }

   export async function verifyPassword(password: string, hash: string): Promise<boolean> {
     return bcrypt.compare(password, hash)
   }
   ```

2. **Variables de Entorno:**
   ```env
   # .env.production
   SESSION_SECRET="tu-secret-key-super-seguro"
   ADMIN_DEFAULT_PASSWORD="contraseña-fuerte"
   ```

3. **HTTPS Obligatorio:**
   - Usar solo en conexiones HTTPS
   - Configurar `secure: true` en cookies

4. **Rate Limiting:**
   - Implementar límite de intentos de login
   - Bloqueo temporal por intentos fallidos

## 🎯 Roadmap

### Fase 1: Base (Completada ✅)
- [x] Sistema de autenticación
- [x] Dashboard con estadísticas
- [x] Layout y navegación
- [x] Base de datos actualizada

### Fase 2: Gestión (En Progreso)
- [ ] CRUD de miembros
- [ ] Gestión de asistencia y códigos
- [ ] CRUD de candidatos
- [ ] Configuración del sistema

### Fase 3: Avanzado (Planeado)
- [ ] Logs de actividad
- [ ] Reportes y gráficos
- [ ] Notificaciones
- [ ] Backups automáticos

### Fase 4: Optimización (Futuro)
- [ ] 2FA
- [ ] Modo oscuro
- [ ] PWA
- [ ] API REST completa

## 👥 Roles y Permisos

### Admin
- Ver dashboard
- Gestionar miembros
- Ver asistencia
- Ver candidatos
- Ver resultados

### SuperAdmin
- Todo lo de Admin +
- Configurar sistema
- Ver logs
- Gestionar administradores
- Acceso completo

## 📞 Soporte

Para preguntas o problemas:
1. Revisa esta documentación
2. Consulta los logs en `/admin/logs`
3. Revisa la consola del navegador
4. Revisa la consola del servidor

---

**Sistema de Votación COOPINTEC 2025**
Panel de Administración v1.0
