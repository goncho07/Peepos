import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, X, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Widget } from '../../types/widgets';

interface BaseWidgetProps {
  widget: Widget;
  children: React.ReactNode;
  onRemove?: (widgetId: string) => void;
  onEdit?: (widget: Widget) => void;
  onResize?: (widgetId: string, newSize: { width: number; height: number }) => void;
  isEditing?: boolean;
  className?: string;
}

const BaseWidget: React.FC<BaseWidgetProps> = ({
  widget,
  children,
  onRemove,
  onEdit,
  onResize,
  isEditing = false,
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRemove = () => {
    if (onRemove) {
      onRemove(widget.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(widget);
    }
    setIsMenuOpen(false);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onResize) {
      const newSize = isExpanded 
        ? { width: widget.position.width, height: widget.position.height }
        : { width: widget.position.width * 1.5, height: widget.position.height * 1.5 };
      onResize(widget.id, newSize);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ 
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        y: -2
      }}
      className={`
        relative bg-white rounded-xl shadow-sm border border-gray-200 
        overflow-hidden transition-all duration-200
        ${isEditing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${className}
      `}
      style={{
        width: widget.position.width,
        height: widget.position.height,
        gridColumn: `span ${Math.ceil(widget.position.width / 100)}`,
        gridRow: `span ${Math.ceil(widget.position.height / 100)}`
      }}
    >
      {/* Header */}
      {widget.config.displayOptions?.showHeader !== false && (
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 truncate">
            {widget.title}
          </h3>
          
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExpand}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title={isExpanded ? 'Contraer' : 'Expandir'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings size={14} />
                      Configurar
                    </button>
                    <button
                      onClick={handleRemove}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <X size={14} />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="p-4 h-full overflow-hidden">
        {children}
      </div>
      
      {/* Footer */}
      {widget.config.displayOptions?.showFooter && (
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">
            Actualizado: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
      
      {/* Resize handle for editing mode */}
      {isEditing && (
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-50 hover:opacity-100" />
      )}
    </motion.div>
  );
};

export default BaseWidget;