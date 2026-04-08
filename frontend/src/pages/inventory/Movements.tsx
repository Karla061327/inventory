import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { MovementType } from '../../types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Loader2, History, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

export default function Movements() {
  const [filters, setFilters] = useState({
    movementType: '' as MovementType | '',
    startDate: '',
    endDate: '',
  });

  const { data: movementsData, isLoading } = useQuery({
    queryKey: ['movements', filters],
    queryFn: () =>
      inventoryApi.getMovements({
        movementType: filters.movementType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: 100,
      }),
  });

  const movements = movementsData?.data || [];

  const getMovementTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'entry':
        return (
          <Badge className="bg-green-500">
            <ArrowUp className="h-3 w-3 mr-1" />
            Entrada
          </Badge>
        );
      case 'sale':
        return (
          <Badge className="bg-blue-500">
            <ArrowDown className="h-3 w-3 mr-1" />
            Venta
          </Badge>
        );
      case 'adjustment':
        return (
          <Badge className="bg-purple-500">
            <RefreshCw className="h-3 w-3 mr-1" />
            Ajuste
          </Badge>
        );
      case 'damaged':
        return (
          <Badge variant="destructive">
            <ArrowDown className="h-3 w-3 mr-1" />
            Danado
          </Badge>
        );
      case 'loss':
        return (
          <Badge variant="destructive">
            <ArrowDown className="h-3 w-3 mr-1" />
            Perdida
          </Badge>
        );
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="movementType">Tipo de Movimiento</Label>
              <Select
                value={filters.movementType}
                onValueChange={(value) =>
                  setFilters({ ...filters, movementType: value as MovementType | '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="entry">Entrada</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                  <SelectItem value="damaged">Danado</SelectItem>
                  <SelectItem value="loss">Perdida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos ({movements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <History className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay movimientos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Antes</TableHead>
                  <TableHead className="text-right">Despues</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-sm">{formatDate(movement.createdAt)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{movement.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{movement.product?.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getMovementTypeBadge(movement.movementType)}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          movement.movementType === 'entry' || movement.quantity > 0
                            ? 'text-green-600 font-bold'
                            : 'text-red-600 font-bold'
                        }
                      >
                        {movement.movementType === 'entry' ? '+' : ''}
                        {movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {movement.stockBefore}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {movement.stockAfter}
                    </TableCell>
                    <TableCell className="text-sm">{movement.referenceDoc || '-'}</TableCell>
                    <TableCell className="text-sm">
                      {movement.createdBy
                        ? `${movement.createdBy.firstName} ${movement.createdBy.lastName}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
