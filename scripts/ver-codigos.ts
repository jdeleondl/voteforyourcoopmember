import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getCodes() {
  try {
    const attendances = await prisma.attendance.findMany({
      include: {
        member: true,
      },
      orderBy: {
        confirmedAt: 'desc',
      },
    })

    if (attendances.length === 0) {
      console.log('❌ No hay miembros que hayan confirmado asistencia todavía.')
      console.log('')
      console.log('Para generar códigos:')
      console.log('1. Inicia el servidor: npm run dev')
      console.log('2. Ve a http://localhost:3000/asistencia')
      console.log('3. Busca y confirma la asistencia de los miembros')
      console.log('')
      return
    }

    console.log('═══════════════════════════════════════════════════════════════')
    console.log('         CÓDIGOS DE VOTACIÓN - COOPINTEC 2025')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('')
    console.log(`Total de asistentes confirmados: ${attendances.length}`)
    console.log('')

    attendances.forEach((attendance, index) => {
      console.log(`${index + 1}. ${attendance.member.name}`)
      console.log(`   ID Empleado: ${attendance.member.employeeId}`)
      console.log(`   Email: ${attendance.member.email}`)
      console.log(`   Código: ${attendance.code}`)
      console.log(`   Confirmado: ${new Date(attendance.confirmedAt).toLocaleString('es-DO')}`)
      console.log(`   Email enviado: ${attendance.emailSent ? 'Sí' : 'No'}`)
      console.log('───────────────────────────────────────────────────────────────')
    })

    console.log('')
    console.log('═══════════════════════════════════════════════════════════════')

  } catch (error) {
    console.error('Error al obtener códigos:', error)
    console.log('')
    console.log('¿La base de datos existe?')
    console.log('Ejecuta: npm run db:push')
    console.log('Luego: npm run db:seed')
  } finally {
    await prisma.$disconnect()
  }
}

getCodes()
