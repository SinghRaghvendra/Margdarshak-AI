
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
      <span className="text-xl md:text-2xl font-black tracking-tighter text-primary">
        AI Councel Lab
      </span>
    </Link>
  );
}
