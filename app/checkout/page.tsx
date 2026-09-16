"use client";

import { useState, use, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";

const PRICE_PER_NUMBER = 5;
const WHATSAPP_NUMBER = "5592986040631"; 
const PIX_KEY = "Djasetor12@gmail.com";
const PIX_NAME = "Débora Ester";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const numerosParam = searchParams.get("numeros");
  
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cpf, setCpf] = useState("");
  const [step, setStep] = useState<"FORM" | "SUCCESS">("FORM");
  const [reservationId, setReservationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedNumbers = numerosParam 
    ? numerosParam.split(",").map(Number).filter(n => !isNaN(n))
    : [];

  const total = selectedNumbers.length * PRICE_PER_NUMBER;

  if (selectedNumbers.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-primary-dark mb-4">Nenhum número selecionado</h2>
        <Link href="/#numeros" className="text-primary hover:underline font-medium">
          Voltar e escolher números
        </Link>
      </div>
    );
  }

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const resId = Math.random().toString(36).substring(7).toUpperCase();
      
      // Create a reservation for each selected number
      for (const num of selectedNumbers) {
        await fetch('https://www.enpassantescoladexadrez.com.br/api/admin-easter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            nome: name,
            cpf: cpf.replace(/\D/g, ''),
            telefone: whatsapp.replace(/\D/g, ''),
            ficha_rifa: num,
            status: "PENDENTE",
            created_at: new Date().toISOString(),
            reservation_id: resId
          })
        });
      }
      setReservationId(resId);
      setStep("SUCCESS");
    } catch (error) {
      console.error("Failed to reserve", error);
      alert("Ocorreu um erro ao fazer a reserva. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedNumbers = selectedNumbers.map(n => n.toString().padStart(3, '0')).join(', ');
  
  const whatsappMessage = encodeURIComponent(
    `Olá! Gostaria de enviar o comprovante da rifa.\n\nNome: ${name}\nNúmeros: ${formattedNumbers}\nValor: R$ ${total.toFixed(2)}\nReserva: #${reservationId}`
  );
  
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-sm border border-border">
      
      {step === "FORM" && (
        <form onSubmit={handleReserve}>
          <h2 className="text-2xl font-bold text-primary-dark mb-6">Finalizar Reserva</h2>
          
          <div className="bg-background p-4 rounded-lg mb-6 border border-border">
            <p className="text-sm text-muted mb-1">Números selecionados:</p>
            <p className="font-bold text-foreground">{formattedNumbers}</p>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
              <span className="font-medium">Total:</span>
              <span className="font-bold text-xl text-primary-dark">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Nome Completo</label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="João da Silva"
              />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-foreground mb-1">CPF</label>
              <input
                type="text"
                id="cpf"
                required
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-foreground mb-1">WhatsApp</label>
              <input
                type="tel"
                id="whatsapp"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Processando..." : "Reservar Números"}
          </button>
        </form>
      )}

      {step === "SUCCESS" && (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-primary-dark mb-2">Reserva Realizada!</h2>
          <p className="text-muted mb-6">Sua reserva <strong className="text-foreground">#{reservationId}</strong> foi criada com sucesso.</p>
          
          <div className="bg-background p-4 rounded-lg mb-6 border border-border text-left">
            <p className="text-sm text-muted mb-1">Chave PIX:</p>
            <p className="font-bold text-foreground text-lg mb-1 select-all break-all">{PIX_KEY}</p>
            <p className="text-sm text-muted mb-3">Nome: <strong>{PIX_NAME}</strong></p>
            <p className="text-xs text-muted">Copie a chave acima e realize o pagamento no valor de <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</strong>.</p>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6 text-sm text-orange-800 text-left">
            <strong>Atenção:</strong> Você tem <strong>15 minutos</strong> para realizar o pagamento e enviar o comprovante. Após esse prazo, os números ficarão disponíveis novamente para o público.
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-sm text-blue-800 text-left">
            Após realizar o pagamento, é <strong>obrigatório</strong> enviar o comprovante pelo WhatsApp para confirmarmos seus números.
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-bold rounded-lg hover:bg-[#128C7E] transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Enviar Comprovante
          </a>
          
          <div className="mt-8">
            <Link href="/" className="text-muted hover:text-foreground text-sm">
              Voltar para o início
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4">
        <Suspense fallback={<div className="text-center">Carregando...</div>}>
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}
