# 🚀 Guía de Instalación - Sistema de Votación COOPINTEC 2025

## ⚠️ IMPORTANTE: Sigue estos pasos en orden

El error "Error al buscar miembros" significa que la base de datos no ha sido creada. Aquí están las instrucciones para solucionarlo:

---

## 📋 Método 1: Instalación Automática (Recomendado)

### Paso 1: Instalar Dependencias
```bash
npm install
```

**Nota**: Este paso puede tomar varios minutos. Si ves errores de npm, intenta con:
```bash
npm install --legacy-peer-deps
```

### Paso 2: Crear la Base de Datos
```bash
npx prisma db push
```

Deberías ver un mensaje como:
```
✔ Generated Prisma Client
Your database is now in sync with your Prisma schema.
```

### Paso 3: Cargar Datos de Ejemplo
```bash
npx tsx prisma/seed.ts
```

O si prefieres usar el script de npm:
```bash
npm run db:seed
```

Deberías ver:
```
✅ Creados 8 miembros
✅ Creados 16 candidatos
✅ Base de datos inicializada correctamente
```

### Paso 4: Iniciar el Servidor
```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

## 📋 Método 2: Instalación Manual (Si el Método 1 falla)

Si tienes problemas con npm o prisma, puedes crear la base de datos manualmente:

### Opción A: Usando Prisma Studio

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Generar Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Crear base de datos**:
   ```bash
   npx prisma db push
   ```

4. **Abrir Prisma Studio**:
   ```bash
   npx prisma studio
   ```

5. **Agregar datos manualmente** usando la interfaz web de Prisma Studio en http://localhost:5555

### Opción B: Usando SQLite directamente

Si tienes SQLite instalado en tu sistema:

1. **Crear la base de datos**:
   ```bash
   sqlite3 prisma/dev.db < prisma/init.sql
   ```

2. **Verificar que se creó**:
   ```bash
   sqlite3 prisma/dev.db "SELECT COUNT(*) FROM Member;"
   ```

   Deberías ver: `8`

3. **Generar Prisma Client**:
   ```bash
   npx prisma generate
   ```

4. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

---

## 🔍 Verificar que Todo Funciona

1. **Verificar que la base de datos existe**:
   ```bash
   ls -la prisma/dev.db
   ```

   Deberías ver el archivo `dev.db`

2. **Verificar datos en la base de datos**:
   ```bash
   npx prisma studio
   ```

   Abre http://localhost:5555 y verifica que hay 8 miembros y 16 candidatos

3. **Probar la aplicación**:
   - Abre http://localhost:3000
   - Ve a "Confirmar Asistencia"
   - Busca "Juan Pérez" o "001-1234567-8"
   - Deberías ver resultados

---

## 🐛 Solución de Problemas Comunes

### Error: "Error al buscar miembros"

**Causa**: La base de datos no existe o no tiene datos.

**Solución**:
```bash
# Eliminar base de datos existente
rm -f prisma/dev.db

# Recrear
npx prisma db push

# Cargar datos
npx tsx prisma/seed.ts
```

### Error: "PrismaClientInitializationError"

**Causa**: Prisma Client no está generado.

**Solución**:
```bash
npx prisma generate
```

### Error: "Cannot find module '@prisma/client'"

**Causa**: Las dependencias no están instaladas.

**Solución**:
```bash
npm install
npx prisma generate
```

### Error: "ENOENT: no such file or directory"

**Causa**: El directorio prisma o el archivo dev.db no existe.

**Solución**:
```bash
# Asegúrate de estar en el directorio correcto
pwd

# Debería mostrar algo como: .../voteforyourcoopmember

# Crear la base de datos
npx prisma db push
```

### Error al ejecutar seed: "Cannot find module 'tsx'"

**Solución**:
```bash
npm install -D tsx
npm run db:seed
```

---

## ✅ Lista de Verificación

Marca cada paso cuando lo completes:

- [ ] ✅ npm install ejecutado exitosamente
- [ ] ✅ npx prisma db push ejecutado sin errores
- [ ] ✅ npx tsx prisma/seed.ts ejecutado y mostró 8 miembros y 16 candidatos
- [ ] ✅ npm run dev inició el servidor en http://localhost:3000
- [ ] ✅ Puedes buscar "Juan Pérez" en /asistencia
- [ ] ✅ La búsqueda muestra resultados sin errores

---

## 📞 ¿Aún tienes problemas?

Si después de seguir estos pasos aún tienes errores, comparte:

1. El mensaje de error completo
2. El sistema operativo que usas (Windows, Mac, Linux)
3. La versión de Node.js (`node --version`)
4. El resultado de `ls -la prisma/`

---

## 🎯 Datos de Ejemplo para Probar

Una vez configurado, puedes buscar estos miembros:

**Por nombre**:
- Juan Pérez
- María González
- Pedro Rodríguez
- Ana Martínez
- Carlos Sánchez
- Laura Fernández
- Roberto López
- Carmen Díaz

**Por cédula**:
- 001-1234567-8
- 001-2345678-9
- 001-3456789-0
- 001-4567890-1
- 001-5678901-2
- 001-6789012-3
- 001-7890123-4
- 001-8901234-5

¡Buena suerte! 🚀
