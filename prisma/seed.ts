import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar la base de datos
  await prisma.vote.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.member.deleteMany()

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

  // Crear candidatos para Consejo de Administración
  const consejosAdmin = [
    { name: 'Luis Alberto Gómez', position: 'presidente', council: 'administracion' },
    { name: 'Sandra Patricia Cruz', position: 'vicepresidente', council: 'administracion' },
    { name: 'Miguel Ángel Torres', position: 'tesorero', council: 'administracion' },
    { name: 'Patricia Isabel Ramírez', position: 'secretario', council: 'administracion' },
    { name: 'Jorge Eduardo Morales', position: 'vocal', council: 'administracion' },
    { name: 'Diana Carolina Vega', position: 'suplente1', council: 'administracion' },
    { name: 'Fernando José Castillo', position: 'suplente2', council: 'administracion' },
  ]

  // Crear candidatos para Consejo de Vigilancia
  const consejosVigilancia = [
    { name: 'Ricardo Antonio Herrera', position: 'presidente', council: 'vigilancia' },
    { name: 'Gabriela María Ortiz', position: 'secretario', council: 'vigilancia' },
    { name: 'Andrés Felipe Rojas', position: 'vocal1', council: 'vigilancia' },
    { name: 'Claudia Marcela Jiménez', position: 'vocal2', council: 'vigilancia' },
    { name: 'Oscar David Mendoza', position: 'suplente1', council: 'vigilancia' },
  ]

  // Crear candidatos para Comité de Crédito
  const comiteCredito = [
    { name: 'Alberto José Gutiérrez', position: 'presidente', council: 'credito' },
    { name: 'Verónica Andrea Silva', position: 'secretario', council: 'credito' },
    { name: 'Javier Alejandro Vargas', position: 'vocal', council: 'credito' },
    { name: 'Mónica Beatriz Acosta', position: 'suplente1', council: 'credito' },
  ]

  const allCandidates = [...consejosAdmin, ...consejosVigilancia, ...comiteCredito]

  for (const candidate of allCandidates) {
    await prisma.candidate.create({
      data: candidate,
    })
  }

  console.log(`✅ Creados ${allCandidates.length} candidatos`)
  console.log('✅ Base de datos inicializada correctamente')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
