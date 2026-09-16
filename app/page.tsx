import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { NumberGrid } from "@/components/NumberGrid";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <section id="numeros" className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-primary-dark mb-4">Escolha seus números</h2>
            <p className="text-muted">Selecione os números que deseja reservar. Quanto mais números, maiores as chances!</p>
          </div>
          
          <NumberGrid />
        </section>
      </main>
      <footer className="bg-primary-dark text-white py-8 text-center">
        <p className="opacity-80">© {new Date().getFullYear()} DJA Mais que Vencedores. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
