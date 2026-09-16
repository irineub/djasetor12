"use client";

import Link from "next/link";

interface CartProps {
  selectedNumbers: number[];
  price: number;
}

export function Cart({ selectedNumbers, price }: CartProps) {
  const total = selectedNumbers.length * price;
  
  // Format numbers for display e.g. "001, 024, 157"
  const formattedNumbers = selectedNumbers
    .sort((a, b) => a - b)
    .map(n => n.toString().padStart(3, '0'))
    .join(', ');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex-1 w-full">
          <div className="flex justify-between md:block">
            <span className="text-sm font-medium text-muted block mb-1">
              {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número selecionado' : 'números selecionados'}:
            </span>
            <span className="text-primary-dark font-bold truncate block max-w-[200px] md:max-w-md">
              {formattedNumbers}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-6">
          <div className="text-left md:text-right">
            <span className="text-sm font-medium text-muted block mb-1">Total:</span>
            <span className="text-2xl font-bold text-primary-dark">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
            </span>
          </div>
          
          <Link 
            href={`/checkout?numeros=${selectedNumbers.join(',')}`}
            className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition-colors shadow-md"
          >
            Continuar
          </Link>
        </div>

      </div>
    </div>
  );
}
