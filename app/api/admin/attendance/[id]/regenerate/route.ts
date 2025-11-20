import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'
import { nanoid } from 'nanoid'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const { id } = params

      // Get current attendance
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

      // Generate new code
      const newCode = nanoid(8).toUpperCase()

      // Update attendance
      const updated = await prisma.attendance.update({
        where: { id },
        data: {
          code: newCode,
          status: 'regenerated',
          regeneratedCount: attendance.regeneratedCount + 1,
        },
      })

      await logActivity(
        session.id,
        'regenerate_code',
        'attendance',
        id,
        {
          memberName: attendance.member.name,
          oldCode: attendance.code,
          newCode,
        },
        request
      )

      return NextResponse.json({
        success: true,
        newCode,
      })
    } catch (error) {
      console.error('Error regenerating code:', error)
      return NextResponse.json(
        { error: 'Error al regenerar código' },
        { status: 500 }
      )
    }
  })
}
