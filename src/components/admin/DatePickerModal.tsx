'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  bookedDates?: string[]; // Array of YYYY-MM-DD strings
}

export function DatePickerModal({
  isOpen,
  onClose,
  onSelectDate,
  selectedDate,
  bookedDates = [],
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get all days in the calendar grid (including prev/next month days)
  const firstDayOfWeek = monthStart.getDay();
  const prevMonthDays = Array(firstDayOfWeek).fill(null).map((_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });

  const lastDayOfMonth = monthEnd.getDate();
  const lastDayOfWeek = monthEnd.getDay();
  const nextMonthDays = Array(6 - lastDayOfWeek).fill(null).map((_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...prevMonthDays, ...days, ...nextMonthDays];
  const weeks = Array(Math.ceil(allDays.length / 7)).fill(null).map((_, weekIdx) =>
    allDays.slice(weekIdx * 7, (weekIdx + 1) * 7)
  );

  const handleSelectDate = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  const isDateBooked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedDates.includes(dateStr);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-[#16161B] rounded-lg w-full max-w-sm border border-brand-ash">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-brand-ash">
          <h2 className="text-lg font-bold text-brand-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-brand-graphite-light rounded transition-colors"
          >
            <X className="w-5 h-5 text-brand-smoke" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center p-4 border-b border-brand-ash">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-brand-graphite-light rounded transition-colors text-brand-smoke hover:text-brand-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1 text-sm rounded border border-brand-ash hover:bg-brand-graphite-light text-brand-smoke hover:text-brand-white transition-colors"
            >
              Today
            </button>
          </div>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-brand-graphite-light rounded transition-colors text-brand-smoke hover:text-brand-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar */}
        <div className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-brand-smoke py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((date, idx) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isBooked = isDateBooked(date);
              const isToday = isSameDay(date, new Date());

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectDate(date)}
                  disabled={!isCurrentMonth || isBooked}
                  className={`
                    aspect-square rounded text-sm font-medium py-2 transition-colors
                    ${!isCurrentMonth ? 'text-brand-silver cursor-default' : ''}
                    ${isSelected ? 'bg-brand-red text-white' : ''}
                    ${isToday && !isSelected ? 'border-2 border-brand-red' : ''}
                    ${isBooked ? 'bg-red-500/20 text-red-400 cursor-not-allowed line-through' : ''}
                    ${isCurrentMonth && !isSelected && !isBooked && !isToday ? 'hover:bg-brand-graphite-light text-brand-white cursor-pointer' : ''}
                    ${isCurrentMonth && !isSelected && !isBooked && !isToday ? 'text-brand-white' : ''}
                  `}
                >
                  {format(date, 'd')}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2 text-xs text-brand-smoke border-t border-brand-ash pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-brand-red"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border border-brand-red"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-red-500/40"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
