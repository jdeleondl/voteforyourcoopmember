import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function generateTestCodes() {
  try {
    console.log('🔄 Generando códigos de votación para todos los miembros...')
    console.log('')

    // Obtener todos los miembros
    const members = await prisma.member.findMany()

    if (members.length === 0) {
      console.log('❌ No hay miembros en la base de datos.')
      console.log('Ejecuta: npm run db:seed')
      return
    }

    console.log(`📋 Encontrados ${members.length} miembros`)
    console.log('')

    // Generar códigos para cada miembro que no tenga uno
    let created = 0
    let skipped = 0

    for (const member of members) {
      // Verificar si ya tiene código
      const existing = await prisma.attendance.findUnique({
        where: { memberId: member.id },
      })

      if (existing) {
        console.log(`⏭️  ${member.name} - Ya tiene código: ${existing.code}`)
        skipped++
      } else {
        // Generar código único
        const code = nanoid(8).toUpperCase()

        await prisma.attendance.create({
          data: {
            memberId: member.id,
            code: code,
            emailSent: false,
          },
        })

        console.log(`✅ ${member.name} - Código generado: ${code}`)
        created++
      }
    }

    console.log('')
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`✅ Proceso completado`)
    console.log(`   Códigos generados: ${created}`)
    console.log(`   Ya existían: ${skipped}`)
    console.log(`   Total: ${members.length}`)
    console.log('═══════════════════════════════════════════════════════════════')
    console.log('')
    console.log('Para ver todos los códigos ejecuta:')
    console.log('  npm run ver-codigos')
    console.log('')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateTestCodes()
