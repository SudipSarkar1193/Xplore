import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

const Timer = forwardRef(({ onTimerEnd }, ref) => {
  const [timeLeft, setTimeLeft] = useState(3 * 60); // 3 minutes in seconds
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const startTimer = () => {
    if (intervalRef.current) return; // Prevent multiple intervals
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          onTimerEnd?.(); // Call the `onTimerEnd` callback if provided
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const restartTimer = () => {
    stopTimer();
    setTimeLeft(3 * 60); // Reset to 3 minutes
    startTimer();
  };

  useEffect(() => {
    startTimer();

    // Clean up on unmount
    return () => stopTimer();
  }, []);

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    restartTimer,
    stopTimer,
  }));

  return (
    <div className={`flex items-center justify-center w-8 h-4 text-xs mx-1`}>
      {formatTime(timeLeft)}
    </div>
  );
});

export default Timer;