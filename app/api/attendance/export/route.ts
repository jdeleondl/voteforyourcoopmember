import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'

    // Obtener asistencias confirmadas
    const attendances = await prisma.attendance.findMany({
      include: {
        member: true,
      },
      orderBy: {
        confirmedAt: 'asc',
      },
    })

    // Preparar datos para exportación
    const data = attendances.map((attendance, index) => ({
      '#': index + 1,
      'Nombre': attendance.member.name,
      'Cédula': attendance.member.cedula,
      'Correo': attendance.member.email,
      'Fecha de Confirmación': new Date(attendance.confirmedAt).toLocaleString('es-DO'),
      'Código': attendance.code,
    }))

    if (format === 'excel') {
      // Crear libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencia')

      // Generar buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename=asistencia-coopintec-${new Date().toISOString().split('T')[0]}.xlsx`,
        },
      })
    } else {
      // Generar CSV
      const worksheet = XLSX.utils.json_to_sheet(data)
      const csv = XLSX.utils.sheet_to_csv(worksheet)

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename=asistencia-coopintec-${new Date().toISOString().split('T')[0]}.csv`,
        },
      })
    }
  } catch (error) {
    console.error('Error exporting attendance:', error)
    return NextResponse.json(
      { error: 'Error al exportar datos' },
      { status: 500 }
    )
  }
}
