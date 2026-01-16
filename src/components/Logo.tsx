
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="text-2xl font-extrabold tracking-wider text-primary hover:text-primary/90 transition-colors">
      <span>AI COUNCEL</span>
    </Link>
  );
}
