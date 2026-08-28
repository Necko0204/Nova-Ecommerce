import { Minus, Plus } from 'lucide-react';

export function QuantityControl({ value, onChange, max = 99 }: { value: number; onChange: (value: number) => void; max?: number }) {
  return (
    <div className="quantity-control" aria-label="Quantity">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={13} /></button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase quantity"><Plus size={13} /></button>
    </div>
  );
}
