"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface VoucherResult {
  valid: boolean;
  message: string;
  voucherId?: string;
}

export default function Home() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoucherResult | null>(null);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState('');

  // 1. FUNCIÓN PARA VALIDAR EL CÓDIGO
  const validateVoucher = async () => {
    setLoading(true);
    setResult(null);

    // 1. Logs de control para ver qué pasa en la consola (F12)
    console.log("1. Iniciando validación...");
    console.log("2. URL de Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Verificación de seguridad por si el archivo .env falló tras el formateo
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      alert("❌ Error: No se detectan las variables de entorno en .env.local");
      setLoading(false);
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    
    try {
      console.log("3. Enviando consulta para el código:", cleanCode);
      
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .ilike("code", cleanCode)
        .maybeSingle();

      console.log("4. Respuesta recibida de Supabase:", { data, error });

      if (error) {
        alert("Error técnico de Supabase: " + error.message);
        return;
      }

      if (!data) {
        setResult({ 
          valid: false, 
          message: "❌ El código no existe en la base de datos." 
        });
      } else if (data.is_used) {
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
    } catch (err) {
      console.error("5. Error catastrófico:", err);
      alert("Error de conexión. Revisa tu internet o la consola.");
    } finally {
      setLoading(false);
    }
  };

  // 2. FUNCIÓN PARA CANJEAR (REDEEM)
  const redeemVoucher = async () => {
    if (!result?.voucherId) return;
    setLoading(true);

    try {
      // Registrar en la tabla de redemptions
      const { error: insertError } = await supabase
        .from("redemptions")
        .insert([
          {
            voucher_id: result.voucherId,
            amount: parseFloat(amount),
            source: source,
          },
        ]);

      if (insertError) {
        throw new Error("No se pudo registrar el canje: " + insertError.message);
      }

      // Marcar el voucher como usado
      const { error: updateError } = await supabase
        .from("vouchers")
        .update({ is_used: true })
        .eq("id", result.voucherId);

      if (updateError) {
        throw new Error("Canje registrado, pero falló al desactivar el voucher.");
      }

      alert("¡Canje realizado con éxito!");
      
      // Limpiar estados
      setResult(null);
      setCode('');
      setAmount('');
      setSource('');

    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Despa Validador</h1>

        {/* SI HAY UN MENSAJE DE ERROR (Voucher no encontrado o ya usado) */}
        {result && !result.valid && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center">
            {result.message}
          </div>
        )}

        {/* VISTA 1: BUSCADOR */}
        {!result?.valid ? (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">Ingresa el código de 10 dígitos:</p>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              maxLength={10}
              placeholder="Ej: ABC123XYZ4"
              className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500 uppercase font-mono text-black"
            />
            <button 
              onClick={validateVoucher}
              disabled={loading || code.length < 3}
              className="w-full bg-orange-500 text-white p-3 rounded-xl font-bold hover:bg-orange-600 disabled:bg-slate-300 transition-all"
            >
              {loading ? "Verificando..." : "Validar Código"}
            </button>
          </div>
        ) : (
          /* VISTA 2: FORMULARIO DE CANJE */
          <div className="space-y-5 animate-in fade-in zoom-in duration-300">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
              <p className="text-green-600 text-sm font-medium">¡Voucher Válido!</p>
              <p className="text-2xl font-bold text-green-800">{code.toUpperCase()}</p>
            </div>

            <div className="space-y-4 text-black">
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