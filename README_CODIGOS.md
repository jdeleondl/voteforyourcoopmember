# 🔐 Guía de Códigos de Votación

## ¿Cómo se generan los códigos?

Los códigos de votación **NO están pre-generados**. Se crean automáticamente cuando cada miembro confirma su asistencia a través de la página web.

## 📋 Opciones para Obtener Códigos

### Opción 1: Generar Códigos Automáticamente (Recomendado para Pruebas)

Si quieres generar códigos para todos los miembros sin tener que confirmar uno por uno manualmente:

```bash
# 1. Asegúrate de tener la base de datos creada
npm run db:push

# 2. Carga los datos de ejemplo
npm run db:seed

# 3. Genera códigos para todos los miembros automáticamente
npm run generar-codigos
```

**Resultado:**
```
✅ Juan Pérez - Código generado: ABC12345
✅ María González - Código generado: DEF67890
✅ Pedro Rodríguez - Código generado: GHI23456
...
```

### Opción 2: Generar Códigos Manualmente (Proceso Real)

Para simular el proceso real de confirmación de asistencia:

```bash
# 1. Inicia el servidor
npm run dev

# 2. Abre el navegador en http://localhost:3000

# 3. Ve a "Confirmar Asistencia"

# 4. Busca cada miembro y confirma su asistencia

# 5. Cada miembro recibirá un código único
```

## 📊 Ver Todos los Códigos Generados

Para ver una lista de todos los códigos de votación generados:

```bash
npm run ver-codigos
```

**Salida esperada:**
```
═══════════════════════════════════════════════════════════════
         CÓDIGOS DE VOTACIÓN - COOPINTEC 2025
═══════════════════════════════════════════════════════════════

Total de asistentes confirmados: 8

1. Juan Pérez
   Cédula: 001-1234567-8
   Email: juan.perez@example.com
   Código: ABC12345
   Confirmado: 19/11/2025, 5:30:00 p. m.
   Email enviado: No
───────────────────────────────────────────────────────────────
2. María González
   Cédula: 001-2345678-9
   Email: maria.gonzalez@example.com
   Código: DEF67890
   Confirmado: 19/11/2025, 5:31:15 p. m.
   Email enviado: No
───────────────────────────────────────────────────────────────
...
```

## 🗄️ Ver Códigos en Prisma Studio

También puedes ver los códigos visualmente en Prisma Studio:

```bash
npm run db:studio
```

Luego:
1. Abre http://localhost:5555
2. Click en la tabla "Attendance"
3. Verás todos los códigos generados con sus miembros asociados

## 🔄 Flujo Completo de Votación

### 1. Confirmación de Asistencia
```bash
# Miembro busca su nombre
# Sistema genera código único (ej: ABC12345)
# Código se muestra en pantalla y se envía por email
```

### 2. Votación
```bash
# Miembro ingresa su código en /votacion
# Sistema valida el código
# Miembro puede seleccionar candidatos
# Voto se registra en la base de datos
```

### 3. Resultados
```bash
# Acceder a /resultados
# Ver votos por candidato
# Validar que votos = asistentes
```

## 📝 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run db:seed` | Crear 8 miembros de ejemplo |
| `npm run generar-codigos` | Generar códigos para todos los miembros |
| `npm run ver-codigos` | Ver todos los códigos generados |
| `npm run db:studio` | Abrir interfaz visual de la base de datos |
| `npm run dev` | Iniciar servidor de desarrollo |

## 🎯 Ejemplo Práctico

### Escenario: Quiero códigos para probar el sistema

```bash
# Paso 1: Crear base de datos con miembros
npm run db:push
npm run db:seed

# Paso 2: Generar códigos automáticamente
npm run generar-codigos

# Paso 3: Ver los códigos
npm run ver-codigos

# Paso 4: Copiar un código y probarlo
npm run dev
# Ir a http://localhost:3000/votacion
# Pegar el código copiado
```

## 🔐 Características de Seguridad

- ✅ Códigos únicos de 8 caracteres alfanuméricos
- ✅ Generados aleatoriamente con nanoid
- ✅ Un código por miembro (no se puede duplicar)
- ✅ Validación en el servidor antes de permitir votación
- ✅ No se puede votar dos veces con el mismo código

## ❓ Preguntas Frecuentes

### ¿Los códigos están en el seed inicial?
**No.** El seed crea los miembros, pero los códigos se generan cuando:
- Confirman asistencia en la web, O
- Ejecutas `npm run generar-codigos`

### ¿Cómo resetear los códigos?
```bash
# Eliminar base de datos
rm -f prisma/dev.db

# Recrear todo desde cero
npm run db:push
npm run db:seed
npm run generar-codigos
```

### ¿Puedo cambiar el formato del código?
Sí, edita `/lib/email.ts` o `/app/api/attendance/confirm/route.ts`:
```typescript
// Cambiar de 8 a 6 caracteres
const code = nanoid(6).toUpperCase()

// Cambiar a solo números
const code = Math.random().toString().slice(2, 10)
```

### ¿Cómo exportar códigos a CSV?
Los códigos están incluidos en la exportación del dashboard:
1. Ve a http://localhost:3000/dashboard
2. Click en "Descargar CSV" o "Descargar Excel"
3. El archivo incluirá la columna "Código"

## 📧 Envío de Códigos por Email

Los códigos se envían automáticamente por email si configuras:

```env
# .env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-app-password"
EMAIL_FROM="COOPINTEC 2025 <tu-email@gmail.com>"
```

Si no configuras email, el código solo se muestra en pantalla.

---

**¿Necesitas ayuda?** Revisa [INSTALACION.md](INSTALACION.md) o [README.md](README.md)
