'use client'

import Link from 'next/link'

export default function VotingConfirmationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
        <div className="text-green-600 text-6xl mb-4">
          ✓
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ¡Voto Registrado!
        </h1>
        <p className="text-gray-600 mb-6">
          Su voto ha sido registrado exitosamente. Gracias por participar en el proceso electoral de COOPINTEC 2025.
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-purple-900">
            <strong>Importante:</strong> Su voto es confidencial y no puede ser modificado una vez enviado.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}
