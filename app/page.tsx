"use client"; // Esto es obligatorio para usar estados y clics
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface ResultadoVoucher {
  valid: boolean;
  message: string;
  amount?: number; // El ? significa que es opcional
  origin?: string;
}

interface VoucherResult {
  valid: boolean;
  message: string;
  voucherId?: string; // <-- Verifica que esta línea exista
}
export default function Home() {
  // Aquí irán tus estados (Paso 1)
  const [code, setCode] = useState(""); // estado para el código
  const [loading, setLoading] = useState(false); // estado para el loading
  const [result, setResult] = useState<VoucherResult | null>(null); // estado para el resultado de la validación
  const [amount, setAmount] = useState(""); // estado para el monto
  const [source, setSource] = useState(''); // estado para la procedencia

  // Aquí irán tus funciones (Paso 2 y 4)
  const validateVoucher = async () => {
  setLoading(true);
  setResult(null); // Limpiamos cualquier resultado anterior para "resetear" la vista

  console.log("Consultando código:", code.trim().toUpperCase());

  try {
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error) {
      console.error("Error de Supabase:", error);
      setResult({ valid: false, message: "❌ El código no existe en la base de datos." });
    } else if (data) {
      console.log("Datos recibidos de Supabase:", data);

      if (data.is_used) {
        setResult({ 
          valid: false, 
          message: `⚠️ Este voucher ya se usó.` 
        });
      } else {
        setResult({
          valid: true,
          message: "✅ ¡Voucher válido!",
          voucherId: data.id,
        });
      }
    }
  } catch (err) {
    console.error("Error inesperado:", err);
    setResult({ valid: false, message: "Ocurrió un error inesperado." });
  } finally {
    setLoading(false);
  }
};

 const redeemVoucher = async () => {
  if (!result?.voucherId) return;
  setLoading(true);

  // 1. Intentamos registrar el canje
  const { error } = await supabase
    .from("redemptions")
    .insert([
      {
        voucher_id: result.voucherId,
        amount: parseFloat(amount),
        source: source,
      },
    ]);

  if (error) {
    alert("Error al registrar el canje en la base de datos");
    setLoading(false);
    return; // Si falló el insert, nos detenemos aquí
  }

  // 2. Si el canje fue exitoso, RECIÉN AHÍ marcamos el voucher como usado
  const { error: updateError } = await supabase
    .from("vouchers")
    .update({ is_used: true })
    .eq("id", result.voucherId);

  if (updateError) {
    alert("Canje registrado, pero no se pudo marcar el voucher como usado");
    console.error(updateError);
  } else {
    alert("¡Voucher canjeado y desactivado con éxito!");
    
    // 3. Limpiamos todo para el siguiente cliente
    setResult(null);
    setCode('');
    setAmount('');
    setSource('');
  }

  setLoading(false);
};

 return (
  <main className="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Despa Validador</h1>

      {/* VISTA 1: BUSCADOR (Si no hay un voucher válido en el estado) */}
      {!result?.valid ? (
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">Ingresa el código de 10 dígitos:</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              maxLength={10}
              placeholder="Ej: ABC123XYZ4"
              className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 uppercase font-mono"
            />
          </div>
          <button 
            onClick={validateVoucher}
            disabled={loading || code.length < 5}
            className="w-full bg-orange-500 text-white p-3 rounded-xl font-bold hover:bg-orange-600 disabled:bg-slate-300 transition-all"
          >
            {loading ? "Verificando..." : "Validar Código"}
          </button>
        </div>
      ) : (
        /* VISTA 2: CANJE (Si el voucher ya fue validado) */
        <div className="space-y-5 animate-in fade-in zoom-in duration-300">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
            <p className="text-green-600 text-sm font-medium">¡Voucher Válido!</p>
            <p className="text-2xl font-bold text-green-800">{code.toUpperCase()}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Monto de la cuenta</label>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Origen del cliente</label>
              <select 
                value={source} 
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Selecciona una opción</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
                <option value="Directo">Puerta / Cartel</option>
              </select>
            </div>

            <button 
              onClick={redeemVoucher}
              disabled={loading || !amount || !source}
              className="w-full bg-green-600 text-white p-4 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
            >
              {loading ? "Guardando..." : "Confirmar Canje"}
            </button>

            <button 
              onClick={() => {setResult(null); setCode('');}} 
              className="w-full text-slate-400 text-sm py-2 hover:text-slate-600"
            >
              Cancelar y volver
            </button>
          </div>
        </div>
      )}
    </div>
  </main>
);
}
