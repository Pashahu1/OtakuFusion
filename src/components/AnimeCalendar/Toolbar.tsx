export const Toolbar = ({ label, onNavigate, onView }: any) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-md rounded-xl text-white mb-3">
      <div className="flex gap-2">
        <button onClick={() => onNavigate('TODAY')} className="btn-red">
          Today
        </button>
        <button onClick={() => onNavigate('PREV')} className="btn-red">
          Back
        </button>
        <button onClick={() => onNavigate('NEXT')} className="btn-red">
          Next
        </button>
      </div>

      <h2 className="text-lg font-bold">{label}</h2>

      <div className="flex gap-2">
        <button onClick={() => onView('week')} className="btn-red">
          Week
        </button>
        <button onClick={() => onView('day')} className="btn-red">
          Day
        </button>
      </div>
    </div>
  );
};
