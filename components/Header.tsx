import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-primary border-b border-primary-dark">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              src="/logo.png"
              alt="Dunamis DJA Setor 12 Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xl leading-tight">DUNAMIS</span>
            <span className="text-white/80 text-xs font-medium uppercase tracking-widest">DJA Setor 12</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="https://www.instagram.com/djasetor12/" target="_blank" className="text-white/90 hover:text-white transition-colors font-medium">
            Instagram
          </Link>
          <Link href="#numeros" className="text-white/90 hover:text-white transition-colors font-medium">
            Números
          </Link>

        </nav>
      </div>
    </header>
  );
}
