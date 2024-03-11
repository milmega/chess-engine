import { useRef, useState } from "react";
import { SlControlPlay, SlControlStart, SlControlEnd } from "react-icons/sl";
import "../styles/SideBar.css"
import Timer from "./Timer";
import React from "react";

interface Props {
    onGameReset: () => void,
    onPlayOnline: () => void,
    onPlayComputer: () => void,
    onPrevMove: (fastBackward: boolean) => void,
    onNextMove: (fastForward: boolean) => void,
    onGameEnd: (colour: number, reason: number) => void,
    playerColour: number
}

interface TimerRef {
    resetTimer: () => void;
    updateTimer: (time: number) => void;
}

const SideBar = React.forwardRef(({onGameEnd, onGameReset, onPlayOnline, onPlayComputer, onPrevMove, onNextMove, playerColour}: Props, ref) => {

    const [gameMode, setGameMode] = useState("menu"); //menu, online, computer
    const whiteTimer = useRef<TimerRef | null>(null);
    const blackTimer = useRef<TimerRef | null>(null);

    const onPlayComputerClicked = () => {
        setGameMode("computer");
        onPlayComputer();
    }

    const onPlayOnlineClicked = () => {
        setGameMode("online");
        onPlayOnline();
    }

    const onLeaveGameClicked = () => {
        setGameMode("menu");
        onGameReset();
    }

    const onPrevMoveBtnClicked = (fastBackward: boolean) => {
        onPrevMove(fastBackward);
    }

    const onNextMoveBtnClicked = (fastForward: boolean) => {
        onNextMove(fastForward);
    }

    const updateTimer = (whiteTime: number, blackTime: number) => {
        whiteTimer.current!.updateTimer(whiteTime);
        blackTimer.current!.updateTimer(blackTime);
    }

    const resetTimer = () => {
        whiteTimer.current?.resetTimer();
        blackTimer.current?.resetTimer();
    }

    React.useImperativeHandle(ref, () => ({
        resetTimer,
        updateTimer
    }));

    return (
        <div className="sidebar">
            { gameMode.startsWith("menu") && <div className="pre-game-sidebar">
                <div>
                    <div className="button human-button" onClick={onPlayOnlineClicked}>
                        <span className="title">Play Online</span>
                        <span className="subtitle">Play against another user</span>
                    </div>
                    <div className="button computer-button" onClick={onPlayComputerClicked}>
                        <span className="title">Play Computer</span>
                        <span className="subtitle">Play against a bot</span>
                    </div>
                </div>
                <div></div>
            </div> }
            { !gameMode.startsWith("menu") && <div className="game-sidebar">
                <div className="leave-game-button" onClick={onLeaveGameClicked}>
                    <span>Leave the game</span>
                </div>
                <div className="prev-next-btn-container">
                    <div className="move-button" onClick={() => onPrevMoveBtnClicked(true)}>
                        <SlControlStart className="move-button-icon"/>
                    </div>
                    <div className="move-button prev-move-button" onClick={() => onPrevMoveBtnClicked(false)}>
                        <SlControlPlay className="move-button-icon with-margin"/>
                    </div>
                    <div className="move-button" onClick={() => onNextMoveBtnClicked(false)}>
                        <SlControlPlay className="move-button-icon with-margin"/>
                    </div>
                    <div className="move-button" onClick={() => onNextMoveBtnClicked(true)}>
                        <SlControlEnd className="move-button-icon"/>
                    </div>
                </div>
                { gameMode.startsWith("online") && <div className="timer-container">
                    <Timer ref={whiteTimer} white={true} onTimeUp={() => onGameEnd(-1, 7)}/>
                    <Timer ref={blackTimer} white={false} onTimeUp={() => onGameEnd(1, 7)}/>
                </div>}
            </div> }
        </div>
    );
});

export default SideBar;