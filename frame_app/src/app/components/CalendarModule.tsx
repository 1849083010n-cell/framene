import { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { webEventsApi } from '@/services/frameNe/webEvents';
import type { WebCalendarEvent } from '@/services/frameNe/webEvents';

const USER_NAMES: Record<string, string> = {
  '1849083010n@gmail.com': 'nnn',
  '18128812778@163.com': '1号用户',
  '2646146770@qq.com': 'test',
  'test@framene.com': '测试用户',
  'feishu@framene.com': '飞书用户',
};

function getUserLabel(email?: string | null): string {
  if (!email) return '';
  const name = USER_NAMES[email];
  if (name) return `@${name}`;
  // 从邮箱提取前缀
  const prefix = email.split('@')[0];
  return `@${prefix}`;
}

interface CalendarEventItem {
  id: string;
  title: string;
  date: Date;
  color: string;
  userName: string;
}

const EVENT_COLORS = ['#ff6b6b', '#4ecdc4', '#95e1d3', '#f9ca24', '#a29bfe', '#fd79a8', '#00cec9', '#6c5ce7'];

export function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const res = await webEventsApi.list(
        monthStart.toISOString(),
        monthEnd.toISOString()
      );
      const items: WebCalendarEvent[] = res.items || [];
      const mapped = items.map((ev, idx) => ({
        id: ev.id,
        title: ev.title,
        date: new Date(ev.start_at),
        color: EVENT_COLORS[idx % EVENT_COLORS.length],
        userName: getUserLabel(ev.source_email),
      }));
      setEvents(mapped);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          <h2 className="text-2xl">Family Calendar</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 bg-muted rounded-lg min-w-[140px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </div>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {monthDays.map((day, idx) => {
          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`
                relative p-2 rounded-lg border transition-all hover:border-primary
                ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}
                ${isTodayDate && !isSelected ? 'bg-accent' : ''}
              `}
            >
              <div className="text-sm mb-1">{format(day, 'd')}</div>
              {dayEvents.length > 0 && (
                <div className="flex gap-1 justify-center">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? 'currentColor' : event.color }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="mt-4 p-4 text-center text-muted-foreground">
          加载中...
        </div>
      )}

      {!loading && selectedDate && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="mb-3">{format(selectedDate, 'MMMM d, yyyy')}</h3>
          <div className="space-y-2">
            {getEventsForDate(selectedDate).map(event => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 bg-white rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm">{event.title}</span>
                  {event.userName && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {event.userName}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-muted-foreground">No events scheduled</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
