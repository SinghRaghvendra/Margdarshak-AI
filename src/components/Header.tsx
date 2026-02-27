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
} from '@/components/ui/sheet';
import { 
  Menu, 
  Home, 
  DollarSign, 
  Mail, 
  LogOut, 
  User as UserIcon, 
  BookOpen, 
  Wand2, 
  MessageCircle, 
  ShieldCheck, 
  LayoutDashboard, 
  Settings2,
  FileText,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signOut } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Separator } from '@/components/ui/separator';

const navLinks = [
  { label: 'AI Tools', href: '/aitools', icon: <Wand2 className="h-4 w-4" /> },
  { label: 'Mentors', href: '/career-mentors', icon: <MessageCircle className="h-4 w-4" /> },
  { label: 'Blog', href: '/blog', icon: <BookOpen className="h-4 w-4" /> },
  { label: 'Pricing', href: '/pricing', icon: <DollarSign className="h-4 w-4" /> },
  { label: 'Contact', href: '/contact', icon: <Mail className="h-4 w-4" /> },
];

export default function Header() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [userRole, setUserRole] = useState<'student' | 'mentor' | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
      toast({ title: 'Logged Out', description: 'See you again soon!' });
      setIsSheetOpen(false);
      router.push('/');
    } catch (error) {
      toast({ title: 'Logout Failed', variant: 'destructive' });
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border/40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              <Button variant="ghost" className="text-sm font-medium hover:text-primary transition-colors">
                {item.label}
              </Button>
            </Link>
          ))}
          
          <div className="h-6 w-px bg-border mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm" className="text-red-600 font-bold hover:bg-red-50">
                    <Settings2 className="mr-2 h-4 w-4" /> Admin
                  </Button>
                </Link>
              )}
              {userRole === 'mentor' ? (
                <Link href="/mentor/dashboard">
                  <Button variant="ghost" size="sm" className="text-primary font-semibold">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Mentor Hub
                  </Button>
                </Link>
              ) : (
                <Link href="/my-reports">
                  <Button variant="ghost" size="sm" className="font-medium">
                    <FileText className="mr-2 h-4 w-4" /> My Reports
                  </Button>
                </Link>
              )}
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm" className="ml-2">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="shadow-md">Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
              <SheetHeader className="p-6 text-left border-b">
                <SheetTitle><Logo /></SheetTitle>
              </SheetHeader>
              
              <div className="flex-grow overflow-y-auto py-4">
                {/* Main Navigation Group */}
                <div className="px-4 mb-6">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Main Menu</p>
                  <div className="space-y-1">
                    <MobileNavLink href="/" icon={<Home />} label="Home" onClick={() => setIsSheetOpen(false)} />
                    {navLinks.map((link) => (
                      <MobileNavLink 
                        key={link.label} 
                        href={link.href} 
                        icon={link.icon} 
                        label={link.label} 
                        onClick={() => setIsSheetOpen(false)} 
                      />
                    ))}
                  </div>
                </div>

                <Separator className="mx-6 mb-6" />

                {/* User Context Group */}
                <div className="px-4 mb-6">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">Account</p>
                  <div className="space-y-1">
                    {user ? (
                      <>
                        {isAdmin && (
                          <MobileNavLink 
                            href="/admin/dashboard" 
                            icon={<ShieldCheck className="text-red-500" />} 
                            label="Admin Dashboard" 
                            onClick={() => setIsSheetOpen(false)} 
                          />
                        )}
                        {userRole === 'mentor' ? (
                          <MobileNavLink 
                            href="/mentor/dashboard" 
                            icon={<LayoutDashboard className="text-primary" />} 
                            label="Mentor Hub" 
                            onClick={() => setIsSheetOpen(false)} 
                          />
                        ) : (
                          <MobileNavLink 
                            href="/my-reports" 
                            icon={<FileText className="text-primary" />} 
                            label="My Reports" 
                            onClick={() => setIsSheetOpen(false)} 
                          />
                        )}
                        <MobileNavLink 
                          href="/profile" 
                          icon={<UserIcon />} 
                          label="My Profile" 
                          onClick={() => setIsSheetOpen(false)} 
                        />
                      </>
                    ) : (
                      <>
                        <MobileNavLink 
                          href="/login" 
                          icon={<UserIcon />} 
                          label="Login" 
                          onClick={() => setIsSheetOpen(false)} 
                        />
                        <MobileNavLink 
                          href="/signup" 
                          icon={<UserPlus />} 
                          label="Join AI Councel" 
                          onClick={() => setIsSheetOpen(false)} 
                        />
                      </>
                    )}
                  </div>
                </div>

                {!user && (
                  <div className="px-6 mt-4">
                    <Link href="/become-mentor" onClick={() => setIsSheetOpen(false)}>
                      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          <span className="text-sm font-bold text-primary">Become a Mentor</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {user && (
                <div className="p-6 border-t mt-auto">
                  <Button variant="destructive" className="w-full justify-start font-bold" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block group">
      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </div>
          <span className="font-semibold text-foreground/80 group-hover:text-foreground transition-colors">{label}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}
