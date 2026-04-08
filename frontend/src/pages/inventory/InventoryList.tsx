import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import { useAuth } from '../../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Package, AlertTriangle, TrendingDown, DollarSign, Search } from 'lucide-react';

export default function InventoryList() {
  const { user } = useAuth();
  const [lowStockThreshold, setLowStockThreshold] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryApi.getAll(),
  });

  const inventory = inventoryData?.data || [];
  const summary = inventoryData?.summary;

  const filteredInventory = inventory.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.product?.name.toLowerCase().includes(search) ||
      item.product?.sku.toLowerCase().includes(search)
    );
  });

  const getStockBadge = (currentStock: number, reorderPoint: number) => {
    if (currentStock === 0) {
      return <Badge variant="destructive">Sin Stock</Badge>;
    }
    if (currentStock <= reorderPoint) {
      return <Badge className="bg-orange-500">Bajo</Badge>;
    }
    if (currentStock <= lowStockThreshold) {
      return <Badge className="bg-yellow-500">Alerta</Badge>;
    }
    return <Badge className="bg-green-500">Normal</Badge>;
  };

  const lowStockItems = filteredInventory.filter(
    (item) => item.currentStock <= lowStockThreshold && item.currentStock > 0
  );
  const outOfStockItems = filteredInventory.filter((item) => item.currentStock === 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalProducts || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(summary?.totalValue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Bajo umbral de {lowStockThreshold} unidades
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Configuracion de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Umbral de alerta de stock bajo</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 50)}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Productos con stock menor o igual a este valor se marcaran en alerta
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Buscar producto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de inventario */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Actual ({filteredInventory.length} productos)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay productos en el inventario</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">Punto Reorden</TableHead>
                  <TableHead className="text-right">Costo Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ultimo Mov.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const reorderPoint = item.product?.reorderPoint || 10;
                  const costPrice = Number(item.product?.costPrice || 0);
                  const totalValue = item.currentStock * costPrice;
                  const isLowStock = item.currentStock <= lowStockThreshold;

                  return (
                    <TableRow
                      key={item.id}
                      className={isLowStock ? 'bg-orange-50 dark:bg-orange-950/20' : ''}
                    >
                      <TableCell className="font-mono">{item.product?.sku}</TableCell>
                      <TableCell className="font-medium">{item.product?.name}</TableCell>
                      <TableCell>{item.product?.category?.name || '-'}</TableCell>
                      <TableCell className="text-right font-bold">
                        {item.currentStock}
                      </TableCell>
                      <TableCell className="text-right">{reorderPoint}</TableCell>
                      <TableCell className="text-right">
                        ${costPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${totalValue.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStockBadge(item.currentStock, reorderPoint)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {item.lastMovementAt
                          ? new Date(item.lastMovementAt).toLocaleDateString('es-ES')
                          : 'Sin movimientos'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info de permisos */}
      {user && !['admin', 'manager'].includes(user.role) && (
        <Card className="border-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <p>
                Solo los administradores y gerentes pueden realizar operaciones de inventario
                (entradas, salidas y ajustes).
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
