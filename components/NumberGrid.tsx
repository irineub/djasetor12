"use client";

import { useState, useEffect } from "react";
import { Cart } from "./Cart";

// Removed hardcoded TOTAL_NUMBERS
const PRICE_PER_NUMBER = 5;

type NumberStatus = "AVAILABLE" | "RESERVED" | "PAID";

interface RaffleNumber {
  number: number;
  status: NumberStatus;
}

export function NumberGrid() {
  const [numbers, setNumbers] = useState<RaffleNumber[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination and Config state
  const [totalNumbers, setTotalNumbers] = useState(500);
  const [currentPage, setCurrentPage] = useState(1);
  const NUMBERS_PER_PAGE = 100;

  useEffect(() => {
    fetch("https://www.enpassantescoladexadrez.com.br/api/admin-easter")
      .then(res => res.json())
      .then(data => {
        // Look for configuration record
        const configRecord = data.find((d: any) => d.nome === "CONFIG_TOTAL_NUMBERS");
        const maxNumbers = configRecord ? Number(configRecord.ficha_rifa) : 500;
        setTotalNumbers(maxNumbers);

        const now = new Date().getTime();
        const reservedMap = new Map<number, NumberStatus>();
        
        for (const d of data) {
          if (d.nome === "CONFIG_TOTAL_NUMBERS") continue;

          const num = Number(d.ficha_rifa);
          const itemStatus = d.status;
          
          if (itemStatus === "PAGO") {
            reservedMap.set(num, "PAID");
          } else if (itemStatus === "PENDENTE") {
            const createdAt = new Date(d.created_at).getTime();
            const diffMinutes = (now - createdAt) / (1000 * 60);
            
            if (diffMinutes <= 15) {
              if (reservedMap.get(num) !== "PAID") {
                reservedMap.set(num, "RESERVED");
              }
            }
          } else if (!itemStatus) {
            // Backward compatibility for old records without status
            reservedMap.set(num, "PAID");
          }
        }

        const newNumbers: RaffleNumber[] = [];
        for (let i = 1; i <= maxNumbers; i++) {
          newNumbers.push({
            number: i,
            status: reservedMap.get(i) || "AVAILABLE"
          });
        }
        setNumbers(newNumbers);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch numbers", err);
        // Fallback to all available
        const newNumbers: RaffleNumber[] = [];
        for (let i = 1; i <= 500; i++) {
          newNumbers.push({ number: i, status: "AVAILABLE" });
        }
        setNumbers(newNumbers);
        setTotalNumbers(500);
        setLoading(false);
      });
  }, []);

  const toggleNumber = (num: number, status: NumberStatus) => {
    if (status !== "AVAILABLE") return;
    
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  return (
    <>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Carregando números disponíveis...</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 mb-8">
            {numbers
              .slice((currentPage - 1) * NUMBERS_PER_PAGE, currentPage * NUMBERS_PER_PAGE)
              .map((item) => {
              const isSelected = selectedNumbers.includes(item.number);
              let baseClass = "h-12 flex items-center justify-center rounded-md text-sm font-bold transition-all border-2 ";
              
              if (item.status === "AVAILABLE") {
                if (isSelected) {
                  baseClass += "bg-primary border-primary text-white scale-105 shadow-md";
                } else {
                  baseClass += "bg-white border-border text-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
                }
              } else if (item.status === "RESERVED") {
                baseClass += "bg-orange-100 border-orange-200 text-orange-400 cursor-not-allowed opacity-70";
              } else if (item.status === "PAID") {
                baseClass += "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50";
              }

              return (
                <button
                  key={item.number}
                  onClick={() => toggleNumber(item.number, item.status)}
                  disabled={item.status !== "AVAILABLE"}
                  className={baseClass}
                  title={item.status !== "AVAILABLE" ? `Status: ${item.status}` : "Disponível"}
                >
                  {item.number.toString().padStart(3, '0')}
                </button>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalNumbers > NUMBERS_PER_PAGE && (
            <div className="flex flex-wrap justify-center gap-2 mb-24">
              {Array.from({ length: Math.ceil(totalNumbers / NUMBERS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                    currentPage === page 
                      ? 'bg-primary text-white shadow-md' 
                      : 'bg-white border border-border text-foreground hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedNumbers.length > 0 && (
        <Cart selectedNumbers={selectedNumbers} price={PRICE_PER_NUMBER} />
      )}
    </>
  );
}
