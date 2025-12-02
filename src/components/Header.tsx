
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { Menu, Home, Info, DollarSign, Mail, LogIn, UserPlus, FileText, LogOut, BookUser, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import AuthBeacon from './AuthBeacon';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      // Clear local storage on logout
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_')) {
          localStorage.removeItem(key);
        }
      });
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/');
    } catch (error) {
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
      console.error('Logout error:', error);
    }
  };

  const mainNavItems = [
    { label: 'Features', href: '/#features', icon: <Info className="mr-2 h-5 w-5" />, isExternal: false },
    { label: 'Pricing', href: '/pricing', icon: <DollarSign className="mr-2 h-5 w-5" />, isExternal: false },
    { label: 'Contact', href: '/contact', icon: <Mail className="mr-2 h-5 w-5" />, isExternal: false },
  ];
  
  const loggedInNavItems = [
      ...mainNavItems,
      { label: 'My Reports', href: '/my-reports', icon: <BookUser className="mr-2 h-5 w-5" />, isExternal: false },
      { label: 'My Profile', href: '/profile', icon: <UserIcon className="mr-2 h-5 w-5" />, isExternal: false },
  ];

  const navItems = user ? loggedInNavItems : mainNavItems;

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Logo />
        </div>
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} target={item.isExternal ? '_blank' : '_self'} rel={item.isExternal ? 'noopener noreferrer' : ''}>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                  {item.label}
                </Button>
            </Link>
          ))}
          {user ? (
            <Button onClick={handleLogout} variant="outline" className="text-sm ml-2 px-4 py-2">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="text-sm ml-2 px-4 py-2">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
           <div className="pl-4">
             <AuthBeacon />
           </div>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <AuthBeacon />
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
                <div className="pt-4 border-t">
                  {user ? (
                     <SheetClose asChild>
                        <Button onClick={handleLogout} variant="default" className="w-full text-base py-3 mt-2">
                            <LogOut className="mr-2 h-5 w-5" /> Logout
                        </Button>
                     </SheetClose>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link href="/login">
                          <Button variant="ghost" className="w-full justify-start text-base py-3">
                             <LogIn className="mr-2 h-5 w-5" /> Login
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/signup">
                          <Button variant="default" className="w-full text-base py-3 mt-2">
                             <UserPlus className="mr-2 h-5 w-5" /> Sign Up
                          </Button>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
