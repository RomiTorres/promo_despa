//  <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
//       <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
//         <div className="flex items-center gap-2 mb-6">
//           <Ticket className="text-orange-500" />
//           <h1 className="text-xl font-bold text-slate-800">Validador de Vouchers</h1>
//         </div>

//         <div className="flex gap-2 mb-6">
//           <input
//             type="text"
//             placeholder="Código de 10 dígitos"
//             className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 uppercase"
//             value={codigo}
//             onChange={(e) => setCodigo(e.target.value)}
//             maxLength={10}
//           />
//           <button 
//             onClick={buscarVoucher}
//             disabled={loading || codigo.length < 10}
//             className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:bg-slate-300 transition-colors"
//           >
//             {loading ? '...' : <Search size={20} />}
//           </button>
//         </div>

//         {resultado?.estado === 'error' && (
//           <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-700">
//             <XCircle /> <p>{resultado.mensaje}</p>
//           </div>
//         )}

//         {resultado?.estado === 'usado' && (
//           <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
//             <div className="flex items-center gap-3 text-amber-700 mb-2">
//               <XCircle /> <p className="font-bold">Ya canjeado</p>
//             </div>
//             <p className="text-sm text-slate-600">Fecha: {new Date(resultado.data.canjeado_el).toLocaleString()}</p>
//             <p className="text-sm text-slate-600">Monto: ${resultado.data.importe}</p>
//           </div>
//         )}

//         {resultado?.estado === 'disponible' && (
//           <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-700">
//             <div className="flex items-center gap-3 mb-4">
//               <CheckCircle /> <p className="font-bold">¡Voucher Válido!</p>
//             </div>
//             {/* Aquí iría el formulario para insertar en la tabla canjes */}
//             <p className="text-sm text-green-600">Listo para ser canjeado ahora mismo.</p>
//           </div>
//         )}
//       </div>
//     </main>