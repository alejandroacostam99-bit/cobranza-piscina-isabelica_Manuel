import React from 'react';
import { MdPayments, MdDateRange } from 'react-icons/md';

export interface IPaymentData {
  currency: 'USD' | 'BS';
  paymentMethod: string;
  paymentAmount: number | '';
  paymentRef: string;
  paymentDate: string;
  coverageDate: string;
  // Se eliminó coverageSince
}

interface PaymentProps {
  paymentData: IPaymentData;
  setPaymentData: React.Dispatch<React.SetStateAction<IPaymentData>>;
}

export const PaymentForm: React.FC<PaymentProps> = ({ paymentData, setPaymentData }) => {

  const paymentOptions = {
    BS: [
      { value: 'pago_movil', label: 'Pago Móvil' },
      { value: 'transferencia', label: 'Transferencia Bancaria' },
      { value: 'efectivo', label: 'Efectivo (Bs)' },
      { value: 'punto', label: 'Punto de Venta' }
    ],
    USD: [
      { value: 'zelle', label: 'Zelle' },
      { value: 'efectivo', label: 'Efectivo ($)' },
      { value: 'binance', label: 'Binance / USDT' },
      { value: 'transferencia_int', label: 'Transferencia Intl.' }
    ]
  };
  
  const currentOptions = paymentOptions[paymentData.currency] || paymentOptions.BS;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (currency: 'USD' | 'BS') => {
    const defaultMethod = paymentOptions[currency][0].value;
    setPaymentData(prev => ({ 
      ...prev, 
      currency, 
      paymentMethod: defaultMethod,
      paymentAmount: '', 
      paymentRef: ''
    }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6 animate-fade-in">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800">
        <MdPayments className="text-green-500 text-2xl" /> Registrar Pago Mensual
      </h3>
      
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            {(['USD', 'BS'] as const).map((curr) => (
              <button 
                key={curr} type="button" onClick={() => handleCurrencyChange(curr)}
                className={`flex-1 py-1.5 rounded font-bold text-xs transition-colors ${paymentData.currency === curr ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {curr}
              </button>
            ))}
          </div>
          <select 
            name="paymentMethod" 
            value={paymentData.paymentMethod} 
            onChange={handleChange} 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 p-2 outline-none font-bold uppercase"
          >
            {currentOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
           <div>
             <label className="text-xs text-slate-500 font-bold mb-1 block uppercase">
               Monto a Pagar {paymentData.currency === 'BS' && <span className="text-red-500">*</span>}
             </label>
             <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                 {paymentData.currency === 'USD' ? '$' : 'Bs'}
               </span>
               <input 
                 type="number" 
                 name="paymentAmount" 
                 value={paymentData.paymentAmount} 
                 onChange={handleChange} 
                 placeholder="0.00"
                 min="0"
                 step="0.01"
                 className={`w-full bg-white border rounded-lg p-2.5 pl-9 text-sm text-slate-800 font-bold focus:outline-none placeholder-slate-300
                   ${paymentData.currency === 'BS' && (!paymentData.paymentAmount || Number(paymentData.paymentAmount) <= 0) ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'}
                 `} 
               />
             </div>
           </div>

           {!paymentData.paymentMethod.includes('efectivo') && (
             <div>
               <label className="text-xs text-slate-500 font-bold mb-1 block uppercase">Número de Referencia</label>
               <input 
                 type="text" name="paymentRef" value={paymentData.paymentRef} onChange={handleChange} 
                 placeholder="Ej: 123456" 
                 className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 uppercase" 
               />
             </div>
           )}

           {/* FECHAS SIMPLIFICADAS */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 mt-2">
             <div>
               <label className="text-xs text-slate-500 font-bold mb-1 block uppercase">Fecha de pago</label>
               <input 
                 type="date" 
                 name="paymentDate"
                 value={paymentData.paymentDate}
                 onChange={handleChange}
                 className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" 
               />
             </div>

             <div>
               <label className="text-xs text-green-600 font-bold mb-1 flex items-center gap-1 uppercase">
                 <MdDateRange /> Fecha de Vencimiento (Cubre Hasta)
               </label>
               <input 
                 type="date" 
                 name="coverageDate"
                 value={paymentData.coverageDate}
                 onChange={handleChange}
                 className="w-full bg-green-50 border border-green-200 rounded-lg p-2.5 text-xs text-green-700 font-bold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20" 
               />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};