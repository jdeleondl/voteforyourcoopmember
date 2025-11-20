import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const { id } = params
      const body = await request.json()
      const { status } = body

      if (!['active', 'cancelled', 'regenerated'].includes(status)) {
        return NextResponse.json(
          { error: 'Estado inválido' },
          { status: 400 }
        )
      }

      // Get attendance
      const attendance = await prisma.attendance.findUnique({
        where: { id },
        include: { member: true },
      })

      if (!attendance) {
        return NextResponse.json(
          { error: 'Asistencia no encontrada' },
          { status: 404 }
        )
      }

      // Update status
      const updated = await prisma.attendance.update({
        where: { id },
        data: { status },
      })

      await logActivity(
        session.id,
        'change_attendance_status',
        'attendance',
        id,
        {
          memberName: attendance.member.name,
          oldStatus: attendance.status,
          newStatus: status,
        },
        request
      )

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error changing status:', error)
      return NextResponse.json(
        { error: 'Error al cambiar estado' },
        { status: 500 }
      )
    }
  })
}
