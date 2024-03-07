import { useEffect, useState } from "react";
import "./../styles/Timer.css";
import React from "react";

interface Props {
    onTimeUp: () => void,
    rotate: boolean
}

const Timer = React.forwardRef((props: Props, ref) => {
    const [time, setTime] = useState(15*60*1000);
    const [isActive, setActive] = useState(false);

    const startTimer = () => {
        setActive(true);
    }

    const stopTimer = () => {
        setActive(false);
    }

    const resetTimer = () => {
        setTime(15*60*1000);
        setActive(false);
    }

    const formatTime = (val: number): string => {
        const minutes = Math.floor(val / 60);
        const seconds = val % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    useEffect(() => {
        if(time === 0) {
            setActive(false);
            props.onTimeUp();
        }
        if(isActive) {
            const interval = setInterval(() => setTime((prevTime) => prevTime - 100), 100);
            return () => clearInterval(interval);
        }
    }, [isActive, time]);

    React.useImperativeHandle(ref, () => ({
        startTimer,
        stopTimer,
        resetTimer
    }));

    return(
        <div className={`timer-container ${props.rotate ? 'timer-rotated' : ''}`}>
            <span className="timer-text">{formatTime(Math.floor(time/1000))}</span>
        </div>
    );
});

export default Timer;