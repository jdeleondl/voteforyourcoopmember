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

    // Buscar por nombre o cédula (case insensitive)
    const members = await prisma.member.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
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

    // Mapear resultados con información de confirmación
    const results = members.map((member) => ({
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
