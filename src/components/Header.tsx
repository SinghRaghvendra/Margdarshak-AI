
import Logo from '@/components/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} passHref>
              <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                {item.label}
              </Button>
            </Link>
          ))}
          <Link href="/signup" passHref>
            <Button className="text-sm ml-2">
              Login / Sign Up
            </Button>
          </Link>
        </nav>
        <div className="md:hidden">
          {/* Mobile Menu Trigger - Can be implemented with Sheet component if needed */}
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
