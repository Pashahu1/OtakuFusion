export const EventCard = ({ event }: any) => {
  return (
    <div
      className="
        p-2 rounded-md 
        bg-red-600/20 
        border border-red-500/40 
        text-white 
        shadow-sm 
        hover:bg-red-600/30 
        transition-all
      "
    >
      <p className="font-semibold text-sm leading-tight">{event.title}</p>
      <p className="text-xs opacity-70">
        {event.start.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  );
};
