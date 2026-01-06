import { format } from 'date-fns';

export const EventCard = ({ event }: any) => {
  return (
    <div className="px-2 py-1 rounded-md bg-red-500 text-white text-xs leading-tight shadow-sm overflow-hidden">
      <p className="font-semibold">{format(event.start, 'HH:mm')}</p>
      <p className="truncate">{event.title}</p>
    </div>
  );
};
