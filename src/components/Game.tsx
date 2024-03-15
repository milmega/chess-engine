import { useEffect, useRef, useState } from 'react';
import { ImCancelCircle } from "react-icons/im";
import Board from './Board';
import { Piece } from "./Piece";
import SideBar from './SideBar';
import "./../styles/Game.css";
import MoveGeneratorService from './../services/MoveGeneratorService';
import Square from './Square';
import { SyncLoader } from 'react-spinners';
import { Move } from './Move';
import Level from './Level';

interface BoardRef {
    reset: () => void;
    onPrevMoveClicked: (fastBackward: boolean) => boolean;
    onNextMoveClicked: (fastForward: boolean) => boolean;
    updateFetchedMove: (move: Move) => void;
}

interface SidebarRef {
    resetTimer: () => void;
    updateTimer: (whiteTime: number, blackTime: number) => void;
}

const Game = () => {
    const boardRef = useRef<BoardRef | null>(null);
    const sidebarRef = useRef<SidebarRef | null>(null);
    const [gameResult, setGameResult] = useState("");
    const [gameResultDetails, setGameResultDetails] = useState("");
    const [gameMode, setGameMode] = useState("menu");
    const [gameLevel, setGameLevel] = useState(0);
    const [playerId, setPlayerId] = useState(1);
    const [playerColour, setPlayerColour] = useState(0);
    const [playerToMove, setPlayerToMove] = useState(1);
    const [gameId, setGameId] = useState<number>(-1);
    const [checkingHistory, setCheckingHistory] = useState<boolean>(false);
    const searching = useRef<boolean>(false);

    const moveGeneratorService = new MoveGeneratorService();

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
    }

    const resetGame = () => {
        setGameResult("");
        setGameMode("menu");
        setGameLevel(0);
        setPlayerColour(0);
        boardRef.current!.reset();
        sidebarRef.current!.resetTimer();
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
            moveGeneratorService
                .createNewGame(colour, playerId, 0, false)
                .then(id => {
                    setGameId(id);

                })
        }
    }

    const startSearch = (colour: number) => {
        setTimeout(() => {
            moveGeneratorService
                .createNewGame(colour, playerId, gameLevel, true)
                .then(id => {
                    if (id > 0) {
                        setGameId(id);
                        searching.current = false;
                        setGameMode("online");
                        sidebarRef.current?.updateTimer(15*60-1, 15*60);
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

    const onPrevMoveClicked = (fastBackward: boolean) => {
        setCheckingHistory(boardRef.current!.onPrevMoveClicked(fastBackward));
    }

    const onNextMoveClicked = (fastForward: boolean) => {
        setCheckingHistory(boardRef.current!.onNextMoveClicked(fastForward));
    }
    
    useEffect(() => {
        const resetBeforeRefresh = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            boardRef.current!.reset();
            sidebarRef.current!.resetTimer();
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
                moveGeneratorService.fetchUpdate(gameId).then(gameState => {
                    const lastMove = gameState.lastMove;
                    if(playerColour !== playerToMove && 
                        lastMove.colour !== playerColour && 
                        lastMove.piece !== 0 && 
                        lastMove.gameResult !== 6) {
                            boardRef.current!.updateFetchedMove(lastMove);
                        }
                    if (lastMove.gameResult > 0) {
                        declareWinner(lastMove.colour, lastMove.gameResult);
                    } else if (!gameState.isGameLive) {
                        declareWinner(playerColour, 6);
                    } else {
                        sidebarRef.current?.updateTimer(gameState.whiteTime, gameState.blackTime);
                    }
                });
            }
        }, 1000);
        return () => clearInterval(intervalId);
    }, [gameId, gameMode, playerColour, playerToMove]);

    useEffect(() => {
        const updateScaleFactor = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const widthThreshold = gameMode.endsWith("menu") ? 1330 : 1130;
            const widthScaleFactor = viewportWidth > widthThreshold ? 1 : (viewportWidth / widthThreshold);
            const heightScaleFactor = viewportHeight > 830 ? 1 : (viewportHeight / 830)
            const scaleFactor = Math.min(widthScaleFactor, heightScaleFactor);
            document.documentElement.style.setProperty('--scale-factor', scaleFactor.toString());
        }

        window.addEventListener('resize', updateScaleFactor);
        updateScaleFactor();

        return () => {
            window.removeEventListener('resize', updateScaleFactor);
        };

    }, [gameMode]);

    return (
        <div className="game-container">
            <div className="board-with-banner-container">
                <Board 
                    ref={boardRef} 
                    gameMode={gameMode} 
                    gameId={gameId} 
                    playerColour={playerColour}
                    onGameEnd={declareWinner} 
                    onPlayerToMoveChange={() => setPlayerToMove(-playerToMove)}/>
                {gameResult && !checkingHistory && 
                <div className="banner vertical-banner">
                    <span className="banner-text">{gameResult}</span>
                    <span className="banner-subtext">{gameResultDetails}</span>
                </div>}
                {gameMode === "computer" && playerColour === 0 && !searching.current &&  gameLevel === 0 &&
                <div className="banner">
                    <Level level="easy" onLevelClicked={() => setGameLevel(1)}/>
                    <Level level="medium" onLevelClicked={() => setGameLevel(2)}/>
                    <Level level="hard" onLevelClicked={() => setGameLevel(3)}/>
                </div>}
                {gameMode !== "menu" && playerColour === 0 && !searching.current && (gameLevel > 0 || gameMode === "searching") &&
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
            <SideBar
                ref={sidebarRef}
                gameMode={gameMode}
                onGameReset={resetGame} 
                onPlayOnline={() => setGameMode("searching")} 
                onPlayComputer={() => setGameMode("computer")} 
                onPrevMove={onPrevMoveClicked} 
                onNextMove={onNextMoveClicked}
                onGameEnd={declareWinner}
            />
        </div>
      );


}
export default Game;