import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener total de miembros
    const totalMembers = await prisma.member.count()

    // Obtener asistencias confirmadas
    const attendances = await prisma.attendance.findMany({
      include: {
        member: true,
      },
      orderBy: {
        confirmedAt: 'desc',
      },
    })

    const attendanceCount = attendances.length
    const attendancePercentage = totalMembers > 0 ? (attendanceCount / totalMembers) * 100 : 0

    // Mapear asistentes
    const attendees = attendances.map((attendance) => ({
      name: attendance.member.name,
      email: attendance.member.email,
      employeeId: attendance.member.employeeId,
      confirmedAt: attendance.confirmedAt.toISOString(),
    }))

    return NextResponse.json({
      totalMembers,
      attendanceCount,
      attendancePercentage,
      attendees,
    })
  } catch (error) {
    console.error('Error fetching attendance stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
