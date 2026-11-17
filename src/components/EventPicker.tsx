import type { CampusEvent } from '../types';

type EventPickerProps = {
  events: CampusEvent[];
  selectedEventId: string;
  onChange: (eventId: string) => void;
  onCreateEvent: () => void;
};

function EventPicker({ events, selectedEventId, onChange, onCreateEvent }: EventPickerProps) {
  return (
    <div>
      <label htmlFor="event">From an event? (Optional)</label>

      <select id="event" value={selectedEventId} onChange={(e) => onChange(e.target.value)}>
        <option value="">No event</option>

        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>

      <button type="button" onClick={onCreateEvent}>
        + Create Event
      </button>
    </div>
  );
}

export default EventPicker;
