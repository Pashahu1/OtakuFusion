import { useEffect, useState } from "react";

export function CurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const reloadTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 100);

    return () => clearInterval(reloadTimer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      ({formattedTime} - {formattedDate})
    </div>
  );
}
