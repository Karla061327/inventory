import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import { productsApi } from '../../api/products.api';
import { alertsApi } from '../../api/alerts.api';
import { useAuth } from '../../context/AuthContext';
import type { CreateInventoryEntryDto, Product } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { Loader2, PackagePlus, Lock } from 'lucide-react';

export default function StockEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canEdit = user && ['admin', 'manager'].includes(user.role);

  const [formData, setFormData] = useState<CreateInventoryEntryDto>({
    productId: 0,
    quantity: 1,
    referenceDoc: '',
    notes: '',
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const entryMutation = useMutation({
    mutationFn: (data: CreateInventoryEntryDto) => inventoryApi.createEntry(data),
    onSuccess: async (movement) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });

      // Crear alerta de notificación
      try {
        await alertsApi.create({
          productId: formData.productId,
          alertType: 'discrepancy',
          notes: `Entrada de inventario: +${formData.quantity} unidades. Stock actual: ${movement.stockAfter}`,
        });
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
      } catch {
        // Las alertas son opcionales
      }

      toast.success(
        `Entrada registrada: +${formData.quantity} unidades. Stock actual: ${movement.stockAfter}`
      );
      resetForm();
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al registrar la entrada');
    },
  });

  const resetForm = () => {
    setFormData({
      productId: 0,
      quantity: 1,
      referenceDoc: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) {
      toast.error('Seleccione un producto');
      return;
    }
    entryMutation.mutate(formData);
  };

  const products = productsData?.data || [];
  const selectedProduct = products.find((p) => p.id === formData.productId);

  if (!canEdit) {
    return (
      <Card className="border-red-500">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Lock className="h-16 w-16 text-red-500 mb-4" />
          <CardTitle className="text-xl mb-2 text-red-500">Acceso Restringido</CardTitle>
          <p className="text-muted-foreground text-center">
            Solo los administradores y gerentes pueden registrar entradas de inventario.
          </p>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5" />
            Registrar Entrada de Stock
          </CardTitle>
          <CardDescription>
            Registre la entrada de productos al inventario (compras, devoluciones, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Producto *</Label>
              <Select
                value={formData.productId ? formData.productId.toString() : ''}
                onValueChange={(value) =>
                  setFormData({ ...formData, productId: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {loadingProducts ? (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  ) : (
                    products.map((product: Product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.sku} - {product.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="bg-muted p-4 rounded-lg space-y-1">
                <p className="text-sm">
                  <strong>Producto:</strong> {selectedProduct.name}
                </p>
                <p className="text-sm">
                  <strong>SKU:</strong> {selectedProduct.sku}
                </p>
                <p className="text-sm">
                  <strong>Costo:</strong> ${Number(selectedProduct.costPrice).toFixed(2)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceDoc">Documento de Referencia</Label>
              <Input
                id="referenceDoc"
                value={formData.referenceDoc}
                onChange={(e) => setFormData({ ...formData, referenceDoc: e.target.value })}
                placeholder="Ej: ORD-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observaciones adicionales"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpiar
              </Button>
              <Button type="submit" disabled={entryMutation.isPending || !formData.productId}>
                {entryMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Entrada
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
