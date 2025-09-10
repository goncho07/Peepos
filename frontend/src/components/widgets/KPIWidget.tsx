import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Widget, KPIWidgetData } from '../../types/widgets';
import BaseWidget from './BaseWidget';

interface KPIWidgetProps {
  widget: Widget;
  data: KPIWidgetData;
  onRemove?: (widgetId: string) => void;
  onEdit?: (widget: Widget) => void;
  isEditing?: boolean;
}

const KPIWidget: React.FC<KPIWidgetProps> = ({
  widget,
  data,
  onRemove,
  onEdit,
  isEditing = false
}) => {
  const getChangeIcon = () => {
    if (!data.change) return null;
    
    switch (data.change.type) {
      case 'increase':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'decrease':
        return <TrendingDown className="text-red-500" size={16} />;
      default:
        return <Minus className="text-gray-500" size={16} />;
    }
  };

  const getChangeColor = () => {
    if (!data.change) return 'text-gray-500';
    
    switch (data.change.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <BaseWidget
      widget={widget}
      onRemove={onRemove}
      onEdit={onEdit}
      isEditing={isEditing}
      className={`${data.color || 'bg-gradient-to-br from-blue-500 to-blue-600'} text-white`}
    >
      <div className="flex flex-col justify-between h-full relative">
        {/* Icon Background */}
        {data.icon && (
          <div className="absolute -right-4 -top-4 text-white/10">
            <div className="text-6xl">
              {/* Aquí se renderizaría el icono basado en data.icon */}
              <div className="w-16 h-16 bg-white/10 rounded-full" />
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-white/90 font-medium text-sm mb-2">
              {data.label}
            </p>
            <p className="text-3xl font-bold mb-1">
              {formatValue(data.value)}
            </p>
          </motion.div>
        </div>
        
        {/* Change Indicator */}
        {data.change && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative z-10 flex items-center gap-2"
          >
            <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
              {getChangeIcon()}
              <span className="text-xs font-semibold">
                {data.change.value > 0 ? '+' : ''}{data.change.value}%
              </span>
            </div>
            <span className="text-xs text-white/80">
              {data.change.period}
            </span>
          </motion.div>
        )}
      </div>
    </BaseWidget>
  );
};

export default KPIWidget;