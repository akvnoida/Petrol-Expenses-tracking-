import React, { useState } from 'react';
import { X, Fuel, IndianRupee, MapPin, Calculator, Sparkles } from 'lucide-react';
import { PetrolPump } from '../../types';

interface ComposeFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFuel: (amount: number, liters: number, stationName?: string) => void;
  availablePumps: PetrolPump[];
  preselectedPump?: PetrolPump | null;
}

export const ComposeFuelModal: React.FC<ComposeFuelModalProps> = ({
  isOpen,
  onClose,
  onSaveFuel,
  availablePumps,
  preselectedPump,
}) => {
  const [amount, setAmount] = useState<string>('500');
  const [liters, setLiters] = useState<string>('5.17');
  const [selectedPumpId, setSelectedPumpId] = useState<string>(
    preselectedPump ? preselectedPump.id : (availablePumps[0]?.id || '')
  );
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(96.72);

  if (!isOpen) return null;

  // Auto calculate liters when amount is typed
  const handleAmountChange = (val: string) => {
    setAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && fuelPricePerLiter > 0) {
      setLiters((num / fuelPricePerLiter).toFixed(2));
    }
  };

  // Auto calculate amount when liters is typed
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0 && fuelPricePerLiter > 0) {
      setAmount((num * fuelPricePerLiter).toFixed(2));
    }
  };

  const handlePumpSelect = (pumpId: string) => {
    setSelectedPumpId(pumpId);
    const found = availablePumps.find((p) => p.id === pumpId);
    if (found) {
      setFuelPricePerLiter(found.fuelPrice);
      const numAmt = parseFloat(amount);
      if (!isNaN(numAmt) && numAmt > 0) {
        setLiters((numAmt / found.fuelPrice).toFixed(2));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numLiters = parseFloat(liters);
    if (!isNaN(numAmount) && numAmount > 0 && !isNaN(numLiters) && numLiters > 0) {
      const pumpName = availablePumps.find((p) => p.id === selectedPumpId)?.name || 'Petrol Pump';
      onSaveFuel(numAmount, numLiters, pumpName);
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 text-white max-h-[90%] overflow-y-auto">
        {/* Android Material Sheet Handle */}
        <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Add Fuel Expense</h3>
              <p className="text-[11px] text-slate-400">Stores to Room Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Amount Spent Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Amount Spent (₹)</span>
              <span className="text-[10px] text-emerald-400">Auto-calculates Liters</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="e.g. 500"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            {/* Quick preset chips */}
            <div className="flex gap-1.5 mt-1.5">
              {[200, 500, 1000, 2000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => handleAmountChange(preset.toString())}
                  className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-slate-300"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Liters Filled Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Liters Filled (L)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Fuel className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={liters}
                onChange={(e) => handleLitersChange(e.target.value)}
                placeholder="e.g. 5.17"
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Station Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Petrol Pump Station</span>
            </label>
            <select
              value={selectedPumpId}
              onChange={(e) => handlePumpSelect(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:outline-hidden focus:border-emerald-500"
            >
              {availablePumps.map((pump) => (
                <option key={pump.id} value={pump.id}>
                  {pump.name} (₹{pump.fuelPrice}/L)
                </option>
              ))}
            </select>
          </div>

          {/* Calculated Unit Price Info */}
          <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              Unit Fuel Rate
            </span>
            <span className="font-semibold text-white">₹{fuelPricePerLiter.toFixed(2)} / L</span>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 px-3 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Save Fuel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
