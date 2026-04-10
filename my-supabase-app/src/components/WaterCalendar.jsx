import { useState, useMemo } from 'react';
import { getMonthHistory, getEffectiveDate, getBDDateString } from '../utils/storage';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getIntensityClass(glasses, goal) {
  if (!glasses || glasses <= 0) return '';
  const ratio = glasses / goal;
  if (ratio >= 1) return 'cal-day--full';
  if (ratio >= 0.75) return 'cal-day--high';
  if (ratio >= 0.5) return 'cal-day--mid';
  if (ratio >= 0.25) return 'cal-day--low';
  return 'cal-day--min';
}

export default function WaterCalendar({ dailyGoal, resetHour = 6 }) {
  // Use Bangladesh date for initial month/year
  const bdDateStr = getBDDateString(); // "YYYY-MM-DD"
  const bdYear = parseInt(bdDateStr.slice(0, 4), 10);
  const bdMonth = parseInt(bdDateStr.slice(5, 7), 10); // 1-indexed

  const [viewYear, setViewYear] = useState(bdYear);
  const [viewMonth, setViewMonth] = useState(bdMonth);
  const [tooltip, setTooltip] = useState(null);

  const todayStr = getEffectiveDate(resetHour);

  const history = useMemo(
    () => getMonthHistory(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  // Calendar grid calculations
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setTooltip(null);
  };

  const nextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setTooltip(null);
  };

  const goToToday = () => {
    const fresh = getBDDateString();
    setViewYear(parseInt(fresh.slice(0, 4), 10));
    setViewMonth(parseInt(fresh.slice(5, 7), 10));
    setTooltip(null);
  };

  const isCurrentMonth = viewYear === bdYear && viewMonth === bdMonth;

  // Can't go to future months
  const canGoNext = !(viewYear === bdYear && viewMonth === bdMonth);

  return (
    <section className="water-calendar" id="water-calendar">
      <h3 className="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.7 }}>
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z" />
        </svg>
        History Calendar
      </h3>

      {/* Month navigation */}
      <div className="cal-nav">
        <button className="btn btn--ghost btn--sm cal-nav__btn" onClick={prevMonth} aria-label="Previous month">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <span className="cal-nav__title">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <button
          className="btn btn--ghost btn--sm cal-nav__btn"
          onClick={nextMonth}
          disabled={!canGoNext}
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </button>
        {!isCurrentMonth && (
          <button className="btn btn--ghost btn--sm cal-nav__today" onClick={goToToday}>
            Today
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="cal-legend">
        <span className="cal-legend__item">
          <span className="cal-legend__swatch cal-legend__swatch--empty" />
          0
        </span>
        <span className="cal-legend__item">
          <span className="cal-legend__swatch cal-legend__swatch--min" />
        </span>
        <span className="cal-legend__item">
          <span className="cal-legend__swatch cal-legend__swatch--low" />
        </span>
        <span className="cal-legend__item">
          <span className="cal-legend__swatch cal-legend__swatch--mid" />
        </span>
        <span className="cal-legend__item">
          <span className="cal-legend__swatch cal-legend__swatch--high" />
        </span>
        <span className="cal-legend__item">
          <span className="cal-legend__swatch cal-legend__swatch--full" />
          {dailyGoal}+
        </span>
      </div>

      {/* Day headers */}
      <div className="cal-grid">
        {DAY_NAMES.map((d) => (
          <div key={d} className="cal-header">{d}</div>
        ))}

        {/* Empty cells before the 1st */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="cal-day cal-day--empty" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const log = history[dateStr];
          const glasses = log ? log.glasses : 0;
          const isToday = dateStr === todayStr;
          const isFuture = dateStr > todayStr;
          const intensity = isFuture ? '' : getIntensityClass(glasses, dailyGoal);

          return (
            <div
              key={day}
              className={`cal-day ${intensity} ${isToday ? 'cal-day--today' : ''} ${isFuture ? 'cal-day--future' : ''}`}
              onMouseEnter={() => !isFuture && setTooltip({ dateStr, glasses, day })}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => !isFuture && setTooltip(tooltip?.dateStr === dateStr ? null : { dateStr, glasses, day })}
            >
              <span className="cal-day__number">{day}</span>
              {glasses > 0 && !isFuture && (
                <span className="cal-day__count">{glasses}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="cal-tooltip">
          <strong>{MONTH_NAMES[viewMonth - 1]} {tooltip.day}, {viewYear}</strong>
          <span>
            {tooltip.glasses > 0
              ? `💧 ${tooltip.glasses} glass${tooltip.glasses !== 1 ? 'es' : ''}`
              : '🚫 No water logged'}
            {tooltip.glasses >= dailyGoal && ' ✅'}
          </span>
        </div>
      )}
    </section>
  );
}
