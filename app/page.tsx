import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">
            COOPINTEC 2025
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Sistema de Votación y Confirmación de Asistencia
          </p>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mt-4"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Confirmación de Asistencia */}
          <Link href="/asistencia">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer hover:shadow-lg group">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  Confirmar Asistencia
                </h2>
                <p className="text-gray-700">
                  Registra tu presencia en la asamblea y obtén tu código de votación
                </p>
              </div>
            </div>
          </Link>

          {/* Votación */}
          <Link href="/votacion">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer hover:shadow-lg group">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-indigo-900 mb-2">
                  Votar
                </h2>
                <p className="text-gray-700">
                  Accede con tu código para ejercer tu derecho al voto
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Dashboards */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Link href="/dashboard">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer hover:shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-lg font-semibold text-purple-900">
                  Dashboard Público
                </span>
              </div>
            </div>
          </Link>

          <Link href="/admin/login">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-xl p-4 border-2 border-gray-600 hover:border-gray-500 transition-all cursor-pointer hover:shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-lg font-semibold text-gray-200">
                  Panel de Administración
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Asamblea General COOPINTEC 2025</p>
          <p>Sistema de Votación Electrónica</p>
        </div>
      </div>
    </div>
  );
}
