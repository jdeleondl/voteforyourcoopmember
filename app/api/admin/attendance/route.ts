import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const attendances = await prisma.attendance.findMany({
        include: {
          member: true,
        },
        orderBy: {
          confirmedAt: 'desc',
        },
      })

      const attendancesData = attendances.map(att => ({
        id: att.id,
        code: att.code,
        confirmedAt: att.confirmedAt.toISOString(),
        emailSent: att.emailSent,
        emailSentAt: att.emailSentAt?.toISOString(),
        status: att.status,
        regeneratedCount: att.regeneratedCount,
        member: {
          id: att.member.id,
          name: att.member.name,
          email: att.member.email,
          cedula: att.member.cedula,
          phone: att.member.phone,
        },
      }))

      return NextResponse.json({ attendances: attendancesData })
    } catch (error) {
      console.error('Error fetching attendances:', error)
      return NextResponse.json(
        { error: 'Error al obtener asistencias' },
        { status: 500 }
      )
    }
  })
}
