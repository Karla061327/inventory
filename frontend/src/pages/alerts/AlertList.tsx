import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../../api/alerts.api';
import { inventoryApi } from '../../api/inventory.api';
import { useAuth } from '../../context/AuthContext';
import type { AlertType, MovementType } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  Loader2,
  Bell,
  BellOff,
  AlertTriangle,
  TrendingDown,
  Clock,
  CheckCircle,
  RefreshCw,
  Package,
  History,
  ArrowUp,
  ArrowDown,
  Activity,
} from 'lucide-react';

export default function AlertList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canResolve = user && ['admin', 'manager'].includes(user.role);

  // Estado para alertas
  const [filter, setFilter] = useState<{
    alertType: AlertType | '';
    isResolved: string;
  }>({
    alertType: '',
    isResolved: 'false',
  });

  const [selectedAlert, setSelectedAlert] = useState<number | null>(null);
  const [isResolveOpen, setIsResolveOpen] = useState(false);

  // Estado para movimientos
  const [movementFilter, setMovementFilter] = useState({
    movementType: '' as MovementType | '',
    startDate: '',
    endDate: '',
  });

  // Queries
  const { data: alertsData, isLoading: loadingAlerts, isError: alertsIsError, error: alertsError } = useQuery({
    queryKey: ['alerts', filter],
    queryFn: () =>
      alertsApi.getAll({
        alertType: filter.alertType || undefined,
        isResolved: filter.isResolved === '' ? undefined : filter.isResolved === 'true',
        limit: 100,
      }),
  });

  const { data: summary, isError: summaryIsError } = useQuery({
    queryKey: ['alerts-summary'],
    queryFn: () => alertsApi.getSummary(),
  });

  const { data: movementsData, isLoading: loadingMovements, isError: movementsIsError } = useQuery({
    queryKey: ['all-movements', movementFilter],
    queryFn: () =>
      inventoryApi.getMovements({
        movementType: movementFilter.movementType || undefined,
        startDate: movementFilter.startDate || undefined,
        endDate: movementFilter.endDate || undefined,
        limit: 100,
      }),
  });

  // Mutations
  const resolveMutation = useMutation({
    mutationFn: (id: number) => alertsApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-summary'] });
      toast.success('Alerta marcada como resuelta');
      setIsResolveOpen(false);
      setSelectedAlert(null);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al resolver la alerta');
    },
  });

  const checkMutation = useMutation({
    mutationFn: () => alertsApi.runCheck(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-summary'] });
      const total = result.lowStock.length + result.noMovement.length + result.slowMoving.length;
      if (total > 0) {
        toast.success(`Se detectaron ${total} nuevas alertas`);
      } else {
        toast.info('No se encontraron nuevas alertas');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al verificar alertas');
    },
  });

  const handleResolve = (alertId: number) => {
    setSelectedAlert(alertId);
    setIsResolveOpen(true);
  };

  const confirmResolve = () => {
    if (selectedAlert) {
      resolveMutation.mutate(selectedAlert);
    }
  };

  const getAlertTypeBadge = (type: AlertType) => {
    switch (type) {
      case 'low_stock':
        return (
          <Badge className="bg-orange-500">
            <TrendingDown className="h-3 w-3 mr-1" />
            Stock Bajo
          </Badge>
        );
      case 'no_movement':
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Sin Movimiento
          </Badge>
        );
      case 'slow_moving':
        return (
          <Badge className="bg-purple-500">
            <Clock className="h-3 w-3 mr-1" />
            Lento
          </Badge>
        );
      case 'discrepancy':
        return (
          <Badge className="bg-blue-500">
            <RefreshCw className="h-3 w-3 mr-1" />
            Cambio
          </Badge>
        );
      case 'inventory_update':
        return (
          <Badge className="bg-cyan-500">
            <Activity className="h-3 w-3 mr-1" />
            Mov. Inventario
          </Badge>
        );
      default:
        return <Badge>{type}</Badge>;
    }
  };

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

  const alerts = alertsData?.data || [];
  const movements = movementsData?.data || [];

  if (alertsIsError || summaryIsError || movementsIsError) {
    const errMsg = alertsError instanceof Error ? alertsError.message : String(alertsError ?? '');
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Alertas y Registro de Actividad</h1>
        <div className="rounded-md border border-red-400 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error al cargar las alertas</p>
          {errMsg && <p className="text-sm mt-1 font-mono">{errMsg}</p>}
          <p className="text-sm mt-1">
            {alertsIsError && 'Alertas: error · '}
            {summaryIsError && 'Resumen: error · '}
            {movementsIsError && 'Movimientos: error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Alertas y Registro de Actividad</h1>
        {canResolve && (
          <Button onClick={() => checkMutation.mutate()} disabled={checkMutation.isPending}>
            {checkMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Verificar Alertas
          </Button>
        )}
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Resolver</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{summary?.unresolved || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resueltas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary?.resolved || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {summary?.byType?.find((t) => t.type === 'low_stock')?.unresolved || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mov. Inventario</CardTitle>
            <Activity className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-500">
              {summary?.byType?.find((t) => t.type === 'inventory_update')?.total || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Alertas y Movimientos */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alertas ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial de Movimientos ({movements.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab de Alertas */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filtros de Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="alertType">Tipo de Alerta</Label>
                  <Select
                    value={filter.alertType || 'all'}
                    onValueChange={(value) =>
                      setFilter({ ...filter, alertType: (value === 'all' ? '' : value) as AlertType | '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="low_stock">Stock Bajo</SelectItem>
                      <SelectItem value="no_movement">Sin Movimiento</SelectItem>
                      <SelectItem value="slow_moving">Movimiento Lento</SelectItem>
                      <SelectItem value="discrepancy">Cambios/Discrepancia</SelectItem>
                      <SelectItem value="inventory_update">Movimiento de Inventario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isResolved">Estado</Label>
                  <Select
                    value={filter.isResolved || 'all'}
                    onValueChange={(value) => setFilter({ ...filter, isResolved: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="false">Sin Resolver</SelectItem>
                      <SelectItem value="true">Resueltas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {filter.isResolved === 'false' ? (
                  <Bell className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
                Alertas ({alerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAlerts ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <CardTitle className="text-xl mb-2">Sin alertas pendientes</CardTitle>
                  <p className="text-muted-foreground text-center">
                    {filter.isResolved === 'false'
                      ? 'No hay alertas sin resolver. El inventario esta en orden.'
                      : 'No se encontraron alertas con los filtros seleccionados.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Notas</TableHead>
                      <TableHead>Creada Por</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Resuelta Por</TableHead>
                      {canResolve && <TableHead className="text-right">Acciones</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow
                        key={alert.id}
                        className={!alert.isResolved ? 'bg-red-50 dark:bg-red-950/20' : ''}
                      >
                        <TableCell className="text-sm">{formatDate(alert.createdAt)}</TableCell>
                        <TableCell>{getAlertTypeBadge(alert.alertType)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{alert.product?.name || 'Producto'}</p>
                              <p className="text-xs text-muted-foreground">
                                {alert.product?.sku || `ID: ${alert.productId}`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate" title={alert.notes || ''}>
                          {alert.notes || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {alert.createdBy
                            ? `${alert.createdBy.firstName} ${alert.createdBy.lastName}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {alert.isResolved ? (
                            <Badge className="bg-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resuelta
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {alert.isResolved && alert.resolvedAt ? (
                            <div>
                              <p>
                                {alert.resolvedBy
                                  ? `${alert.resolvedBy.firstName} ${alert.resolvedBy.lastName}`
                                  : 'Usuario'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(alert.resolvedAt)}
                              </p>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        {canResolve && (
                          <TableCell className="text-right">
                            {!alert.isResolved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolve(alert.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolver
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Historial de Movimientos */}
        <TabsContent value="movements" className="space-y-4">
          {/* Filtros de Movimientos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Filtros de Movimientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="movementType">Tipo de Movimiento</Label>
                  <Select
                    value={movementFilter.movementType || 'all'}
                    onValueChange={(value) =>
                      setMovementFilter({ ...movementFilter, movementType: (value === 'all' ? '' : value) as MovementType | '' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
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
                    value={movementFilter.startDate}
                    onChange={(e) =>
                      setMovementFilter({ ...movementFilter, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={movementFilter.endDate}
                    onChange={(e) =>
                      setMovementFilter({ ...movementFilter, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Movimientos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Registro de Movimientos ({movements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMovements ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : movements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <History className="h-16 w-16 text-muted-foreground mb-4" />
                  <CardTitle className="text-xl mb-2">Sin movimientos registrados</CardTitle>
                  <p className="text-muted-foreground text-center">
                    No se encontraron movimientos con los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Antes</TableHead>
                      <TableHead className="text-right">Despues</TableHead>
                      <TableHead>Referencia</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm">{formatDate(movement.createdAt)}</TableCell>
                        <TableCell>{getMovementTypeBadge(movement.movementType)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{movement.product?.name}</p>
                            <p className="text-xs text-muted-foreground">{movement.product?.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              movement.movementType === 'entry'
                                ? 'text-green-600 font-bold'
                                : 'text-red-600 font-bold'
                            }
                          >
                            {movement.movementType === 'entry' ? '+' : '-'}
                            {Math.abs(movement.quantity)}
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
                        <TableCell className="text-sm max-w-xs truncate" title={movement.notes || ''}>
                          {movement.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmación para resolver */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
            <DialogDescription>
              Esta a punto de marcar esta alerta como resuelta. Esto indica que el problema ha sido
              atendido.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmResolve} disabled={resolveMutation.isPending}>
              {resolveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Marcar como Resuelta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
