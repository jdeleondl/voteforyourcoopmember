import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const council = searchParams.get('council')

    const where: any = {}

    if (council) {
      where.council = council
    }

    // Get all positions with their current assignments
    const positions = await prisma.position.findMany({
      where,
      include: {
        assignments: {
          where: {
            termEndDate: {
              gte: new Date(), // Only active assignments
            },
          },
          include: {
            member: true,
          },
        },
      },
      orderBy: [
        { council: 'asc' },
        { order: 'asc' },
      ],
    })

    // Determine if each position is occupied (has active assignment)
    const positionsWithStatus = positions.map(position => {
      const activeAssignment = position.assignments.length > 0 ? position.assignments[0] : null

      return {
        id: position.id,
        name: position.name,
        council: position.council,
        order: position.order,
        isOccupied: !!activeAssignment,
        currentHolder: activeAssignment ? activeAssignment.member.name : null,
        termEndDate: activeAssignment ? activeAssignment.termEndDate : null,
      }
    })

    // Group by council
    const councils = {
      administracion: positionsWithStatus.filter(p => p.council === 'administracion'),
      vigilancia: positionsWithStatus.filter(p => p.council === 'vigilancia'),
      credito: positionsWithStatus.filter(p => p.council === 'credito'),
    }

    return NextResponse.json({ positions: positionsWithStatus, councils })
  } catch (error) {
    console.error('Error fetching voting positions:', error)
    return NextResponse.json(
      { error: 'Error al obtener posiciones de votación' },
      { status: 500 }
    )
  }
}
