#!/bin/bash

echo "🚀 Configurando Sistema de Votación COOPINTEC 2025..."
echo ""

echo "📦 Paso 1: Instalando dependencias..."
npm install

echo ""
echo "🗄️  Paso 2: Creando base de datos..."
npx prisma db push

echo ""
echo "🌱 Paso 3: Cargando datos de ejemplo..."
npx tsx prisma/seed.ts

echo ""
echo "✅ ¡Sistema configurado exitosamente!"
echo ""
echo "Para iniciar el servidor de desarrollo ejecuta:"
echo "  npm run dev"
echo ""
echo "Luego abre http://localhost:3000 en tu navegador"
