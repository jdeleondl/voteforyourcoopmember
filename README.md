# Sistema de Votación COOPINTEC 2025

Sistema completo de confirmación de asistencia y votación electrónica para la Asamblea General de COOPINTEC 2025.

## 🌟 Características

### Módulo de Confirmación de Asistencia
- ✅ Búsqueda de miembros por nombre o cédula
- ✅ Generación de códigos únicos de votación
- ✅ Envío automático de códigos por correo electrónico
- ✅ Dashboard en tiempo real con estadísticas de asistencia
- ✅ Exportación de lista de asistentes en CSV y Excel
- ✅ Contador de asistentes y porcentaje de participación

### Módulo de Votación
- ✅ Acceso seguro mediante código único
- ✅ Interfaz intuitiva para selección de candidatos
- ✅ Votación para múltiples cargos:
  - **Consejo de Administración**: Presidente, Vicepresidente, Tesorero, Secretario, Vocal, Suplente 1, Suplente 2
  - **Consejo de Vigilancia**: Presidente, Secretario, Vocal 1, Vocal 2, Suplente 1
  - **Comité de Crédito**: Presidente, Secretario, Vocal, Suplente 1
- ✅ Validación de voto único por miembro
- ✅ Confirmación visual del voto registrado

### Módulo de Resultados
- ✅ Visualización en tiempo real de resultados
- ✅ Gráficos de votación por candidato
- ✅ Validación automática (votos = asistentes)
- ✅ Identificación de ganadores por cargo
- ✅ Estadísticas detalladas de participación

## 🚀 Tecnologías Utilizadas

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: SQLite (vía Prisma ORM)
- **Email**: Nodemailer
- **Exportación**: SheetJS (xlsx)
- **Generación de Códigos**: nanoid

## 📋 Requisitos Previos

- Node.js 18.x o superior
- npm o yarn

## 🔧 Instalación

> **⚠️ ¿Tienes el error "Error al buscar miembros"?**
> Lee la [**Guía de Instalación Completa (INSTALACION.md)**](INSTALACION.md) con soluciones paso a paso.

### Instalación Rápida

1. **Clonar el repositorio** (o ya estás en él)

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:

   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

   Edita `.env` y configura las variables (opcional para desarrollo):
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # Email (opcional - para enviar códigos por correo)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="tu-email@gmail.com"
   EMAIL_PASSWORD="tu-password-de-aplicacion"
   EMAIL_FROM="COOPINTEC 2025 <tu-email@gmail.com>"

   # App
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Configurar la base de datos**:
   ```bash
   npm run db:push
   ```

5. **Poblar la base de datos con datos de ejemplo**:
   ```bash
   npm run db:seed
   ```

## 🎯 Uso

### Desarrollo

Iniciar el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Producción

1. Compilar la aplicación:
   ```bash
   npm run build
   ```

2. Iniciar el servidor de producción:
   ```bash
   npm start
   ```

## 📱 Flujo de Uso

### Para los Miembros

1. **Confirmar Asistencia**:
   - Acceder a la página de asistencia
   - Buscar su nombre o cédula
   - Presionar "Confirmar Presente"
   - Recibir y guardar el código de votación (también enviado por email)

2. **Votar**:
   - Acceder a la página de votación
   - Ingresar el código recibido
   - Seleccionar un candidato para cada cargo disponible
   - Confirmar la votación
   - Recibir confirmación visual del voto registrado

### Para los Administradores

1. **Monitorear Asistencia**:
   - Acceder al Dashboard
   - Ver estadísticas en tiempo real
   - Exportar lista de asistentes en CSV o Excel

2. **Ver Resultados**:
   - Acceder a la página de resultados
   - Ver votación por cargo
   - Verificar validación (votos = asistentes)
   - Identificar ganadores

## 🗂️ Estructura del Proyecto

```
voteforyourcoopmember/
├── app/
│   ├── api/                    # API Routes
│   │   ├── attendance/         # Confirmación de asistencia
│   │   ├── candidates/         # Candidatos
│   │   ├── members/            # Miembros
│   │   └── voting/             # Votación
│   ├── asistencia/             # Página de confirmación
│   ├── dashboard/              # Dashboard de asistencia
│   ├── resultados/             # Resultados de votación
│   ├── votacion/               # Páginas de votación
│   │   ├── seleccionar/        # Selección de candidatos
│   │   └── confirmacion/       # Confirmación de voto
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Página principal
├── lib/
│   ├── email.ts                # Servicio de email
│   └── prisma.ts               # Cliente de Prisma
├── prisma/
│   ├── schema.prisma           # Esquema de base de datos
│   └── seed.ts                 # Datos de ejemplo
└── README.md
```

## 🗄️ Modelo de Datos

### Member (Miembro)
- `id`: ID único
- `name`: Nombre completo
- `email`: Correo electrónico
- `cedula`: Número de cédula

### Attendance (Asistencia)
- `id`: ID único
- `memberId`: Referencia al miembro
- `code`: Código único de votación
- `confirmedAt`: Fecha de confirmación
- `emailSent`: Estado de envío de email

### Candidate (Candidato)
- `id`: ID único
- `name`: Nombre del candidato
- `position`: Cargo (presidente, secretario, etc.)
- `council`: Consejo (administracion, vigilancia, credito)

### Vote (Voto)
- `id`: ID único
- `memberId`: Referencia al miembro que votó
- `candidateId`: Referencia al candidato seleccionado
- `position`: Cargo para el que votó
- `votedAt`: Fecha del voto

## 🔐 Seguridad

- ✅ Códigos únicos de 8 caracteres generados aleatoriamente
- ✅ Validación de código antes de permitir votación
- ✅ Un voto por miembro (validación en base de datos)
- ✅ No se permite modificar voto una vez confirmado
- ✅ Validación de integridad (total votos = total asistentes)

## 📊 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run db:push` - Sincroniza el esquema de Prisma con la base de datos
- `npm run db:seed` - Puebla la base de datos con datos de ejemplo
- `npm run db:studio` - Abre Prisma Studio para gestionar la base de datos

## 🎨 Personalización

### Agregar Miembros

Edita `prisma/seed.ts` para agregar más miembros o usa Prisma Studio:

```bash
npm run db:studio
```

### Agregar Candidatos

Similar a los miembros, edita `prisma/seed.ts` o usa Prisma Studio.

### Cambiar Estilos

Los estilos están en:
- `app/globals.css` - Estilos globales
- `tailwind.config.ts` - Configuración de Tailwind
- Componentes individuales usan Tailwind CSS inline

## 🐛 Solución de Problemas

### La base de datos no se crea
```bash
rm -rf prisma/dev.db
npm run db:push
npm run db:seed
```

### Error al enviar emails
El envío de emails es opcional. Si no configuras las variables de entorno de email, el código se mostrará solo en pantalla y en consola.

### Error al exportar Excel/CSV
Verifica que el paquete `xlsx` esté instalado:
```bash
npm install xlsx
```

## 📝 Datos de Ejemplo

El sistema incluye datos de ejemplo:
- 8 miembros de prueba
- 16 candidatos distribuidos en los 3 consejos
- Nombres y cédulas ficticias

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Para base de datos en producción, considera usar PostgreSQL o MySQL en lugar de SQLite

### Otros Proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js 14+.

## 📄 Licencia

CC0 1.0 Universal (Public Domain)

## 👥 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo de COOPINTEC.

---

**COOPINTEC 2025** - Sistema de Votación Electrónica
