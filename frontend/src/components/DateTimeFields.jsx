import {
  getDefaultTimeForDate,
  getLocalTimezoneLabel,
  getNowDateString,
  getNowTimeString,
} from "../utils/format";

export { getNowDateString, getNowTimeString };

export default function DateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  required = true,
  smartTimeOnDateChange = false,
  showTimezoneHint = false,
}) {
  const handleDateChange = (newDate) => {
    onDateChange(newDate);
    if (smartTimeOnDateChange && onTimeChange) {
      onTimeChange(getDefaultTimeForDate(newDate));
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{dateLabel}</label>
          <div className="date-input-wrap">
            <input
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              required={required}
              className="input w-full"
            />
            <span className="date-input-icon" aria-hidden="true">
              📅
            </span>
          </div>
        </div>
        <div>
          <label className="label">{timeLabel}</label>
          <div className="date-input-wrap">
            <input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              required={required}
              className="input w-full"
            />
            <span className="date-input-icon" aria-hidden="true">
              🕐
            </span>
          </div>
        </div>
      </div>
      {showTimezoneHint && (
        <p className="text-xs text-dim">
          Saved as the date & time you pick ({getLocalTimezoneLabel()}). Change it if the debt
          happened earlier.
        </p>
      )}
    </div>
  );
}
