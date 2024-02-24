import { useEffect, useRef, useState } from 'react';
import Board from './components/Board';
import { Piece } from "./components/Piece";
import SideBar from './components/SideBar';
import "./styles/Board.css";
import EduSection from './components/EduSection';
import MoveGeneratorService from './services/MoveGeneratorService';
import Square from './components/Square';
import { Move } from './components/Move';

interface BoardRef {
    reset: () => void;
    onPrevMoveClicked: (fastBackward: boolean) => void;
    onNextMoveClicked: (fastForward: boolean) => void;
    fetchOpponentMove: (colour: number, gameId: number) => Move;
}
const moveGeneratorService = new MoveGeneratorService('http://localhost:8080');
let playerID = 0
if(typeof window !== 'undefined') { //TODO: implement better option for assigning ID
    moveGeneratorService.generateID().then(id => playerID = id);
}

function App() {
    const boardRef = useRef<BoardRef | null>(null);
    const [gameResult, setGameResult] = useState("");
    const [gameResultDetails, setGameResultDetails] = useState("");
    const [gameMode, setGameMode] = useState("menu");
    const [playerColour, setPlayerColour] = useState(0);
    const [playerToMove, setPlayerToMove] = useState(1);
    const [gameId, setGameId] = useState<number>(-1);

    const declareWinner = (colour: number, result: number) => {
        if (result === 1) {
            if (colour > 0) {
                setGameResult("WHITE WINS")
            } else if (colour < 0) {
                setGameResult("BLACK WINS")
            }
        } else {
            setGameResult("DRAW");
            if (result === 2) {
                setGameResultDetails("By insufficient material");
            } else if (result === 3) {
                setGameResultDetails("By threefold repetition");
            } else if (result === 4) {
                setGameResultDetails("By 50 move rule");
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
        boardRef.current!.reset();
        setPlayerToMove(1);
        setGameId(-1);
    }

    const startGame = (colour: number) => {
        setPlayerColour(colour);
        if(gameMode === "online") {
            //TODO: add loading icon if user is looking for a game
            setTimeout(() => {
                moveGeneratorService
                .createNewGame(colour, playerID)
                .then(id => {
                    if(id > 0) {
                        setGameId(id);
                    } else {
                        startGame(colour);
                    }
                }); // TODO: button to cancel search if no opponent found
            }, 1000);
            
        } else if (gameMode === "computer") {
              setGameId(0);
        }
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

    useEffect(() => {
        const resetBeforeRefresh = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            boardRef.current!.reset();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', resetBeforeRefresh);
      
        return () => {
            window.removeEventListener('beforeunload', resetBeforeRefresh); 
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (gameMode === "online" && gameId > 0 && playerColour !== 0 && playerColour !== playerToMove) {
                boardRef.current!.fetchOpponentMove(playerColour, gameId);
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [gameId, gameMode, playerColour, playerToMove]);
    
    return (
      <div className="app">
          <div>
              <Board onGameEnd={declareWinner} ref={boardRef} gameMode={gameMode} gameId={gameId} playerColour={playerColour} onPlayerToMoveChange={() => setPlayerToMove(-playerToMove)}/>
              {gameResult && <div className="banner vertical-banner">
                  <span className="banner-text">{gameResult}</span>
                  <span className="banner-subtext">{gameResultDetails}</span>
              </div>}
              {playerColour === 0 && gameMode !== "menu" && 
              <div className="banner">
                  <div className="banner-king" onClick={() => startGame(1)}><Square piece={Piece.KING} scale="5"/></div>
                  <div className="banner-king" onClick={() => startGame(-1)}><Square piece={-Piece.KING} scale="5"/></div>
              </div>}
          </div>
          <SideBar id={playerID} onGameReset={resetGame} onPlayOnline={() => setGameMode("online")} onPlayComputer={() => setGameMode("computer")} onLearnMore={learnMore} onPrevMove={onPrevMoveClicked} onNextMove={onNextMoveClicked}/>
          {gameMode === "menu-edu" && <EduSection onEduExit={onEduSectionExit}/>}
      </div>
    );
}

export default App;