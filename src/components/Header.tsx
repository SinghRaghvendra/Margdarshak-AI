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
import { Menu, Home, Info, DollarSign, Mail, LogIn, UserPlus, LogOut, BookUser, User as UserIcon, BookOpen, Globe, Wand2, MessageCircle, UserPlus2, ShieldCheck, LayoutDashboard, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

const mainNavItems = [
  { label: 'AI Tools', href: '/aitools', icon: <Wand2 className="mr-2 h-5 w-5" /> },
  { label: 'Mentors & Counselors', href: '/career-mentors', icon: <MessageCircle className="mr-2 h-5 w-5" /> },
  { label: 'Blog', href: '/blog', icon: <BookOpen className="mr-2 h-5 w-5" /> },
  { label: 'Pricing', href: '/pricing', icon: <DollarSign className="mr-2 h-5 w-5" /> },
  { label: 'Contact', href: '/contact', icon: <Mail className="mr-2 h-5 w-5" /> },
];

export default function Header() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [userRole, setUserRole] = useState<'student' | 'mentor' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setUserRole(null);
      setIsAdmin(false);
      return;
    }
    const fetchRole = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserRole(data.role || 'student');
        setIsAdmin(data.isAdmin === true);
      }
    };
    fetchRole();
  }, [user, db]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('margdarshak_')) {
          localStorage.removeItem(key);
        }
      });
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/');
    } catch (error) {
      toast({ title: 'Logout Failed', variant: 'destructive' });
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <Logo />
        </div>
        <nav className="hidden lg:flex items-center space-x-1">
          {mainNavItems.map((item) => (
            <Link key={item.label} href={item.href}>
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                  {item.label}
                </Button>
            </Link>
          ))}
          {user && (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost" className="text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2">
                    <Settings2 className="mr-2 h-4 w-4" /> Admin Panel
                  </Button>
                </Link>
              )}
              {userRole === 'mentor' ? (
                <Link href="/mentor/dashboard">
                  <Button variant="ghost" className="text-sm font-medium text-primary hover:text-primary/80 px-3 py-2">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Mentor Hub
                  </Button>
                </Link>
              ) : (
                <Link href="/my-reports">
                  <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                    My Reports
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                  Profile
                </Button>
              </Link>
            </>
          )}
          {!user && (
            <Link href="/become-mentor">
              <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2">
                Become a Mentor
              </Button>
            </Link>
          )}
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
        <div className="lg:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <div className="flex flex-col space-y-2 p-4 mt-8">
                <Link href="/"><Button variant="ghost" className="w-full justify-start text-base py-3">Home</Button></Link>
                {mainNavItems.map((item) => (
                  <Link key={item.label} href={item.href} className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-base py-3">{item.label}</Button>
                  </Link>
                ))}
                {user && (
                  <>
                    {isAdmin && (
                      <Link href="/admin/dashboard" className="w-full">
                        <Button variant="ghost" className="w-full justify-start text-base py-3 text-red-600 font-bold"><Settings2 className="mr-2 h-5 w-5"/> Admin Panel</Button>
                      </Link>
                    )}
                    {userRole === 'mentor' && (
                      <Link href="/mentor/dashboard" className="w-full">
                        <Button variant="ghost" className="w-full justify-start text-base py-3 text-primary"><LayoutDashboard className="mr-2 h-5 w-5"/> Mentor Hub</Button>
                      </Link>
                    )}
                    <Link href="/my-reports" className="w-full"><Button variant="ghost" className="w-full justify-start text-base py-3">My Reports</Button></Link>
                    <Link href="/profile" className="w-full"><Button variant="ghost" className="w-full justify-start text-base py-3">Profile</Button></Link>
                  </>
                )}
                {!user && (
                  <Link href="/become-mentor" className="w-full"><Button variant="ghost" className="w-full justify-start text-base py-3">Become a Mentor</Button></Link>
                )}
                <div className="pt-4 border-t">
                  {user ? (
                    <Button onClick={handleLogout} className="w-full text-base py-3 mt-2"><LogOut className="mr-2 h-5 w-5" /> Logout</Button>
                  ) : (
                    <>
                      <Link href="/login" className="w-full"><Button variant="ghost" className="w-full justify-start text-base py-3">Login</Button></Link>
                      <Link href="/signup" className="w-full"><Button className="w-full text-base py-3 mt-2">Sign Up</Button></Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
