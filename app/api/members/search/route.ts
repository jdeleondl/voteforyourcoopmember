import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Se requiere un término de búsqueda' },
        { status: 400 }
      )
    }

    // Buscar por nombre o cédula
    // SQLite no soporta mode: 'insensitive', así que buscamos con contains directamente
    const members = await prisma.member.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            cedula: {
              contains: query,
            },
          },
        ],
      },
      include: {
        attendance: true,
      },
    })

    // Filtro manual case-insensitive para compensar limitación de SQLite
    const filteredMembers = members.filter(member =>
      member.name.toLowerCase().includes(query.toLowerCase()) ||
      member.cedula.includes(query)
    )

    // Mapear resultados con información de confirmación
    const results = filteredMembers.map((member) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      cedula: member.cedula,
      hasConfirmed: !!member.attendance,
    }))

    return NextResponse.json({ members: results })
  } catch (error) {
    console.error('Error searching members:', error)
    return NextResponse.json(
      { error: 'Error al buscar miembros' },
      { status: 500 }
    )
  }
}
