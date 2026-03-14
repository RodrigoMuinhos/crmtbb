import React, { useMemo, useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge
} from '@/app/components/brownie-bee';
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Calendar,
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Relatorios() {
  const { orders, products } = useApp();
  const today = new Date().toISOString().split('T')[0];
  
  // View mode selector
  type ViewMode = 'dia' | 'semana' | 'mes' | 'ano';
  const [viewMode, setViewMode] = useState<ViewMode>('mes');
  
  // Month selector state - Start with January 2026 (has full 31 days of data)
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // January
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  const currentMonth = selectedMonth;
  const currentYear = selectedYear;
  
  // Get filtered orders based on view mode
  const filteredOrders = useMemo(() => {
    const now = new Date();
    
    switch (viewMode) {
      case 'dia':
        return orders.filter(o => o.date === today);
      
      case 'semana':
        // Current week (last 7 days)
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orders.filter(o => {
          const orderDate = new Date(o.date);
          return orderDate >= weekAgo && orderDate <= now;
        });
      
      case 'mes':
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getMonth() === currentMonth && 
                 orderDate.getFullYear() === currentYear;
        });
      
      case 'ano':
        return orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate.getFullYear() === currentYear;
        });
      
      default:
        return orders;
    }
  }, [orders, viewMode, today, currentMonth, currentYear]);
  
  // Get period label
  const getPeriodLabel = () => {
    switch (viewMode) {
      case 'dia':
        return `Hoje - ${new Date().toLocaleDateString('pt-BR')}`;
      case 'semana':
        return 'Últimos 7 dias';
      case 'mes':
        return new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      case 'ano':
        return `Ano de ${currentYear}`;
      default:
        return '';
    }
  };
  
  // Navigation functions
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  const monthOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });
  }, [orders, currentMonth, currentYear]);
  
  const todayOrders = useMemo(() => {
    return orders.filter(o => o.date === today);
  }, [orders, today]);

  // Calculate product sales based on filtered orders
  const filteredProductSales = useMemo(() => {
    const salesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = salesMap.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.quantity * item.price;
        } else {
          salesMap.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.quantity * item.price
          });
        }
      });
    });
    
    return Array.from(salesMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Daily sales for current month
  const dailySales = useMemo(() => {
    const salesByDay = new Map<string, number>();
    
    monthOrders.forEach(order => {
      const day = new Date(order.date).getDate();
      const dayKey = `${day}`;
      salesByDay.set(dayKey, (salesByDay.get(dayKey) || 0) + order.total);
    });
    
    // Generate all days of month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      data.push({
        day: i,
        valor: salesByDay.get(`${i}`) || 0
      });
    }
    
    return data;
  }, [monthOrders, currentMonth, currentYear]);

  // Best selling day of month
  const bestDay = useMemo(() => {
    let maxDay = { day: 0, value: 0 };
    dailySales.forEach(item => {
      if (item.valor > maxDay.value) {
        maxDay = { day: item.day, value: item.valor };
      }
    });
    return maxDay;
  }, [dailySales]);

  // Top products data for pie chart
  const topProductsChart = useMemo(() => {
    return filteredProductSales.slice(0, 3);
  }, [filteredProductSales]);

  // Best day of week analysis
  const dayOfWeekAnalysis = useMemo(() => {
    const weekdayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const weekdayData = new Map<number, { revenue: number; orders: number }>();
    
    // Initialize all days
    for (let i = 0; i < 7; i++) {
      weekdayData.set(i, { revenue: 0, orders: 0 });
    }
    
    // Aggregate data
    monthOrders.forEach(order => {
      const dayOfWeek = new Date(order.date).getDay();
      const existing = weekdayData.get(dayOfWeek)!;
      existing.revenue += order.total;
      existing.orders += 1;
    });
    
    // Calculate averages and find best
    let bestRevenue = { day: 0, value: 0, name: '' };
    let bestFlow = { day: 0, value: 0, name: '' };
    
    weekdayData.forEach((data, dayNum) => {
      const daysCount = monthOrders.filter(o => new Date(o.date).getDay() === dayNum).length;
      const avgRevenue = daysCount > 0 ? data.revenue / daysCount : 0;
      const avgOrders = daysCount > 0 ? data.orders / daysCount : 0;
      
      if (avgRevenue > bestRevenue.value) {
        bestRevenue = { day: dayNum, value: avgRevenue, name: weekdayNames[dayNum] };
      }
      
      if (avgOrders > bestFlow.value) {
        bestFlow = { day: dayNum, value: avgOrders, name: weekdayNames[dayNum] };
      }
    });
    
    return { bestRevenue, bestFlow };
  }, [monthOrders]);

  const COLORS = ['#5A3A2E', '#D2A679', '#8B6F47', '#A67C52', '#C9B8A8'];

  // Calculate revenue and orders based on view mode
  const periodRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + order.total, 0);
  }, [filteredOrders]);

  const periodOrdersCount = filteredOrders.length;

  // Calculate average based on view mode
  const periodAverage = useMemo(() => {
    switch (viewMode) {
      case 'dia':
        // For day, show average order value
        return periodOrdersCount > 0 ? periodRevenue / periodOrdersCount : 0;
      case 'semana':
        // For week, show daily average (7 days)
        return periodRevenue / 7;
      case 'mes':
        // For month, show daily average
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        return periodRevenue / daysInMonth;
      case 'ano':
        // For year, show monthly average
        return periodRevenue / 12;
      default:
        return 0;
    }
  }, [viewMode, periodRevenue, periodOrdersCount, currentMonth, currentYear]);

  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

  const topProductMonth = filteredProductSales[0];
  const topProductToday = filteredProductSales[0];
  const leastProductsMonth = filteredProductSales.slice(-3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Dashboard de Vendas</h1>
          <p className="text-[var(--brand-text-secondary)] text-sm mt-1">
            Análise completa do desempenho de vendas
          </p>
        </div>
        <button
          data-tour="relatorios-primary-action"
          className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--brand-primary)] hover:bg-[var(--brand-bg)] rounded-[var(--radius-button)] transition-colors"
          onClick={() => window.print()}
        >
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* View Mode Selector */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('dia')}
                className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-colors ${
                  viewMode === 'dia'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-bg)]'
                }`}
              >
                Dia
              </button>
              <button
                onClick={() => setViewMode('semana')}
                className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-colors ${
                  viewMode === 'semana'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-bg)]'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('mes')}
                className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-colors ${
                  viewMode === 'mes'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-bg)]'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setViewMode('ano')}
                className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-colors ${
                  viewMode === 'ano'
                    ? 'bg-[var(--brand-primary)] text-white'
                    : 'bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-bg)]'
                }`}
              >
                Ano
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              {viewMode === 'mes' && (
                <>
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-[var(--brand-bg)] rounded-[var(--radius-button)] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-[var(--brand-primary)]" />
                  </button>
                  <span className="text-sm font-medium text-[var(--brand-text-primary)] min-w-[150px] text-center">
                    {getPeriodLabel()}
                  </span>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-[var(--brand-bg)] rounded-[var(--radius-button)] transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-[var(--brand-primary)]" />
                  </button>
                </>
              )}
              {viewMode !== 'mes' && (
                <span className="text-sm font-medium text-[var(--brand-text-primary)]">
                  {getPeriodLabel()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--brand-text-secondary)] mb-1">
                  {viewMode === 'dia' && 'Vendas Hoje'}
                  {viewMode === 'semana' && 'Vendas na Semana'}
                  {viewMode === 'mes' && 'Vendas no Mês'}
                  {viewMode === 'ano' && 'Vendas no Ano'}
                </p>
                <p className="text-2xl font-bold text-[var(--brand-primary)]">
                  R$ {periodRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  {periodOrdersCount} pedidos
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--brand-bg)] rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--brand-text-secondary)] mb-1">
                  {viewMode === 'dia' && 'Ticket Médio'}
                  {viewMode === 'semana' && 'Média Diária'}
                  {viewMode === 'mes' && 'Média Diária'}
                  {viewMode === 'ano' && 'Média Mensal'}
                </p>
                <p className="text-2xl font-bold text-[var(--brand-primary)]">
                  R$ {periodAverage.toFixed(2)}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  {viewMode === 'dia' && 'Por pedido'}
                  {viewMode === 'semana' && '7 dias'}
                  {viewMode === 'mes' && `${new Date(currentYear, currentMonth + 1, 0).getDate()} dias`}
                  {viewMode === 'ano' && '12 meses'}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--brand-bg)] rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--brand-text-secondary)] mb-1">
                  Total de Pedidos
                </p>
                <p className="text-2xl font-bold text-[var(--brand-primary)]">
                  {periodOrdersCount}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  {getPeriodLabel()}
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--brand-bg)] rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day of Week Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--brand-text-secondary)] mb-1">
                  Dia da Semana Campeão 🏆
                </p>
                <p className="text-2xl font-bold text-[var(--brand-primary)]">
                  {dayOfWeekAnalysis.bestRevenue.name}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  Média: R$ {dayOfWeekAnalysis.bestRevenue.value.toFixed(2)}/dia
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--brand-bg)] rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--brand-text-secondary)] mb-1">
                  Dia com Mais Fluxo 📊
                </p>
                <p className="text-2xl font-bold text-[var(--brand-primary)]">
                  {dayOfWeekAnalysis.bestFlow.name}
                </p>
                <p className="text-xs text-[var(--brand-text-secondary)] mt-1">
                  Média: {dayOfWeekAnalysis.bestFlow.value.toFixed(0)} pedidos/dia
                </p>
              </div>
              <div className="w-12 h-12 bg-[var(--brand-bg)] rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[var(--brand-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--brand-primary)]" />
              <CardTitle>Mais Vendidos Hoje</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topProductToday ? (
              <div className="space-y-3">
                <div className="p-4 bg-[var(--brand-bg)] rounded-lg border-2 border-[var(--brand-primary)]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--brand-text-primary)]">
                        {topProductToday.name}
                      </h4>
                      <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
                        {topProductToday.quantity} unidades vendidas
                      </p>
                    </div>
                    <Badge status="success">🏆 #1</Badge>
                  </div>
                  <div className="text-lg font-semibold text-[var(--brand-primary)]">
                    R$ {topProductToday.revenue.toFixed(2)}
                  </div>
                </div>
                
                {filteredProductSales.slice(1, 3).map((product, index) => (
                  <div key={`top-today-${product.name}-${index}`} className="flex items-center justify-between p-3 bg-[var(--brand-surface)] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[var(--brand-text-primary)]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[var(--brand-text-secondary)]">
                        {product.quantity} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge status="info">#{index + 2}</Badge>
                      <p className="text-sm font-medium text-[var(--brand-primary)] mt-1">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--brand-text-secondary)] py-8">
                Nenhuma venda hoje
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--brand-primary)]" />
              <CardTitle>Mais Vendidos no Mês</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {topProductMonth ? (
              <div className="space-y-3">
                <div className="p-4 bg-[var(--brand-bg)] rounded-lg border-2 border-[var(--brand-primary)]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--brand-text-primary)]">
                        {topProductMonth.name}
                      </h4>
                      <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
                        {topProductMonth.quantity} unidades vendidas
                      </p>
                    </div>
                    <Badge status="success">🏆 #1</Badge>
                  </div>
                  <div className="text-lg font-semibold text-[var(--brand-primary)]">
                    R$ {topProductMonth.revenue.toFixed(2)}
                  </div>
                </div>
                
                {filteredProductSales.slice(1, 3).map((product, index) => (
                  <div key={`top-month-${product.name}-${index}`} className="flex items-center justify-between p-3 bg-[var(--brand-surface)] rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[var(--brand-text-primary)]">
                        {product.name}
                      </p>
                      <p className="text-xs text-[var(--brand-text-secondary)]">
                        {product.quantity} unidades
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge status="info">#{index + 2}</Badge>
                      <p className="text-sm font-medium text-[var(--brand-primary)] mt-1">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--brand-text-secondary)] py-8">
                Nenhuma venda no mês
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Diárias do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis 
                  dataKey="day" 
                  stroke="#5A3A2E"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#5A3A2E"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #D2A679',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Vendas']}
                  labelFormatter={(label) => `Dia ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#5A3A2E" 
                  strokeWidth={2}
                  dot={{ fill: '#D2A679', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {bestDay.day > 0 && (
              <div className="mt-4 p-3 bg-[var(--brand-bg)] rounded-lg">
                <p className="text-sm text-[var(--brand-text-secondary)] mb-1">
                  Melhor dia do mês
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-[var(--brand-text-primary)]">
                    Dia {bestDay.day} de {new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long' })}
                  </p>
                  <p className="text-lg font-semibold text-[var(--brand-primary)]">
                    R$ {bestDay.value.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Vendas - Top 3</CardTitle>
          </CardHeader>
          <CardContent>
            {topProductsChart.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={topProductsChart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${monthRevenue > 0 ? ((entry.revenue / monthRevenue) * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {topProductsChart.map((entry, index) => (
                        <Cell key={`pie-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="mt-4 space-y-2">
                  {topProductsChart.map((product, index) => (
                    <div key={`pie-legend-${product.name}-${index}`} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-[var(--brand-text-primary)] flex-1">
                        {product.name}
                      </span>
                      <span className="text-sm font-medium text-[var(--brand-primary)]">
                        R$ {product.revenue.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-[var(--brand-text-secondary)] py-8">
                Sem dados suficientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Least Sold Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[var(--status-warning)]" />
            <CardTitle>Produtos com Menos Vendas no Mês</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {leastProductsMonth.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leastProductsMonth.map((product, index) => (
                <div 
                  key={`least-sold-${product.name}-${index}`}
                  className="p-4 bg-[var(--status-warning)] rounded-lg"
                >
                  <p className="font-medium text-[var(--brand-text-primary)] mb-2">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--brand-text-secondary)]">
                      {product.quantity} unidades
                    </p>
                    <p className="font-semibold text-[var(--brand-primary)]">
                      R$ {product.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[var(--brand-text-secondary)] py-8">
              Nenhum dado disponível
            </p>
          )}
        </CardContent>
      </Card>

      {/* Comparative Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comparativo - Top 10 Produtos do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredProductSales.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="name" 
                stroke="#5A3A2E"
                style={{ fontSize: '11px' }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="#5A3A2E"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #D2A679',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Faturamento']}
              />
              <Bar 
                dataKey="revenue" 
                fill="#5A3A2E" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}