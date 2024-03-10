import { useState } from "react";
import { SlControlPlay, SlControlStart, SlControlEnd } from "react-icons/sl";
import "../styles/SideBar.css"

interface Props {
    id: number,
    onGameReset: () => void,
    onPlayOnline: () => void,
    onPlayComputer: () => void,
    onPrevMove: (fastBackward: boolean) => void,
    onNextMove: (fastForward: boolean) => void
}

const SideBar: React.FC<Props> = ({id, onGameReset, onPlayOnline, onPlayComputer, onPrevMove, onNextMove}) => {

    const [gameMode, setGameMode] = useState("menu"); //menu, online, computer

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

    return (
        <div className="sidebar">
            { gameMode.startsWith("menu") && <div className="pre-game-sidebar">
                <div className="user-id-container">ID: #{id}</div>
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
            </div> }
        </div>
    );
}
export default SideBar;