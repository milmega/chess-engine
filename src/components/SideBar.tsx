import { useState } from "react";
import "../styles/SideBar.css"

interface Props {
    onGameReset: () => void,
    onPlayOnline: () => void,
    onPlayComputer: () => void
}

const SideBar: React.FC<Props> = ({onGameReset, onPlayOnline, onPlayComputer}) => {

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

    return (
        <div className="sidebar">
            { gameMode === "menu" && <div className="pre-game-sidebar">
                <div className="button human-button" onClick={onPlayOnlineClicked}>
                    <span className="title">Play Online</span>
                    <span className="subtitle">Play against another user</span>
                    <input className="id-input" placeholder="Game ID"></input>
                </div>
                <div className="button computer-button" onClick={onPlayComputerClicked}>
                    <span className="title">Play Computer</span>
                    <span className="subtitle">Play against a bot</span>
                </div>
            </div> }
            { gameMode !== "menu" && <div className="game-sidebar">
                <div className="leave-game-button" onClick={onLeaveGameClicked}>
                    <span>Leave the game</span>
                </div>
            </div> }
        </div>
    );
}
export default SideBar;