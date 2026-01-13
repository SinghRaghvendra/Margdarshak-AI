
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Menu, Home, Info, DollarSign, Mail, LogIn, UserPlus, LogOut, BookUser, User as UserIcon, BookOpen, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import AuthStatus from '@/components/AuthStatus';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const languages = [
  { value: 'English', label: 'English' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Oriya', label: 'Oriya' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Arabic', label: 'Arabic' },
];

function LanguageSelector() {
    const { user } = useUser();
    const db = useFirestore();
    const { toast } = useToast();
    const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && db) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().language) {
                    setSelectedLanguage(docSnap.data().language);
                }
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [user, db]);

    const handleLanguageChange = async (newLanguage: string) => {
        if (!user || !db) return;
        
        setSelectedLanguage(newLanguage);
        toast({ title: 'Updating Language...', description: `Setting preferred report language to ${newLanguage}.`});
        
        try {
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { language: newLanguage }, { merge: true });
            
            const userInfoString = localStorage.getItem('margdarshak_user_info');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                userInfo.language = newLanguage;
                localStorage.setItem('margdarshak_user_info', JSON.stringify(userInfo));
            }

            toast({ title: 'Language Updated!', description: `Future reports will now be in ${newLanguage}.` });
        } catch (error) {
            console.error("Failed to update language:", error);
            toast({ title: 'Update Failed', description: 'Could not save your language preference.', variant: 'destructive'});
        }
    };

    if (!user || isLoading) {
        return null; // Don't show selector if logged out or loading
    }

    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select onValueChange={handleLanguageChange} value={selectedLanguage}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
    );
}


export default function Header() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth(); // This can be null on initial render

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
    { label: 'Blog', href: '/blog', icon: <BookOpen className="mr-2 h-5 w-5" />, isExternal: false },
    { label: 'Pricing', href: '/pricing', icon: <DollarSign className="mr-2 h-5 w-5" />, isExternal: false },
    { label: 'Contact', href: '/contact', icon: <Mail className="mr-2 h-5 w-5" />, isExternal: false },
  ];
  
  const userNavItems = [
      { label: 'My Reports', href: '/my-reports', icon: <BookUser className="mr-2 h-5 w-5" />, isExternal: false },
      { label: 'My Profile', href: '/profile', icon: <UserIcon className="mr-2 h-5 w-5" />, isExternal: false },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Logo />
        </div>
        <nav className="hidden md:flex items-center space-x-1">
          {mainNavItems.map((item) => (
            <Link key={item.label} href={item.href} target={item.isExternal ? '_blank' : '_self'} rel={item.isExternal ? 'noopener noreferrer' : ''}>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                  {item.label}
                </Button>
            </Link>
          ))}
          {user && userNavItems.map((item) => (
            <Link key={item.label} href={item.href} target={item.isExternal ? '_blank' : '_self'} rel={item.isExternal ? 'noopener noreferrer' : ''}>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                  {item.label}
                </Button>
            </Link>
          ))}
          {user && <LanguageSelector />}
          {auth && (
            user ? (
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
            )
          )}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            {auth && <AuthStatus />} 
          </div>
          <div className="md:hidden flex items-center gap-2">
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
                  {mainNavItems.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <Link href={item.href} target={item.isExternal ? '_blank' : '_self'} rel={item.isExternal ? 'noopener noreferrer' : ''} className="w-full">
                           <Button variant="ghost" className="w-full justify-start text-base py-3">
                             {item.icon} {item.label}
                           </Button>
                      </Link>
                    </SheetClose>
                  ))}
                  {user && userNavItems.map((item) => (
                    <SheetClose asChild key={item.label}>
                      <Link href={item.href} target={item.isExternal ? '_blank' : '_self'} rel={item.isExternal ? 'noopener noreferrer' : ''} className="w-full">
                           <Button variant="ghost" className="w-full justify-start text-base py-3">
                             {item.icon} {item.label}
                           </Button>
                      </Link>
                    </SheetClose>
                  ))}
                   {user && (
                    <div className="px-2 pt-2">
                      <LanguageSelector />
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    {auth && (
                      user ? (
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
                      )
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
