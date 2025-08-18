
'use client';

import { useState, useEffect } from 'react';
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
import { Menu, Home, Info, DollarSign, Mail, LogIn, FileText, User, LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AppUser {
  uid: string;
  name: string;
  email: string | null;
}

export default function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        // User is signed in.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            uid: user.uid,
            name: userData.name || 'User',
            email: user.email,
          });
        } else {
           // This case can happen if user exists in Auth but not in Firestore.
           // For robustness, you could create the Firestore doc here, or sign them out.
           setCurrentUser({ uid: user.uid, name: 'User', email: user.email });
        }
      } else {
        // User is signed out.
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  const navItems = [
    { label: 'Features', href: '/#features', icon: <Info className="mr-2 h-5 w-5" /> },
    { label: 'Pricing', href: '/pricing', icon: <DollarSign className="mr-2 h-5 w-5" /> },
    { label: 'Free Resume Tailor', href: '/resume-tailor', icon: <FileText className="mr-2 h-5 w-5" /> },
    { label: 'Contact', href: '/contact', icon: <Mail className="mr-2 h-5 w-5" /> },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} passHref legacyBehavior>
              <a>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                  {item.label}
                </Button>
              </a>
            </Link>
          ))}
          {isLoading ? (
            <div className="w-24 h-8 bg-muted rounded-md animate-pulse ml-2" />
          ) : currentUser ? (
            <>
              <span className="text-sm text-muted-foreground ml-4 mr-2">Welcome, {currentUser.name}</span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-sm">
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <Link href="/login" passHref>
              <Button className="text-sm ml-2 px-4 py-2">
                Login / Sign Up
              </Button>
            </Link>
          )}
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
                   <Link href="/" passHref>
                    <Button variant="ghost" className="w-full justify-start text-base py-3">
                      <Home className="mr-2 h-5 w-5" /> Home
                    </Button>
                  </Link>
                </SheetClose>
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link href={item.href} passHref>
                       <Button variant="ghost" className="w-full justify-start text-base py-3">
                         {item.icon} {item.label}
                       </Button>
                    </Link>
                  </SheetClose>
                ))}

                {isLoading ? (
                  <div className="w-full h-10 bg-muted rounded-md animate-pulse mt-4" />
                ) : currentUser ? (
                   <SheetClose asChild>
                      <Button onClick={handleLogout} variant="destructive" className="w-full text-base py-3 mt-4">
                         <LogOut className="mr-2 h-5 w-5" /> Logout
                      </Button>
                   </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Link href="/login" passHref>
                      <Button variant="default" className="w-full text-base py-3 mt-4">
                         <LogIn className="mr-2 h-5 w-5" /> Login / Sign Up
                      </Button>
                    </Link>
                  </SheetClose>
                )}

              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
