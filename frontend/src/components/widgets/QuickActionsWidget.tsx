import React from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  BookCheck, 
  MessageSquare, 
  FileText, 
  Users, 
  Calendar,
  Settings,
  BarChart3,
  Plus
} from 'lucide-react';
import { Widget, QuickActionWidgetData } from '../../types/widgets';
import BaseWidget from './BaseWidget';
import { useNavigate } from 'react-router-dom';

interface QuickActionsWidgetProps {
  widget: Widget;
  data: QuickActionWidgetData;
  onRemove?: (widgetId: string) => void;
  onEdit?: (widget: Widget) => void;
  isEditing?: boolean;
}

const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  widget,
  data,
  onRemove,
  onEdit,
  isEditing = false
}) => {
  const navigate = useNavigate();

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      QrCode,
      BookCheck,
      MessageSquare,
      FileText,
      Users,
      Calendar,
      Settings,
      BarChart3,
      Plus
    };
    
    const IconComponent = icons[iconName] || Plus;
    return <IconComponent size={20} />;
  };

  const handleActionClick = (action: string) => {
    if (action.startsWith('/')) {
      navigate(action);
    } else {
      // Handle other types of actions (functions, external links, etc.)
      console.log('Executing action:', action);
    }
  };

  const getActionColor = (color?: string) => {
    const colorClasses: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: 'bg-green-100 text-green-700 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      red: 'bg-red-100 text-red-700 hover:bg-red-200',
      yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      pink: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
      gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    };
    
    return color ? colorClasses[color] || colorClasses.blue : colorClasses.blue;
  };

  return (
    <BaseWidget
      widget={widget}
      onRemove={onRemove}
      onEdit={onEdit}
      isEditing={isEditing}
    >
      <div className="h-full">
        <div className="grid grid-cols-2 gap-3 h-full">
          {data.actions.slice(0, 6).map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleActionClick(action.action)}
              className={`
                flex flex-col items-center justify-center p-3 rounded-lg
                transition-all duration-200 text-center
                ${getActionColor(action.color)}
                ${isEditing ? 'pointer-events-none' : ''}
              `}
              disabled={isEditing}
            >
              <div className="mb-2">
                {getIcon(action.icon)}
              </div>
              <span className="text-xs font-medium leading-tight">
                {action.label}
              </span>
            </motion.button>
          ))}
          
          {/* Add more actions button if there are more than 6 */}
          {data.actions.length > 6 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="
                flex flex-col items-center justify-center p-3 rounded-lg
                bg-gray-50 text-gray-600 hover:bg-gray-100
                transition-all duration-200 border-2 border-dashed border-gray-300
              "
            >
              <Plus size={20} className="mb-2" />
              <span className="text-xs font-medium">
                +{data.actions.length - 6} más
              </span>
            </motion.button>
          )}
        </div>
        
        {/* Footer with total actions count */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            {data.actions.length} acciones disponibles
          </p>
        </div>
      </div>
    </BaseWidget>
  );
};

export default QuickActionsWidget;