import Logo from '@/components/Logo';

export default function Header() {
  return (
    <header className="bg-background shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        {/* Navigation items can be added here */}
      </div>
    </header>
  );
}
