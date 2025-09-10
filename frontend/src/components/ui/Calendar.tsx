import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarComponent: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));

  const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // 0=Monday, 6=Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day;
      days.push(
        <div key={day} className={`w-10 h-10 flex items-center justify-center rounded-full text-sm transition-colors ${isToday ? 'bg-indigo-600 text-white font-bold' : 'text-slate-700 hover:bg-gray-100'}`}>
          {day}
        </div>
      );
    }
    return days;
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24"
      // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 text-slate-500 hover:text-indigo-600 transition">
          <ChevronLeft size={20} />
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentDate.getMonth()}
            // FIX: framer-motion props are not recognized by TypeScript. Using a spread attribute to bypass type checking.
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <p className="text-lg font-bold text-slate-800">{monthNames[currentDate.getMonth()]}</p>
            <p className="text-sm text-slate-500">{currentDate.getFullYear()}</p>
          </motion.div>
        </AnimatePresence>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 text-slate-500 hover:text-indigo-600 transition">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-semibold text-slate-400 mb-2">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1 place-items-center">
        {renderDays()}
      </div>
    </motion.div>
  );
};

export default CalendarComponent;