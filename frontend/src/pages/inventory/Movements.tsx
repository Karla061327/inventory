import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory.api';
import type { MovementType, InventoryMovement } from '../../types';
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
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Loader2,
  History,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  FileDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PAGE_SIZE = 100;

const MOVEMENT_LABELS: Record<MovementType, string> = {
  entry: 'Entrada',
  sale: 'Venta',
  adjustment: 'Ajuste',
  damaged: 'Dañado',
  loss: 'Pérdida',
};


export default function Movements() {
  const [filters, setFilters] = useState({
    movementType: '' as MovementType | '',
    startDate: '',
    endDate: '',
     userId: '',
  });
  const [page, setPage] = useState(1);

  const { data: movementsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['movements', filters.movementType, filters.startDate, filters.endDate],
    queryFn: () =>
      inventoryApi.getMovements({
        movementType: filters.movementType || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        limit: 100,
      }),
  });

  const allMovements: InventoryMovement[] = movementsData?.data || [];

   const uniqueUsers = useMemo(() => {
    const map = new Map<number, string>();
    allMovements.forEach((m) => {
      if (m.createdBy) {
        map.set(m.createdBy.id, `${m.createdBy.firstName} ${m.createdBy.lastName}`);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allMovements]);

  const filtered = useMemo(() => {
    if (!filters.userId) return allMovements;
    return allMovements.filter(
      (m) => m.createdBy && String(m.createdBy.id) === filters.userId
    );
  }, [allMovements, filters.userId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  

  const getMovementTypeBadge = (type: MovementType) => {
    const configs: Record<MovementType, { className: string; icon: React.ReactNode }> = {
      entry: { className: 'bg-green-500 hover:bg-green-600', icon: <ArrowUp className="h-3 w-3 mr-1" /> },
      sale: { className: 'bg-blue-500 hover:bg-blue-600', icon: <ArrowDown className="h-3 w-3 mr-1" /> },
      adjustment: { className: 'bg-purple-500 hover:bg-purple-600', icon: <RefreshCw className="h-3 w-3 mr-1" /> },
      damaged: { className: '', icon: <ArrowDown className="h-3 w-3 mr-1" /> },
      loss: { className: '', icon: <ArrowDown className="h-3 w-3 mr-1" /> },
    };
    const cfg = configs[type];
    return (
      <Badge
        className={cfg.className}
        variant={type === 'damaged' || type === 'loss' ? 'destructive' : 'default'}
      >
        {cfg.icon}
        {MOVEMENT_LABELS[type]}
      </Badge>
    );
  };

  const downloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(16);
    doc.text('Historial de Movimientos de Inventario', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 22);

    if (filters.startDate || filters.endDate || filters.movementType || filters.userId) {
      const parts: string[] = [];
      if (filters.startDate) parts.push(`Desde: ${filters.startDate}`);
      if (filters.endDate) parts.push(`Hasta: ${filters.endDate}`);
      if (filters.movementType) parts.push(`Tipo: ${MOVEMENT_LABELS[filters.movementType]}`);
      if (filters.userId) {
        const u = uniqueUsers.find((u) => String(u.id) === filters.userId);
        if (u) parts.push(`Usuario: ${u.name}`);
      }
      doc.text(`Filtros activos: ${parts.join(' | ')}`, 14, 28);
    }

    autoTable(doc, {
      startY: 34,
      head: [['Fecha', 'Producto', 'SKU', 'Tipo', 'Cantidad', 'Stock Anterior', 'Stock Posterior', 'Usuario', 'Motivo / Referencia']],
      body: filtered.map((m) => [
        formatDate(m.createdAt),
        m.product?.name ?? '-',
        m.product?.sku ?? '-',
        MOVEMENT_LABELS[m.movementType],
        m.movementType === 'entry' ? `+${m.quantity}` : String(m.quantity),
        String(m.stockBefore),
        String(m.stockAfter),
        m.createdBy ? `${m.createdBy.firstName} ${m.createdBy.lastName}` : '-',
        m.notes || m.referenceDoc || '-',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`movimientos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

   if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive font-medium">
          Error al cargar los movimientos:{' '}
          {(error as Error & { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
            (error as Error)?.message ||
            'Error desconocido'}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
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
            Filtros de búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Fecha inicio</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha fin</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de movimiento</Label>
              <Select
                value={filters.movementType || 'all'}
                onValueChange={(v) => handleFilterChange('movementType', v === 'all' ? '' : v as MovementType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="entry">Entrada</SelectItem>
                  <SelectItem value="sale">Venta</SelectItem>
                  <SelectItem value="adjustment">Ajuste</SelectItem>
                   <SelectItem value="damaged">Dañado</SelectItem>
                  <SelectItem value="loss">Pérdida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
             <Label>Usuario</Label>
              <Select
                value={filters.userId || 'all'}
                onValueChange={(v) => handleFilterChange('userId', v === 'all' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueUsers.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
            {(filters.startDate || filters.endDate || filters.movementType || filters.userId) && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters({ movementType: '', startDate: '', endDate: '', userId: '' });
                  setPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de movimientos */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle>
            Historial de Movimientos{' '}
            <span className="text-muted-foreground font-normal text-base">
              ({filtered.length} registro{filtered.length !== 1 ? 's' : ''})
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPdf}
              disabled={filtered.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </CardHeader>  
        <CardContent>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <History className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay movimientos registrados</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Cantidad</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Cant. Anterior</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Cant. Posterior</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Motivo / Referencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(movement.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{movement.product?.name ?? '-'}</p>
                            <p className="text-xs text-muted-foreground">{movement.product?.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getMovementTypeBadge(movement.movementType)}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              movement.movementType === 'entry'
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
                        <TableCell className="text-sm whitespace-nowrap">
                          {movement.createdBy
                            ? `${movement.createdBy.firstName} ${movement.createdBy.lastName}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {movement.notes || movement.referenceDoc || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <span>
                    Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de{' '}
                    {filtered.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
