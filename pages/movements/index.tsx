import { absoluteUrl } from '@/lib/absoluteUrl';
// ...existing code...
import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { Role } from '@prisma/client';
import type { Movement as MovementType } from '@/auth/types';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

import MovementForm from '@/components/ui/MovementForm';

const MovementsPage = () => {
  const { data: session, status } = useSession() as { data: any | null; status: string };
  const isAdmin = session?.user?.role === Role.ADMIN;
  const [movements, setMovements] = useState<MovementType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMovements = async () => {
    if (status !== 'authenticated') return;
    setLoading(true);
    try {
      const res = await fetch(absoluteUrl('')));
      if (res.ok) {
        const data: MovementType[] = await res.json();
        setMovements(data);
      } else {
        console.error('Failed to fetch movements:', res.statusText);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') fetchMovements();
  }, [status]);

  if (status === 'loading') {
    return <div className="p-8 text-center">Cargando sesiÃ³n y movimientos...</div>;
  }
  if (status === 'unauthenticated') {
    return <div className="p-8 text-center text-red-600">Acceso denegado. Por favor, inicie sesiÃ³n.</div>;
  }

  const handleMovementSaved = () => {
    setIsModalOpen(false);
    fetchMovements();
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">GestiÃ³n de Ingresos y Egresos</CardTitle>
          {isAdmin && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Cargando datos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow
                    key={movement.id}
                    className={movement.type === 'INCOME' ? 'bg-green-50/70 hover:bg-green-100' : 'bg-red-50/70 hover:bg-red-100'}
                  >
                    <TableCell className="font-medium">{movement.type === 'INCOME' ? 'Ingreso' : 'Egreso'}</TableCell>
                    <TableCell>{movement.concept}</TableCell>
                    <TableCell className={	ext-right font-semibold }>
                      
                    </TableCell>
                    <TableCell>{new Date(movement.date).toLocaleDateString()}</TableCell>
                    <TableCell>{movement.user?.name}</TableCell>
                  </TableRow>
                ))}
                {movements.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No hay movimientos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isModalOpen && <MovementForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleMovementSaved} />}
    </div>
  );
};

export default MovementsPage;
// ...existing code...

