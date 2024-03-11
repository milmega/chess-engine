import { useEffect, useState } from "react";
import "./../styles/Timer.css";
import React from "react";

interface Props {
    onTimeUp: () => void,
    white: boolean
}

const Timer = React.forwardRef((props: Props, ref) => {
    const [time, setTime] = useState(15*60);

    const resetTimer = () => {
        setTime(15*60);
    }

    const updateTimer = (time: number) => {
        setTime(time);
    }

    const formatTime = (val: number): string => {
        const minutes = Math.floor(val / 60);
        const seconds = val % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    useEffect(() => {
        if(time === 0) {
            props.onTimeUp();
        }
    }, [time]);

    React.useImperativeHandle(ref, () => ({
        resetTimer,
        updateTimer
    }));

    return(
        <div className={`timer ${props.white ? 'white-timer' : 'black-timer'}`}>
            <span className="timer-text">{formatTime(time)}</span>
        </div>
    );
});

export default Timer;