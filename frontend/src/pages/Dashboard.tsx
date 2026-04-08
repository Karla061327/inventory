import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Bienvenido, {user?.firstName || user?.email}
      </p>
    </div>
  );
}
