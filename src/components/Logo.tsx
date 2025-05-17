import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
      <Briefcase className="h-8 w-8" />
      <span>Margdarshak AI</span>
    </Link>
  );
}
