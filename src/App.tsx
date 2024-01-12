import { useRef, useState } from 'react';
import Board from './components/Board';
import SideBar from './components/SideBar';
import "./styles/Board.css";
import EduSection from './components/EduSection';
import MoveGeneratorService from './services/MoveGeneratorService';

interface BoardRef {
  reset: () => void;  
}

function App() {
  const boardRef = useRef<BoardRef | null>(null);
  const [winner, setWinner] = useState("");
  const [gameMode, setGameMode] = useState("menu");
  const [playerColour, setPlayerColour] = useState(1); //TODO: let user to choose side. default 1 = white
  const moveGeneratorService = new MoveGeneratorService('http://localhost:8080');
  const declareWinner = (colour: number) => {
    setWinner(colour > 0 ? "WHITE" : "BLACK");
    setGameMode("menu");
  }

  const resetGame = () => {
    setWinner("");
    setGameMode("menu");
    if (boardRef.current) {
        boardRef.current.reset();
    }
  }

  const playOnline = () => {
    console.log("playing online");
    moveGeneratorService.resetBoard();
    setGameMode("online");
  }

  const playComputer = () => {
    console.log("playing computer");
    setGameMode("computer");
  }

  const learnMore = () => {
    console.log("learning more");
    setGameMode("menu-edu");
  }

  const onEduSectionExit = () => {
    setGameMode("menu");
  }
  
  return (
    <div className="app">
      <div>
        <Board onGameEnd={declareWinner} ref={boardRef} gameMode={gameMode} playerColour={playerColour}/>
        {winner && <div className="banner"><span className="banner-text">{winner} WINS!</span></div>}
      </div>
      <SideBar onGameReset={resetGame} onPlayOnline={playOnline} onPlayComputer={playComputer} onLearnMore={learnMore}/>
      {gameMode === "menu-edu" && <EduSection onEduExit={onEduSectionExit}/>}
    </div>
  );
}

export default App;