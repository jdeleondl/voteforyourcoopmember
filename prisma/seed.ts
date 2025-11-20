import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar la base de datos
  await prisma.vote.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.position.deleteMany()
  await prisma.member.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.admin.deleteMany()

  // Crear administrador por defecto
  // Password: admin123 (en base64 para demostración)
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      password: Buffer.from('admin123').toString('base64'),
      name: 'Administrador',
      email: 'admin@coopintec.com',
      role: 'superadmin',
    },
  })

  console.log(`✅ Creado administrador: ${admin.username}`)

  // Crear miembros de ejemplo
  const members = await Promise.all([
    prisma.member.create({
      data: {
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        cedula: '001-1234567-8',
      },
    }),
    prisma.member.create({
      data: {
        name: 'María González',
        email: 'maria.gonzalez@example.com',
        cedula: '001-2345678-9',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Pedro Rodríguez',
        email: 'pedro.rodriguez@example.com',
        cedula: '001-3456789-0',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Ana Martínez',
        email: 'ana.martinez@example.com',
        cedula: '001-4567890-1',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Carlos Sánchez',
        email: 'carlos.sanchez@example.com',
        cedula: '001-5678901-2',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Laura Fernández',
        email: 'laura.fernandez@example.com',
        cedula: '001-6789012-3',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Roberto López',
        email: 'roberto.lopez@example.com',
        cedula: '001-7890123-4',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Carmen Díaz',
        email: 'carmen.diaz@example.com',
        cedula: '001-8901234-5',
      },
    }),
  ])

  console.log(`✅ Creados ${members.length} miembros`)

  // Crear posiciones para Consejo de Administración
  const positionsAdmin = [
    {
      name: 'Presidente',
      council: 'administracion',
      order: 1,
      isOccupied: true,
      currentHolder: 'José Manuel Pérez',
      termEndDate: new Date('2026-03-15'), // Período no finalizado
    },
    {
      name: 'Vicepresidente',
      council: 'administracion',
      order: 2,
      isOccupied: false,
    },
    {
      name: 'Tesorero',
      council: 'administracion',
      order: 3,
      isOccupied: true,
      currentHolder: 'Angela María Torres',
      termEndDate: new Date('2025-06-30'), // Período finalizado
    },
    {
      name: 'Secretario',
      council: 'administracion',
      order: 4,
      isOccupied: false,
    },
    {
      name: 'Vocal 1',
      council: 'administracion',
      order: 5,
      isOccupied: false,
    },
    {
      name: 'Vocal 2',
      council: 'administracion',
      order: 6,
      isOccupied: false,
    },
    {
      name: 'Suplente 1',
      council: 'administracion',
      order: 7,
      isOccupied: false,
    },
  ]

  // Crear posiciones para Consejo de Vigilancia
  const positionsVigilancia = [
    {
      name: 'Presidente',
      council: 'vigilancia',
      order: 1,
      isOccupied: false,
    },
    {
      name: 'Secretario',
      council: 'vigilancia',
      order: 2,
      isOccupied: true,
      currentHolder: 'Ricardo Gómez',
      termEndDate: new Date('2026-01-20'),
    },
    {
      name: 'Vocal 1',
      council: 'vigilancia',
      order: 3,
      isOccupied: false,
    },
    {
      name: 'Vocal 2',
      council: 'vigilancia',
      order: 4,
      isOccupied: false,
    },
    {
      name: 'Suplente 1',
      council: 'vigilancia',
      order: 5,
      isOccupied: false,
    },
  ]

  // Crear posiciones para Comité de Crédito
  const positionsCredito = [
    {
      name: 'Presidente',
      council: 'credito',
      order: 1,
      isOccupied: false,
    },
    {
      name: 'Secretario',
      council: 'credito',
      order: 2,
      isOccupied: false,
    },
    {
      name: 'Vocal',
      council: 'credito',
      order: 3,
      isOccupied: true,
      currentHolder: 'Manuel Sánchez',
      termEndDate: new Date('2025-12-31'),
    },
    {
      name: 'Suplente 1',
      council: 'credito',
      order: 4,
      isOccupied: false,
    },
  ]

  const allPositions = [...positionsAdmin, ...positionsVigilancia, ...positionsCredito]

  const createdPositions: Record<string, any> = {}

  for (const position of allPositions) {
    const created = await prisma.position.create({
      data: position,
    })
    createdPositions[`${position.council}-${position.name}`] = created
  }

  console.log(`✅ Creadas ${allPositions.length} posiciones`)

  // Crear candidatos solo para posiciones disponibles
  const candidates = [
    // Administración - Vicepresidente (disponible)
    {
      name: 'Sandra Patricia Cruz',
      positionId: createdPositions['administracion-Vicepresidente'].id,
      council: 'administracion',
      bio: 'Licenciada en Administración con 10 años de experiencia en cooperativas',
    },
    {
      name: 'Carlos Alberto Méndez',
      positionId: createdPositions['administracion-Vicepresidente'].id,
      council: 'administracion',
      bio: 'MBA, especialista en gestión cooperativa',
    },
    // Administración - Secretario (disponible)
    {
      name: 'Patricia Isabel Ramírez',
      positionId: createdPositions['administracion-Secretario'].id,
      council: 'administracion',
      bio: 'Experta en documentación y actas institucionales',
    },
    {
      name: 'Jorge Eduardo Morales',
      positionId: createdPositions['administracion-Secretario'].id,
      council: 'administracion',
    },
    // Administración - Vocal 1
    {
      name: 'Diana Carolina Vega',
      positionId: createdPositions['administracion-Vocal 1'].id,
      council: 'administracion',
    },
    // Vigilancia - Presidente (disponible)
    {
      name: 'Ricardo Antonio Herrera',
      positionId: createdPositions['vigilancia-Presidente'].id,
      council: 'vigilancia',
      bio: 'Auditor certificado con 15 años de experiencia',
    },
    {
      name: 'Gabriela María Ortiz',
      positionId: createdPositions['vigilancia-Presidente'].id,
      council: 'vigilancia',
      bio: 'Contadora pública, especialista en auditoría',
    },
    // Vigilancia - Vocal 1
    {
      name: 'Andrés Felipe Rojas',
      positionId: createdPositions['vigilancia-Vocal 1'].id,
      council: 'vigilancia',
    },
    // Crédito - Presidente (disponible)
    {
      name: 'Alberto José Gutiérrez',
      positionId: createdPositions['credito-Presidente'].id,
      council: 'credito',
      bio: 'Economista con experiencia en análisis crediticio',
    },
    {
      name: 'Verónica Andrea Silva',
      positionId: createdPositions['credito-Presidente'].id,
      council: 'credito',
    },
    // Crédito - Secretario
    {
      name: 'Javier Alejandro Vargas',
      positionId: createdPositions['credito-Secretario'].id,
      council: 'credito',
    },
  ]

  for (const candidate of candidates) {
    await prisma.candidate.create({
      data: candidate,
    })
  }

  console.log(`✅ Creados ${candidates.length} candidatos`)
  console.log('✅ Base de datos inicializada correctamente')
  console.log('\n📋 RESUMEN:')
  console.log(`   - Admin: admin / admin123`)
  console.log(`   - Miembros: ${members.length}`)
  console.log(`   - Posiciones: ${allPositions.length}`)
  console.log(`   - Candidatos: ${candidates.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
