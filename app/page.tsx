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
  const [origin, setOrigin] = useState(""); // estado para la procedencia

  // Aquí irán tus funciones (Paso 2 y 4)
  const validateVoucher = async () =>{
    setLoading(true);
    //consulta a Supabase
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("code", code)
      .single();

    if (error) {
      setResult({ valid: false, message: "Voucher no encontrado" });
    } else {
      setResult({
        valid: true,
        message: "Voucher válido",
        voucherId: data.id // guardamos el ID del voucher para usarlo después
      });
    }

    setLoading(false);
  }

//   const redeemVoucher = async () => {
//   setLoading(true);

//   const { error } = await supabase
//     .from("redemptions") // La tabla de canjes
//     .insert([
//       {
//         voucher_id: result.voucherId, // El ID que guardamos arriba
//         amount: parseFloat(amount),  // El estado del input del monto
//         source: source,              // El estado del select de origen
//       },
//     ]);

//   if (error) {
//     alert("Error al canjear");
//   } else {
//     alert("¡Canjeado con éxito!");
//     // Pista: Aquí deberías resetear los estados para el próximo cliente
//   }
//   setLoading(false);
// };
  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
      <h1>Validador de Voucher</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={10}
          placeholder="Código de 10 dígitos"
          className="flex-1 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 uppercase"
        />
        <button
          className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 disabled:bg-slate-300 transition-colors "
          onClick={validateVoucher}
        >
          Validar
        </button>
      </div>
      </div>
    </main>
  );
}
