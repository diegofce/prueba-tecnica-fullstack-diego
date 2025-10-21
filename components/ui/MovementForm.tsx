/// components/MovementForm.tsx
import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Función para recargar la lista de movimientos
}

// Interfaz para el estado del formulario
interface FormState {
  concept: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | '';
  date: string;
}

const MovementForm: React.FC<MovementFormProps> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState<FormState>({
    concept: '',
    amount: 0,
    type: '',
    date: new Date().toISOString().substring(0, 10), // Fecha actual en formato YYYY-MM-DD
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({
      ...prev,
      [id]: id === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setForm(prev => ({ ...prev, type: value as 'INCOME' | 'EXPENSE' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.concept || form.amount <= 0 || !form.type) {
      setError('Por favor, completa todos los campos correctamente.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        // Llama a onSave para cerrar el modal y recargar la lista de movimientos
        onSave(); 
      } else {
        const errorData = await res.json();
        // Si falla la verificación RBAC, mostrará el mensaje de "Acceso denegado"
        setError(errorData.message || 'Fallo al registrar el movimiento.'); 
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nuevo Ingreso o Egreso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            {/* Tipo (INCOME/EXPENSE) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Select onValueChange={handleSelectChange} value={form.type} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Ingreso</SelectItem>
                  <SelectItem value="EXPENSE">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Concepto */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="concept" className="text-right">Concepto</Label>
              <Input
                id="concept"
                value={form.concept}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            
            {/* Monto */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Monto ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount === 0 ? '' : form.amount} // Evita mostrar 0 por defecto
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Fecha */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Mensajes de Error */}
            {error && (
              <p className="text-center text-sm font-medium text-red-500 col-span-4 mt-2">{error}</p>
            )}

          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading} type="button">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Movimiento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovementForm;
