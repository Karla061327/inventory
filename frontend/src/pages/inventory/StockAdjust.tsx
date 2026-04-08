import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import { productsApi } from '../../api/products.api';
import { alertsApi } from '../../api/alerts.api';
import { useAuth } from '../../context/AuthContext';
import type { CreateInventoryAdjustmentDto, Product } from '../../types';
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
import { Loader2, RefreshCw, Lock, AlertTriangle } from 'lucide-react';

export default function StockAdjust() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canEdit = user && ['admin', 'manager'].includes(user.role);

  const [formData, setFormData] = useState<CreateInventoryAdjustmentDto>({
    productId: 0,
    newQuantity: 0,
    reason: '',
    imageUrl: '',
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryApi.getAll(),
  });

  const adjustMutation = useMutation({
    mutationFn: (data: CreateInventoryAdjustmentDto) => inventoryApi.createAdjustment(data),
    onSuccess: async (movement) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });

      // Crear alerta de notificación
      try {
        await alertsApi.create({
          productId: formData.productId,
          alertType: 'discrepancy',
          notes: `Ajuste de inventario: ${movement.stockBefore} → ${movement.stockAfter} unidades. Razon: ${formData.reason}`,
        });
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
      } catch {
        // Las alertas son opcionales
      }

      toast.success(
        `Ajuste registrado: ${movement.stockBefore} → ${movement.stockAfter} unidades`
      );
      resetForm();
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al registrar el ajuste');
    },
  });

  const resetForm = () => {
    setFormData({
      productId: 0,
      newQuantity: 0,
      reason: '',
      imageUrl: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) {
      toast.error('Seleccione un producto');
      return;
    }
    if (!formData.reason) {
      toast.error('Ingrese una razon para el ajuste');
      return;
    }

    // Validar si se requiere imagen (ajuste > 10%)
    if (requiresImage && !formData.imageUrl) {
      toast.error('Los ajustes mayores al 10% requieren evidencia fotografica');
      return;
    }

    adjustMutation.mutate(formData);
  };

  const products = productsData?.data || [];
  const inventory = inventoryData?.data || [];
  const selectedProduct = products.find((p) => p.id === formData.productId);
  const currentStock = inventory.find((i) => i.productId === formData.productId)?.currentStock || 0;

  const difference = formData.newQuantity - currentStock;
  const percentChange = currentStock > 0 ? Math.abs(difference / currentStock) * 100 : 100;
  const requiresImage = percentChange > 10;

  if (!canEdit) {
    return (
      <Card className="border-red-500">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Lock className="h-16 w-16 text-red-500 mb-4" />
          <CardTitle className="text-xl mb-2 text-red-500">Acceso Restringido</CardTitle>
          <p className="text-muted-foreground text-center">
            Solo los administradores y gerentes pueden realizar ajustes de inventario.
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
            <RefreshCw className="h-5 w-5" />
            Ajuste de Inventario
          </CardTitle>
          <CardDescription>
            Ajuste el stock de un producto despues de un conteo fisico o correccion
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
                  <strong>Stock Actual en Sistema:</strong>{' '}
                  <span className="font-bold">{currentStock} unidades</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newQuantity">Nueva Cantidad (Conteo Fisico) *</Label>
              <Input
                id="newQuantity"
                type="number"
                min="0"
                value={formData.newQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, newQuantity: parseInt(e.target.value) || 0 })
                }
                required
              />
              {formData.productId > 0 && (
                <div className="text-sm">
                  <span
                    className={
                      difference > 0
                        ? 'text-green-600'
                        : difference < 0
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    }
                  >
                    Diferencia: {difference > 0 ? '+' : ''}
                    {difference} unidades
                    {percentChange > 0 && ` (${percentChange.toFixed(1)}%)`}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Razon del Ajuste *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej: Conteo fisico de inventario"
                required
              />
            </div>

            {requiresImage && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-yellow-600 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Ajuste mayor al 10% - Se requiere evidencia
                  </span>
                </div>
                <Label htmlFor="imageUrl">URL de Evidencia Fotografica *</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="URL de la imagen de evidencia"
                  required={requiresImage}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Limpiar
              </Button>
              <Button
                type="submit"
                disabled={adjustMutation.isPending || !formData.productId || !formData.reason}
              >
                {adjustMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Ajuste
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
