import Link from 'next/link'

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-green-900 mb-4">
            ¡Votación Exitosa!
          </h1>

          <p className="text-xl text-gray-700 mb-2">
            Tu voto ha sido registrado correctamente
          </p>

          <p className="text-gray-600">
            Gracias por participar en la Asamblea General de COOPINTEC 2025
          </p>
        </div>

        {/* Información */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                Información Importante
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tu voto ha sido registrado de forma segura y anónima</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>No es posible modificar tu votación una vez confirmada</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Los resultados serán anunciados al finalizar la asamblea</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Estadísticas decorativas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">✓</div>
            <p className="text-sm text-gray-600">Voto Seguro</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">🔒</div>
            <p className="text-sm text-gray-600">Confidencial</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-pink-600 mb-1">📊</div>
            <p className="text-sm text-gray-600">Registrado</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg transition-all shadow-lg">
              Volver al Inicio
            </button>
          </Link>

          <Link href="/resultados" className="block">
            <button className="w-full bg-white hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-lg border-2 border-gray-300 transition-all">
              Ver Resultados (Disponible al finalizar)
            </button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
          <p className="font-semibold mb-1">COOPINTEC 2025</p>
          <p>Asamblea General - Sistema de Votación Electrónica</p>
        </div>
      </div>
    </div>
  )
}
