"use client";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "./AnimeCalendar.scss";
import React from "react";
import { useRouter } from "next/navigation";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Props = {
  events: any;
  onDateChange: (data: { year: number; month: number; day: number }) => void;
};

const AnimeCalendar = React.memo(({ events, onDateChange }: Props) => {
  const route = useRouter();

  console.log(onDateChange);

  const handleSelectEvent = (event: any) => {
    route.push(`/watch/${event.id}`);
  };

  return (
    <div className="calendar">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view="week"
        onSelectEvent={handleSelectEvent}
        onNavigate={(date) => {
          const year = date.getFullYear();
          const month = date.getMonth();
          const day = date.getDate();
          onDateChange({ year, month, day });
        }}
        style={{ background: "#1a1a1a", color: "white", borderRadius: "10px" }}
      />
    </div>
  );
});

export default AnimeCalendar;
