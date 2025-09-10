// Tipos para el sistema de widgets personalizables
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: WidgetConfig;
  isVisible: boolean;
  permissions?: string[];
}

export type WidgetType = 
  | 'kpi'
  | 'chart'
  | 'calendar'
  | 'tasks'
  | 'notifications'
  | 'quick-actions'
  | 'recent-activity'
  | 'weather'
  | 'announcements'
  | 'student-stats'
  | 'attendance-summary'
  | 'financial-overview';

export interface WidgetConfig {
  refreshInterval?: number; // en segundos
  dataSource?: string;
  filters?: Record<string, any>;
  displayOptions?: {
    showHeader?: boolean;
    showFooter?: boolean;
    theme?: 'light' | 'dark' | 'colored';
    size?: 'small' | 'medium' | 'large';
  };
  customSettings?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  userId: string;
  userRole: string;
  widgets: Widget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetData {
  id: string;
  data: any;
  lastUpdated: Date;
  error?: string;
}

// Configuraciones predefinidas por rol
export interface RoleWidgetTemplate {
  role: string;
  defaultWidgets: Omit<Widget, 'id'>[];
  availableWidgets: WidgetType[];
  restrictions?: {
    maxWidgets?: number;
    allowedTypes?: WidgetType[];
    readOnly?: boolean;
  };
}

// Datos específicos para cada tipo de widget
export interface KPIWidgetData {
  value: string | number;
  label: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon?: string;
  color?: string;
}

export interface ChartWidgetData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  xAxisKey?: string;
  series?: any[];
  colors?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignee?: string;
}

export interface TaskWidgetData {
  tasks: Task[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  sender?: string;
}

export interface NotificationWidgetData {
  notifications: Notification[];
}

export interface QuickActionWidgetData {
  actions: {
    id: string;
    label: string;
    icon: string;
    action: string;
    color?: string;
    permissions?: string[];
  }[];
}