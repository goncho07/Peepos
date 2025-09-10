import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Plus,
  Calendar,
  User
} from 'lucide-react';
import { Widget, TaskWidgetData, Task } from '../../types/widgets';
import BaseWidget from './BaseWidget';

interface TaskWidgetProps {
  widget: Widget;
  data: TaskWidgetData;
  onRemove?: (widgetId: string) => void;
  onEdit?: (widget: Widget) => void;
  isEditing?: boolean;
  onTaskToggle?: (taskId: string) => void;
  onAddTask?: () => void;
}

const TaskWidget: React.FC<TaskWidgetProps> = ({
  widget,
  data,
  onRemove,
  onEdit,
  isEditing = false,
  onTaskToggle,
  onAddTask
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle size={14} />;
      case 'medium':
        return <Clock size={14} />;
      case 'low':
        return <Circle size={14} />;
      default:
        return <Circle size={14} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays === -1) return 'Ayer';
    if (diffDays > 0) return `En ${diffDays} días`;
    return `Hace ${Math.abs(diffDays)} días`;
  };

  const filteredTasks = data.tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const handleTaskClick = (taskId: string) => {
    if (!isEditing && onTaskToggle) {
      onTaskToggle(taskId);
    }
  };

  const completedCount = data.tasks.filter(task => task.completed).length;
  const totalCount = data.tasks.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <BaseWidget
      widget={widget}
      onRemove={onRemove}
      onEdit={onEdit}
      isEditing={isEditing}
    >
      <div className="h-full flex flex-col">
        {/* Header with progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Todas ({totalCount})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  filter === 'pending' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pendientes ({totalCount - completedCount})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  filter === 'completed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completadas ({completedCount})
              </button>
            </div>
            
            {onAddTask && (
              <button
                onClick={onAddTask}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Agregar tarea"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completedCount} de {totalCount} completadas ({Math.round(completionPercentage)}%)
          </p>
        </div>
        
        {/* Task list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  p-3 rounded-lg border transition-all duration-200 cursor-pointer
                  ${task.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                  ${isEditing ? 'pointer-events-none' : ''}
                `}
                onClick={() => handleTaskClick(task.id)}
              >
                <div className="flex items-start gap-3">
                  <button className="mt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className="text-green-500" size={18} />
                    ) : (
                      <Circle className="text-gray-400" size={18} />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      task.completed 
                        ? 'text-gray-500 line-through' 
                        : 'text-gray-900'
                    }`}>
                      {task.title}
                    </p>
                    
                    {task.description && (
                      <p className={`text-xs mt-1 ${
                        task.completed 
                          ? 'text-gray-400' 
                          : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2">
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={12} />
                          <span>{formatDate(task.dueDate.toISOString())}</span>
                        </div>
                      )}
                      
                      {task.assignee && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User size={12} />
                          <span>{task.assignee}</span>
                        </div>
                      )}
                      
                      <div className={`flex items-center gap-1 text-xs ${
                        getPriorityColor(task.priority)
                      }`}>
                        {getPriorityIcon(task.priority)}
                        <span className="capitalize">{task.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Circle size={48} className="mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'all' 
                  ? 'No hay tareas' 
                  : filter === 'pending'
                  ? 'No hay tareas pendientes'
                  : 'No hay tareas completadas'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </BaseWidget>
  );
};

export default TaskWidget;