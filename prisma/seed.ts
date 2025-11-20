import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar la base de datos
  await prisma.vote.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.positionAssignment.deleteMany()
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

  // Crear miembros de ejemplo (algunos tendrán cargos asignados, otros serán candidatos)
  const members = await Promise.all([
    // Miembros con cargos activos (NO serán candidatos)
    prisma.member.create({
      data: {
        name: 'José Manuel Pérez',
        email: 'jose.perez@example.com',
        cedula: '001-0000001-0',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Ricardo Gómez',
        email: 'ricardo.gomez@example.com',
        cedula: '001-0000002-1',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Manuel Sánchez',
        email: 'manuel.sanchez@example.com',
        cedula: '001-0000003-2',
      },
    }),
    // Miembros candidatos para votación
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
    prisma.member.create({
      data: {
        name: 'Sandra Cruz',
        email: 'sandra.cruz@example.com',
        cedula: '001-9012345-6',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Alberto Gutiérrez',
        email: 'alberto.gutierrez@example.com',
        cedula: '001-0123456-7',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Patricia Ramírez',
        email: 'patricia.ramirez@example.com',
        cedula: '001-1111111-1',
      },
    }),
    prisma.member.create({
      data: {
        name: 'Jorge Morales',
        email: 'jorge.morales@example.com',
        cedula: '001-2222222-2',
      },
    }),
  ])

  console.log(`✅ Creados ${members.length} miembros`)

  // Crear posiciones para Consejo de Administración
  const positionsAdmin = [
    { name: 'Presidente', council: 'administracion', order: 1 },
    { name: 'Vicepresidente', council: 'administracion', order: 2 },
    { name: 'Tesorero', council: 'administracion', order: 3 },
    { name: 'Secretario', council: 'administracion', order: 4 },
    { name: 'Vocal 1', council: 'administracion', order: 5 },
    { name: 'Vocal 2', council: 'administracion', order: 6 },
    { name: 'Suplente 1', council: 'administracion', order: 7 },
  ]

  // Crear posiciones para Consejo de Vigilancia
  const positionsVigilancia = [
    { name: 'Presidente', council: 'vigilancia', order: 1 },
    { name: 'Secretario', council: 'vigilancia', order: 2 },
    { name: 'Vocal 1', council: 'vigilancia', order: 3 },
    { name: 'Vocal 2', council: 'vigilancia', order: 4 },
    { name: 'Suplente 1', council: 'vigilancia', order: 5 },
  ]

  // Crear posiciones para Comité de Crédito
  const positionsCredito = [
    { name: 'Presidente', council: 'credito', order: 1 },
    { name: 'Secretario', council: 'credito', order: 2 },
    { name: 'Vocal', council: 'credito', order: 3 },
    { name: 'Suplente 1', council: 'credito', order: 4 },
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

  // Crear asignaciones de cargos actuales (miembros que ocupan cargos y NO serán candidatos)
  const assignments = [
    {
      positionId: createdPositions['administracion-Presidente'].id,
      memberId: members[0].id, // José Manuel Pérez
      termStartDate: new Date('2024-03-15'),
      termEndDate: new Date('2026-03-15'), // Período activo hasta 2026
    },
    {
      positionId: createdPositions['vigilancia-Secretario'].id,
      memberId: members[1].id, // Ricardo Gómez
      termStartDate: new Date('2024-01-20'),
      termEndDate: new Date('2026-01-20'), // Período activo hasta 2026
    },
    {
      positionId: createdPositions['credito-Vocal'].id,
      memberId: members[2].id, // Manuel Sánchez
      termStartDate: new Date('2024-01-01'),
      termEndDate: new Date('2025-12-31'), // Período finaliza este año
    },
  ]

  for (const assignment of assignments) {
    await prisma.positionAssignment.create({
      data: assignment,
    })
  }

  console.log(`✅ Creadas ${assignments.length} asignaciones de cargos`)

  // Crear candidatos de miembros SIN cargos activos (índices 3 en adelante)
  const candidates = [
    // Consejo de Administración
    {
      memberId: members[3].id, // Juan Pérez
      council: 'administracion',
      bio: 'Licenciado en Administración con 10 años de experiencia en cooperativas',
    },
    {
      memberId: members[4].id, // María González
      council: 'administracion',
      bio: 'MBA, especialista en gestión cooperativa',
    },
    {
      memberId: members[5].id, // Pedro Rodríguez
      council: 'administracion',
      bio: 'Contador público certificado',
    },
    {
      memberId: members[6].id, // Ana Martínez
      council: 'administracion',
      bio: 'Experta en documentación y actas institucionales',
    },
    {
      memberId: members[13].id, // Patricia Ramírez
      council: 'administracion',
    },
    // Consejo de Vigilancia
    {
      memberId: members[7].id, // Carlos Sánchez
      council: 'vigilancia',
      bio: 'Auditor certificado con 15 años de experiencia',
    },
    {
      memberId: members[8].id, // Laura Fernández
      council: 'vigilancia',
      bio: 'Contadora pública, especialista en auditoría',
    },
    {
      memberId: members[9].id, // Roberto López
      council: 'vigilancia',
    },
    {
      memberId: members[14].id, // Jorge Morales
      council: 'vigilancia',
    },
    // Comité de Crédito
    {
      memberId: members[10].id, // Carmen Díaz
      council: 'credito',
      bio: 'Economista con experiencia en análisis crediticio',
    },
    {
      memberId: members[11].id, // Sandra Cruz
      council: 'credito',
      bio: 'Especialista en gestión de riesgos financieros',
    },
    {
      memberId: members[12].id, // Alberto Gutiérrez
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
  console.log(`   - Cargos asignados (ocupados): ${assignments.length}`)
  console.log(`   - Candidatos para votación: ${candidates.length}`)
  console.log('\n👥 MIEMBROS CON CARGOS ACTIVOS (NO son candidatos):')
  console.log(`   - ${members[0].name} - Presidente Administración (hasta 2026)`)
  console.log(`   - ${members[1].name} - Secretario Vigilancia (hasta 2026)`)
  console.log(`   - ${members[2].name} - Vocal Crédito (hasta fin 2025)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
