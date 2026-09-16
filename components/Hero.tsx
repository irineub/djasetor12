import Link from "next/link";
import Image from "next/image";

export function Hero() {
  return (
    <div className="bg-gradient-to-b from-primary to-primary-dark text-white pt-16 pb-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none mix-blend-overlay">
        <Image 
          src="/logo.png" 
          alt="Background Logo" 
          fill
          className="object-contain"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-semibold tracking-wider uppercase mb-6 border border-white/20">
          Rifa Especial
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
          Concorra
        </h1>

        <p className="text-lg md:text-xl text-white/80 mb-6 max-w-2xl mx-auto">
          Participe da nossa rifa e ajude o <strong>DJA Setor 12</strong>. Sorteio no dia <strong>30 de Outubro</strong>.
          Cada número custa apenas <strong>R$ 5,00</strong>.
        </p>

        <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-10 max-w-xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-white">Prêmios no PIX:</h3>
          <ul className="space-y-2 text-lg text-left inline-block">
            <li className="flex items-center gap-3"><span className="text-2xl">🥇</span> <strong>1º Prêmio:</strong> R$ 200,00</li>
            <li className="flex items-center gap-3"><span className="text-2xl">🥈</span> <strong>2º Prêmio:</strong> R$ 250,00</li>
            <li className="flex items-center gap-3"><span className="text-2xl">🥉</span> <strong>3º Prêmio:</strong> R$ 300,00</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#numeros"
            className="px-8 py-4 bg-white text-primary-dark font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto text-center text-lg"
          >
            Escolher Meus Números
          </Link>
          <Link
            href="https://www.instagram.com/djasetor12/"
            target="_blank"
            className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-lg hover:bg-white/20 transition-colors w-full sm:w-auto text-center text-lg"
          >
            Siga nosso Instagram
          </Link>
        </div>
      </div>
    </div>
  );
}
