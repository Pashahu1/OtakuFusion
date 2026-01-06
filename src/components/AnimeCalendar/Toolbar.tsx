import { CurrentTime } from '../CurrentTime/CurrentTime';

export const Toolbar = ({ label, onNavigate, onView }: any) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-md rounded-xl text-white mb-3">
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('PREV')}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm"
        >
          Back
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm"
        >
          Next
        </button>
      </div>

      <h2 className="text-lg font-bold">{label}</h2>

      <div className="flex gap-2">
        <button
          onClick={() => onView('week')}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm"
        >
          Week
        </button>
        <button
          onClick={() => onView('day')}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm"
        >
          Day
        </button>
        <CurrentTime />
      </div>
    </div>
  );
};
