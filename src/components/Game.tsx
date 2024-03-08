import { useEffect, useRef, useState } from 'react';
import { ImCancelCircle } from "react-icons/im";
import Board from './Board';
import { Piece } from "./Piece";
import SideBar from './SideBar';
import "./../styles/Game.css";
import EduSection from './EduSection';
import MoveGeneratorService from './../services/MoveGeneratorService';
import Square from './Square';
import { SyncLoader } from 'react-spinners';

interface BoardRef {
    reset: () => void;
    onPrevMoveClicked: (fastBackward: boolean) => boolean;
    onNextMoveClicked: (fastForward: boolean) => boolean;
    fetchOpponentMove: (colour: number, gameId: number) => boolean;
    startTimer: () => void;
}

const Game = () => {
    const boardRef = useRef<BoardRef | null>(null);
    const [gameResult, setGameResult] = useState("");
    const [gameResultDetails, setGameResultDetails] = useState("");
    const [gameMode, setGameMode] = useState("menu");
    const [playerId, setPlayerId] = useState(1);
    const [playerColour, setPlayerColour] = useState(0);
    const [playerToMove, setPlayerToMove] = useState(1);
    const [gameId, setGameId] = useState<number>(-1);
    const [checkingHistory, setCheckingHistory] = useState<boolean>(false);
    const searching = useRef<boolean>(false);

    const moveGeneratorService = new MoveGeneratorService('http://localhost:8080');

    const declareWinner = (colour: number, result: number) => {
        if (result === 1) {
            if (colour > 0) {
                setGameResult("WHITE WINS");
            } else if (colour < 0) {
                setGameResult("BLACK WINS");
            }
        } else if (result === 6) {
            if (playerColour > 0) {
                setGameResult("WHITE WINS");
            } else if (playerColour < 0) {
                setGameResult("BLACK WINS");
            }
            setGameResultDetails("Opponent has left the game");
        } else if (result === 7) {
            if (colour > 0) {
                setGameResult("WHITE WINS")
            } else if (colour < 0) {
                setGameResult("BLACK WINS");
            }
            setGameResultDetails("Time is up")

        }
        else {
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
        searching.current = false;
    }

    const startGame = (colour: number) => {
        if (colour === 0) {
            colour = Math.random() > 0.5 ? 1 : -1;
        }
        setPlayerColour(colour);
        if (gameMode === "searching") {
            searching.current = true;
            startSearch(colour);        
        } else if (gameMode === "computer") {
              setGameId(0);
              boardRef.current!.startTimer(); //TODO: send this time to backend and correct it when get back
        }
    }

    const startSearch = (colour: number) => {
        setTimeout(() => {
            moveGeneratorService
            .createNewGame(colour, playerId)
            .then(id => {
                if (id > 0) {
                    setGameId(id);
                    searching.current = false;
                    setGameMode("online");
                    boardRef.current!.startTimer();
                } else if (searching.current) {
                    startSearch(colour);
                } else {
                    moveGeneratorService.cancelSearch(playerId);
                }
            });
        }, 1000);
    }

    const cancelSearch = () => {
        searching.current = false;
        setPlayerColour(0);
    }

    const learnMore = () => {
        console.log("learning more");
        setGameMode("menu-edu");
    }

    const onEduSectionExit = () => {
        setGameMode("menu");
    }

    const onPrevMoveClicked = (fastBackward: boolean) => {
        setCheckingHistory(boardRef.current!.onPrevMoveClicked(fastBackward));
        console.log(checkingHistory);
    }

    const onNextMoveClicked = (fastForward: boolean) => {
        setCheckingHistory(boardRef.current!.onNextMoveClicked(fastForward));
    }
    
    useEffect(() => {
        const resetBeforeRefresh = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            boardRef.current!.reset();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', resetBeforeRefresh);

        const idAssigned = sessionStorage.getItem('id');
        if (!idAssigned) {
          moveGeneratorService.generateID().then(id => setPlayerId(id));
          sessionStorage.setItem('id', 'true');
        }
      
        return () => {
            window.removeEventListener('beforeunload', resetBeforeRefresh); 
        };
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (gameMode === "online" && gameId > 0 && playerColour !== 0) {
                if (playerColour !== playerToMove) {
                    boardRef.current!.fetchOpponentMove(playerColour, gameId);
                } else {
                    moveGeneratorService.checkIfGameIsLive(gameId).then(isLive => {
                        if (!isLive) {
                            declareWinner(playerColour, 6);
                        }
                    });
                }
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [gameId, gameMode, playerColour, playerToMove]);

    return (
        <div className="game-container">
            <div>
                <Board onGameEnd={declareWinner} ref={boardRef} gameMode={gameMode} gameId={gameId} playerColour={playerColour} onPlayerToMoveChange={() => setPlayerToMove(-playerToMove)}/>
                {gameResult && !checkingHistory && <div className="banner vertical-banner">
                    <span className="banner-text">{gameResult}</span>
                    <span className="banner-subtext">{gameResultDetails}</span>
                </div>}
                {gameMode !== "menu" && playerColour === 0 && !searching.current &&
                <div className="banner">
                        <div className="banner-king" onClick={() => startGame(1)}><Square piece={Piece.KING} scale="5"/></div>
                        <div className="banner-double-king" onClick={() => startGame(0)}>
                            <div className="white-half"><Square piece={Piece.KING} scale="5"/></div>
                            <div className="black-half"><Square piece={-Piece.KING} scale="5"/></div>
                        </div>
                        <div className="banner-king" onClick={() => startGame(-1)}><Square piece={-Piece.KING} scale="5"/></div>
                </div>}
                {gameMode !== "menu" && playerColour !== 0 && searching.current &&
                <div className="banner">
                  <ImCancelCircle className="cancel-button" onClick={cancelSearch}/>
                    <div className="loading-container">
                        <SyncLoader color="#eeeed2"/>
                        <span className="loading-note">Searching for an opponent...</span>
                    </div>
                </div>}
            </div>
            <SideBar id={playerId} onGameReset={resetGame} onPlayOnline={() => setGameMode("searching")} onPlayComputer={() => setGameMode("computer")} onLearnMore={learnMore} onPrevMove={onPrevMoveClicked} onNextMove={onNextMoveClicked}/>
            {gameMode === "menu-edu" && <EduSection onEduExit={onEduSectionExit}/>}
        </div>
      );


}
export default Game;