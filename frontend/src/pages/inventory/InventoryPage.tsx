import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InventoryList from './InventoryList';
import StockEntry from './StockEntry';
import StockExit from './StockExit';
import StockAdjust from './StockAdjust';
import Movements from './Movements';

export default function InventoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Inventario</h1>
      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock Actual</TabsTrigger>
          <TabsTrigger value="entry">Entrada</TabsTrigger>
          <TabsTrigger value="exit">Salida</TabsTrigger>
          <TabsTrigger value="adjust">Ajuste</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
        </TabsList>
        <TabsContent value="stock"><InventoryList /></TabsContent>
        <TabsContent value="entry"><StockEntry /></TabsContent>
        <TabsContent value="exit"><StockExit /></TabsContent>
        <TabsContent value="adjust"><StockAdjust /></TabsContent>
        <TabsContent value="movements"><Movements /></TabsContent>
      </Tabs>
    </div>
  );
}
