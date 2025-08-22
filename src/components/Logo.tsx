
import Link from 'next/link';
import { Mountain } from 'lucide-react';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors" aria-label="Margdarshak AI Logo, go to homepage">
       <div className="p-1.5 bg-primary rounded-lg">
          <Mountain className="h-6 w-6 text-primary-foreground" />
       </div>
      <span className="hidden sm:inline-block">Margdarshak AI</span>
    </Link>
  );
}
