import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {user?.firstName || user?.email}{' '}
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
            {user?.role}
          </span>
        </span>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="mr-1 h-4 w-4" />
          Salir
        </Button>
      </div>
    </header>
  );
}
