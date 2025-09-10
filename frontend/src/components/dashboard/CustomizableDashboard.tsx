import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Settings, 
  Save, 
  RotateCcw, 
  Grid3X3, 
  Layout,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  Widget, 
  DashboardLayout, 
  WidgetType,
  KPIWidgetData,
  ChartWidgetData,
  TaskWidgetData,
  NotificationWidgetData,
  QuickActionWidgetData
} from '../../types/widgets';
import BaseWidget from '../widgets/BaseWidget';
import KPIWidget from '../widgets/KPIWidget';
import ChartWidget from '../widgets/ChartWidget';
import TaskWidget from '../widgets/TaskWidget';
import NotificationWidget from '../widgets/NotificationWidget';
import QuickActionsWidget from '../widgets/QuickActionsWidget';

interface CustomizableDashboardProps {
  userRole: string;
  userId: string;
  onLayoutSave?: (layout: DashboardLayout) => void;
  initialLayout?: DashboardLayout;
}

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({
  userRole,
  userId,
  onLayoutSave,
  initialLayout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showGrid, setShowGrid] = useState(false);

  // Sample data for widgets
  const sampleKPIData: KPIWidgetData = {
    label: 'Estudiantes Activos',
    value: 1247,
    change: { type: 'increase', value: 12, period: 'vs mes anterior' },
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    icon: 'users'
  };

  const sampleChartData: ChartWidgetData = {
    type: 'line',
    data: [
      { name: 'Ene', estudiantes: 1200, profesores: 45 },
      { name: 'Feb', estudiantes: 1180, profesores: 47 },
      { name: 'Mar', estudiantes: 1220, profesores: 46 },
      { name: 'Abr', estudiantes: 1247, profesores: 48 }
    ]
  };

  const sampleTaskData: TaskWidgetData = {
    tasks: [
      {
        id: '1',
        title: 'Revisar calificaciones',
        status: 'pending',
        completed: false,
        priority: 'high',
        dueDate: new Date('2024-01-15'),
        assignee: 'Prof. García'
      },
      {
        id: '2',
        title: 'Preparar reunión padres',
        status: 'completed',
        completed: true,
        priority: 'medium',
        dueDate: new Date('2024-01-10'),
        assignee: 'Dir. López'
      }
    ]
  };

  const sampleNotificationData: NotificationWidgetData = {
    notifications: [
      {
        id: '1',
        title: 'Nueva matrícula',
        message: 'Se ha registrado una nueva matrícula para el grado 3°A',
        type: 'info',
        timestamp: new Date(),
        read: false
      },
      {
        id: '2',
        title: 'Pago pendiente',
        message: 'El estudiante Juan Pérez tiene un pago pendiente',
        type: 'warning',
        timestamp: new Date(Date.now() - 3600000),
        read: true
      }
    ]
  };

  const sampleQuickActionsData: QuickActionWidgetData = {
    actions: [
      { id: '1', label: 'Nueva Matrícula', icon: 'Plus', action: '/matricula/nueva', color: 'blue' },
      { id: '2', label: 'Tomar Asistencia', icon: 'QrCode', action: '/asistencia', color: 'green' },
      { id: '3', label: 'Enviar Mensaje', icon: 'MessageSquare', action: '/comunicaciones', color: 'purple' },
      { id: '4', label: 'Ver Reportes', icon: 'BarChart3', action: '/reportes', color: 'indigo' }
    ]
  };

  useEffect(() => {
    if (initialLayout) {
      setWidgets(initialLayout.widgets);
    } else {
      // Load default widgets based on user role
      loadDefaultWidgets();
    }
  }, [userRole, initialLayout]);

  const loadDefaultWidgets = () => {
    const defaultWidgets: Widget[] = [
      {
        id: 'kpi-1',
        type: 'kpi',
        title: 'Estudiantes Activos',
        position: { x: 0, y: 0, width: 300, height: 150 },
        config: { refreshInterval: 300000, displayOptions: { showHeader: true } },
        isVisible: true
      },
      {
        id: 'chart-1',
        type: 'chart',
        title: 'Tendencia de Matrículas',
        position: { x: 320, y: 0, width: 400, height: 300 },
        config: { refreshInterval: 600000, displayOptions: { showHeader: true } },
        isVisible: true
      },
      {
        id: 'tasks-1',
        type: 'tasks',
        title: 'Tareas Pendientes',
        position: { x: 0, y: 170, width: 300, height: 350 },
        config: { refreshInterval: 60000, displayOptions: { showHeader: true } },
        isVisible: true
      },
      {
        id: 'notifications-1',
        type: 'notifications',
        title: 'Notificaciones',
        position: { x: 740, y: 0, width: 300, height: 400 },
        config: { refreshInterval: 30000, displayOptions: { showHeader: true } },
        isVisible: true
      },
      {
        id: 'actions-1',
        type: 'quick-actions',
        title: 'Acciones Rápidas',
        position: { x: 320, y: 320, width: 400, height: 200 },
        config: { refreshInterval: 0, displayOptions: { showHeader: true } },
        isVisible: true
      }
    ];
    
    setWidgets(defaultWidgets);
  };

  const handleAddWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: `${type}-${Date.now()}`,
      type,
      title: `Nuevo ${type}`,
      position: { x: 0, y: 0, width: 300, height: 200 },
      config: { refreshInterval: 300000, displayOptions: { showHeader: true } },
      isVisible: true
    };
    
    setWidgets(prev => [...prev, newWidget]);
    setShowAddMenu(false);
  };

  const getSampleDataForType = (type: WidgetType) => {
    switch (type) {
      case 'kpi':
        return sampleKPIData;
      case 'chart':
        return sampleChartData;
      case 'tasks':
        return sampleTaskData;
      case 'notifications':
        return sampleNotificationData;
      case 'quick-actions':
        return sampleQuickActionsData;
      default:
        return {};
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };

  const handleEditWidget = (widget: Widget) => {
    console.log('Edit widget:', widget);
    // Implement widget editing logic
  };

  const handleSaveLayout = () => {
    const layout: DashboardLayout = {
      id: `layout-${userId}`,
      userId,
      userRole,
      name: `Dashboard ${userRole}`,
      widgets,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (onLayoutSave) {
      onLayoutSave(layout);
    }
    
    setIsEditing(false);
  };

  const handleResetLayout = () => {
    loadDefaultWidgets();
  };

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      widget,
      onRemove: handleRemoveWidget,
      onEdit: handleEditWidget,
      isEditing
    };

    switch (widget.type) {
      case 'kpi':
        return <KPIWidget {...commonProps} data={sampleKPIData} />;
      case 'chart':
        return <ChartWidget {...commonProps} data={sampleChartData} />;
      case 'tasks':
        return <TaskWidget {...commonProps} data={sampleTaskData} />;
      case 'notifications':
        return <NotificationWidget {...commonProps} data={sampleNotificationData} />;
      case 'quick-actions':
        return <QuickActionsWidget {...commonProps} data={sampleQuickActionsData} />;
      default:
        return (
          <BaseWidget {...commonProps}>
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Widget no soportado: {widget.type}</p>
            </div>
          </BaseWidget>
        );
    }
  };

  const getGridClass = () => {
    switch (gridSize) {
      case 'small':
        return 'grid-cols-6';
      case 'large':
        return 'grid-cols-2';
      default:
        return 'grid-cols-4';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard {userRole}
          </h1>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg transition-colors ${
                showGrid 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title={showGrid ? 'Ocultar grilla' : 'Mostrar grilla'}
            >
              {showGrid ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            
            <select
              value={gridSize}
              onChange={(e) => setGridSize(e.target.value as 'small' | 'medium' | 'large')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg"
            >
              <option value="small">Grilla pequeña</option>
              <option value="medium">Grilla mediana</option>
              <option value="large">Grilla grande</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleResetLayout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RotateCcw size={16} />
                Restablecer
              </button>
              
              <button
                onClick={handleSaveLayout}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                Guardar
              </button>
              
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Agregar Widget
                </button>
                
                {showAddMenu && (
                  <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                    <button
                      onClick={() => handleAddWidget('kpi')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      📊 Widget KPI
                    </button>
                    <button
                      onClick={() => handleAddWidget('chart')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      📈 Widget Gráfico
                    </button>
                    <button
                      onClick={() => handleAddWidget('tasks')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      ✅ Widget Tareas
                    </button>
                    <button
                      onClick={() => handleAddWidget('notifications')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      🔔 Widget Notificaciones
                    </button>
                    <button
                      onClick={() => handleAddWidget('quick-actions')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      ⚡ Widget Acciones Rápidas
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings size={16} />
                Personalizar
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div 
          className={`
            relative grid gap-6 auto-rows-min
            ${getGridClass()}
            ${showGrid ? 'bg-grid-pattern' : ''}
          `}
          style={{
            backgroundImage: showGrid 
              ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)'
              : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto'
          }}
        >
          <AnimatePresence>
            {widgets.map((widget) => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {renderWidget(widget)}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {widgets.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
              <Layout size={64} className="mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Dashboard vacío</h3>
              <p className="text-sm text-center mb-4">
                Agrega widgets para personalizar tu dashboard
              </p>
              <button
                onClick={() => setShowAddMenu(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Agregar primer widget
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomizableDashboard;