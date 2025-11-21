import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/admin-middleware'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  return withAuth(request, async (session) => {
    try {
      const attendances = await prisma.attendance.findMany({
        include: {
          member: true,
        },
        orderBy: {
          confirmedAt: 'asc',
        },
      })

      // Prepare data
      const data = attendances.map((att, index) => ({
        '#': index + 1,
        'Nombre': att.member.name,
        'ID Empleado': att.member.employeeId,
        'Email': att.member.email,
        'Teléfono': att.member.phone || 'N/A',
        'Código de Votación': att.code,
        'Fecha de Confirmación': new Date(att.confirmedAt).toLocaleString('es-DO'),
        'Email Enviado': att.emailSent ? 'Sí' : 'No',
        'Estado': att.status === 'active' ? 'Activo' :
                  att.status === 'cancelled' ? 'Cancelado' : 'Regenerado',
        'Veces Regenerado': att.regeneratedCount,
      }))

      // Generate CSV
      const worksheet = XLSX.utils.json_to_sheet(data)
      const csv = XLSX.utils.sheet_to_csv(worksheet)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=codigos-votacion-${new Date().toISOString().split('T')[0]}.csv`,
        },
      })
    } catch (error) {
      console.error('Error exporting attendances:', error)
      return NextResponse.json(
        { error: 'Error al exportar datos' },
        { status: 500 }
      )
    }
  })
}
