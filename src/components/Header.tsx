
'use client';

import Logo from '@/components/Logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu, Home, Info, DollarSign, Mail, LogIn, FileText } from 'lucide-react';

export default function Header() {
  const navItems = [
    { label: 'Features', href: '/#features', icon: <Info className="mr-2 h-5 w-5" />, isExternal: false },
    { label: 'Pricing', href: '/pricing', icon: <DollarSign className="mr-2 h-5 w-5" />, isExternal: false },
    { label: 'Free Resume Tailor', href: 'https://resumetailor.aicouncel.com', icon: <FileText className="mr-2 h-5 w-5" />, isExternal: true },
    { label: 'Contact', href: '/contact', icon: <Mail className="mr-2 h-5 w-5" />, isExternal: false },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} target={item.isExternal ? '_blank' : '_self'} rel={item.isExternal ? 'noopener noreferrer' : ''}>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                  {item.label}
                </Button>
            </Link>
          ))}
          <Link href="/signup">
            <Button className="text-sm ml-2 px-4 py-2">
              Login / Sign Up
            </Button>
          </Link>
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-2 p-4">
                <SheetClose asChild>
                   <Link href="/">
                    <Button variant="ghost" className="w-full justify-start text-base py-3">
                      <Home className="mr-2 h-5 w-5" /> Home
                    </Button>
                  </Link>
                </SheetClose>
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link href={item.href} target={item.isExternal ? '_blank' : '_self'} rel={item.isExternal ? 'noopener noreferrer' : ''} className="w-full">
                         <Button variant="ghost" className="w-full justify-start text-base py-3">
                           {item.icon} {item.label}
                         </Button>
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link href="/signup">
                    <Button variant="default" className="w-full text-base py-3 mt-4">
                       <LogIn className="mr-2 h-5 w-5" /> Login / Sign Up
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
