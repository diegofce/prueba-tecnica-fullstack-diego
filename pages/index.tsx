import { absoluteUrl } from '@/lib/absoluteUrl';
// pages/index.tsx
import { useSession } from "../auth/session";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  LogOut,
  Github
} from "lucide-react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.role === "ADMIN";

  const handleSignOut = async () => {
    // desde el cliente usar el endpoint relativo de sign-out
    await fetch('/api/auth/sign-out', { method: 'POST' });
    window.location.href = '/';
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sistema de Gestion Financiera</CardTitle>
            <CardDescription>Inicia sesion para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => window.location.href = "/api/auth/sign-in/github"}
            >
              <Github className="mr-2 h-5 w-5" />
              Iniciar Sesion con GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const menuItems = [
    {
      title: "Movimientos",
      description: "Gestiona ingresos y egresos",
      icon: TrendingUp,
      href: "/movements",
      available: true,
      color: "bg-blue-500"
    },
    {
      title: "Usuarios",
      description: "Administra usuarios del sistema",
      icon: Users,
      href: "/users",
      available: isAdmin,
      color: "bg-green-500"
    },
    {
      title: "Reportes",
      description: "Visualiza estadÃ­sticas y descarga reportes",
      icon: BarChart3,
      href: "/reports",
      available: isAdmin,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Gestion Financiera
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bienvenido, {session.user?.name || session.user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {session.user?.name}
                </p>
                <p className="text-xs text-gray-500">
                  {session.user?.role === "ADMIN" ? "Administrador" : "Usuario"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Control
          </h2>
          <p className="text-gray-600">
            Selecciona una opciÃ³n del menÃº principal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isAvailable = item.available;

            return (
              <Card 
                key={item.title}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  !isAvailable ? "opacity-50" : ""
                }`}
                onClick={() => isAvailable && router.push(item.href)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`${item.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {!isAvailable && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        Solo Admin
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant={isAvailable ? "default" : "secondary"}
                    disabled={!isAvailable}
                  >
                    {isAvailable ? "Acceder" : "Acceso Restringido"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!isAdmin && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              â„¹ï¸ <strong>Nota:</strong> Algunas funciones estÃ¡n restringidas a usuarios con rol de Administrador.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
