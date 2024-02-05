import { useRef, useState } from 'react';
import Board from './components/Board';
import { Piece } from "./components/Piece";
import SideBar from './components/SideBar';
import "./styles/Board.css";
import EduSection from './components/EduSection';
import MoveGeneratorService from './services/MoveGeneratorService';
import Square from './components/Square';

interface BoardRef {
  reset: () => void;
  onPrevMoveClicked: (fastBackward: boolean) => void;
  onNextMoveClicked: (fastForward: boolean) => void;
}

function App() {
  const boardRef = useRef<BoardRef | null>(null);
  const [gameResult, setGameResult] = useState("");
  const [gameResultDetails, setGameResultDetails] = useState("");
  const [gameMode, setGameMode] = useState("menu");
  const [playerColour, setPlayerColour] = useState(0);
  const moveGeneratorService = new MoveGeneratorService('http://localhost:8080');

  const declareWinner = (colour: number, result: number) => {
    if(result === 1) {
      if(colour > 0) {
        setGameResult("WHITE WINS!")
      } else if(colour < 0) {
        setGameResult("BLACK WINS!")
      }
    } else {
      setGameResult("DRAW!");
      if(result === 2) {
        setGameResultDetails("By 50 move rule");
      } else if(result === 3) {
        setGameResultDetails("By threefold repetition");
      } else if(result === 4) {
        setGameResultDetails("By insufficient material");
      } else {
        setGameResultDetails("Stalemate");
      }
    }
    setGameMode("menu");
  }

  const resetGame = () => {
    setGameResult("");
    setGameMode("menu");
    setPlayerColour(0);
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
    moveGeneratorService.resetBoard();
    setGameMode("computer");
  }

  const learnMore = () => {
    console.log("learning more");
    setGameMode("menu-edu");
  }

  const onEduSectionExit = () => {
    setGameMode("menu");
  }

  const onPrevMoveClicked = (fastBackward: boolean) => {
    boardRef.current!.onPrevMoveClicked(fastBackward);
  }

  const onNextMoveClicked = (fastForward: boolean) => {
    boardRef.current!.onNextMoveClicked(fastForward);
  }
  
  return (
    <div className="app">
      <div>
        <Board onGameEnd={declareWinner} ref={boardRef} gameMode={gameMode} playerColour={playerColour}/>
        {gameResult && <div className="banner vertical-banner">
          <span className="banner-text">{gameResult}</span>
          <span className="banner-subtext">{gameResultDetails}</span>
          </div>}
        {playerColour === 0 && gameMode !== "menu" && 
          <div className="banner">
            <div className="banner-king" onClick={() => setPlayerColour(1)}><Square piece={Piece.KING} scale="5"/></div>
            <div className="banner-king" onClick={() => setPlayerColour(-1)}><Square piece={-Piece.KING} scale="5"/></div>
          </div>}
      </div>
      <SideBar onGameReset={resetGame} onPlayOnline={playOnline} onPlayComputer={playComputer} onLearnMore={learnMore} onPrevMove={onPrevMoveClicked} onNextMove={onNextMoveClicked}/>
      {gameMode === "menu-edu" && <EduSection onEduExit={onEduSectionExit}/>}
    </div>
  );
}

export default App;