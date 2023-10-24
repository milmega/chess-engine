import { useRef, useState } from 'react';
import Board from './components/Board';
import SideBar from './components/SideBar';
import "./styles/Board.css";

interface BoardRef {
  reset: () => void;  
}

function App() {
  const boardRef = useRef<BoardRef | null>(null);
  const [winner, setWinner] = useState("");
  const [gameMode, setGameMode] = useState("menu");

  const declareWinner = (color: string) => {
    setWinner(color);
  }

  const resetGame = () => {
    console.log("reseting");
    setWinner("");
    setGameMode("menu");
    if (boardRef.current) {
        boardRef.current.reset();
    }
  }

  const playOnline = () => {
    console.log("playing online");
    setGameMode("online");
  }

  const playComputer = () => {
    console.log("playing computer");
    setGameMode("computer");
  }
  
  return (
    <div className="app">
      <div>
        <Board onGameEnd={declareWinner} ref={boardRef} gameMode={gameMode}/>
        {winner && <div className="banner"><span className="banner-text">{winner.toUpperCase()} WINS!</span></div>}
      </div>
      <SideBar onGameReset={resetGame} onPlayOnline={playOnline} onPlayComputer={playComputer}/>
    </div>
  );
}

export default App;