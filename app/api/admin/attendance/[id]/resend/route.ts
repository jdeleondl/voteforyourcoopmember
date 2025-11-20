import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import { logActivity } from '@/lib/auth'
import { sendConfirmationEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (session) => {
    try {
      const { id } = params

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

      // Send email
      const emailResult = await sendConfirmationEmail({
        to: attendance.member.email,
        name: attendance.member.name,
        code: attendance.code,
      })

      // Update attendance
      if (emailResult.success) {
        await prisma.attendance.update({
          where: { id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
          },
        })
      }

      await logActivity(
        session.id,
        'resend_email',
        'attendance',
        id,
        {
          memberName: attendance.member.name,
          email: attendance.member.email,
          success: emailResult.success,
        },
        request
      )

      return NextResponse.json({
        success: true,
        emailSent: emailResult.success,
      })
    } catch (error) {
      console.error('Error resending email:', error)
      return NextResponse.json(
        { error: 'Error al reenviar email' },
        { status: 500 }
      )
    }
  })
}
