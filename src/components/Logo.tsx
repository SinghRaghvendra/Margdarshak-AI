
import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image 
        src="/logo.png" 
        alt="AI COUNCEL" 
        width={180} 
        height={45} 
        className="h-10 w-auto object-contain"
        priority
      />
    </Link>
  );
}
