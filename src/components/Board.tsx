import Square from "./Square";
import "../styles/Board.css"
import { useEffect, useRef, useState } from "react";
import React from "react";
import MoveGeneratorService from "../services/MoveGeneratorService";
import { Piece } from "./Piece";
import { Move } from "./Move";

interface Props {
    onGameEnd: (colour: number, result: number) => void,
    onPlayerToMoveChange: () => void,
    gameMode: string,
    gameId: number,
    playerColour: number
}

const Board = React.forwardRef(({onGameEnd, onPlayerToMoveChange, gameMode, gameId, playerColour}: Props, ref) => {
    const [chosenSquare, setChosenSquare] = useState(-1);
    const [potentialMoves, setPotentialMoves] = useState<Move[]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<Move[]>([]);
    const [currentBoard, setCurrentBoard] = useState([
        -4, -2, -3, -5, -6, -3, -2, -4,
        -1, -1, -1, -1, -1, -1, -1, -1,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1,
        4, 2, 3, 5, 6, 3, 2, 4]);
    const colourToMove = useRef(1);
    const moveHistory = useRef<Move[]>([]);
    const historyIndex = useRef(0);
    const allMoves = useRef<Move[]>([]);

     /*
        -4, -2, -3, -5, -6, -3, -2, -4,
        -1, -1, -1, -1, -1, -1, -1, -1,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1,
        4, 2, 3, 5, 6, 3, 2, 4]);
        */

    const moveGeneratorService = new MoveGeneratorService();

    const reset = () => {
        setChosenSquare(-1);
        setPotentialMoves([]);
        setPotentialAttacks([]);
        setCurrentBoard([
            -4, -2, -3, -5, -6, -3, -2, -4,
            -1, -1, -1, -1, -1, -1, -1, -1,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1,
            4, 2, 3, 5, 6, 3, 2, 4]);
        allMoves.current = [];
        colourToMove.current = 1;
        moveHistory.current = [];
        historyIndex.current = 0;
        moveGeneratorService.resetGame(gameId);
    }

    const makeMove = (position: number, compMove: Move | null = null) => { //starting square is taken from state unless computer makes move
        const fromPos = compMove ? compMove.startSquare : chosenSquare;
        const piece = currentBoard[position];
        const colour = colourToMove.current;
        
        if (gameMode.startsWith("menu") || playerColour === 0) {
            return;
        }
        if (gameMode.startsWith("computer") && !compMove && colour === -playerColour) {
            return;
        }
        if (gameMode === "online" && compMove === null && playerColour !== colourToMove.current) {
            return;
        }
        if (historyIndex.current < moveHistory.current.length) {
            onNextMoveClicked(true);
        }
        if (allMoves.current.length === 0 && compMove === null) {
            moveGeneratorService
                .getAllMoves(gameId, colourToMove.current)
                .then(data => {
                    allMoves.current.push(...data);
                    if (allMoves.current.length > 0) {
                        makeMove(position, compMove);
                    }
            });
            return;
        }

        if (fromPos === -1 || isSameColour(currentBoard[position], currentBoard[fromPos])) {
            if (piece === 0 || !isSameColour(piece, colour)){ // ignore if clicked on empty square or on opponent's piece
                return;
            }
            const allMovesFromPosition: Move[] = [];
            const attacks: Move[] = [];
            allMoves.current.filter(move => move.startSquare === position).forEach(move => {
                if (currentBoard[move.targetSquare] !== 0) {
                    attacks.push(move);
                }
                allMovesFromPosition.push(move);
            });
            
            setPotentialAttacks(attacks);
            setPotentialMoves(allMovesFromPosition);
            setChosenSquare(position);
        } else {
            const move = compMove ? compMove : potentialMoves.find(move => move.targetSquare === position);
            if (move) {
                let tempBoard = currentBoard; //TODO: Should it be copied? Yes, but makeMove for computer uses currentBoard as well which would cancel user move. Need to find a solution
                tempBoard[move.targetSquare] = tempBoard[fromPos];
                tempBoard[move.startSquare] = Piece.EMPTY;

                if (move.castlingFlag) { //if king is doing castling, move rook accordingly
                    tempBoard[move.preCastlingPosition] = Piece.EMPTY;
                    tempBoard[move.postCastlingPosition] = Piece.ROOK*move.colour;
                } else if (move.enPassantFlag) {
                    tempBoard[move.enPassantPosition] = Piece.EMPTY;
                } else if (move.promotionFlag) {
                    tempBoard[move.targetSquare] = Piece.QUEEN*move.colour;
                }

                moveHistory.current.push(move);
                historyIndex.current++;
                allMoves.current = [];
                colourToMove.current = -colourToMove.current
                onPlayerToMoveChange();
                setCurrentBoard(tempBoard);
                console.log((colour > 0 ? "White" : "Black") + " from (" + move.fromX + ", " + move.fromY + ") to (" + move.toX + ", " + move.toY + "), tp: " + move.targetPiece);
                
                // update backend
                if (!compMove) { // comp move is handled inside a request to get bestMove
                    moveGeneratorService
                        .makeMove(gameId, move)
                        .then(gameResult => {
                            if (gameResult > 0) {
                                onGameEnd(move.colour, gameResult);
                                return;
                            } else if (gameMode.startsWith("computer")) {
                                makeComputerMove();
                            }
                        });
                }
                
            }
            setPotentialAttacks([]);
            setPotentialMoves([]);
            setChosenSquare(-1);
        }
    }
    
    // calls backend service to get best move for a computer; start and destination are coors of the player's last move
    const makeComputerMove = (id: number = gameId) => {
        moveGeneratorService
            .getBestMove(id, colourToMove.current)
            .then(move => {
                if (move.piece !== 0 && gameMode !== "menu") {
                    setChosenSquare(move.startSquare);
                    setPotentialMoves([move]);
                    makeMove(move.targetSquare, move);
                }
                if (move.gameResult > 0) {
                    onGameEnd(move.colour, move.gameResult);
                }
            })
            .catch(error => {
                console.error('There was an error:', error.message);
            });
    }

    const updateFetchedMove = (move: Move) => {
        setChosenSquare(move.startSquare);
        setPotentialMoves([move]);
        makeMove(move.targetSquare, move);
    }

    const isCellPartOfLastMove = (pos: number) => {
        if (historyIndex.current === 0) {
            return false;
        }
        const move = moveHistory.current[historyIndex.current-1];
        return (pos === move.startSquare || pos === move.targetSquare);
    }

    const onPrevMoveClicked = (fastBackward: boolean) => {
        setPotentialAttacks([]);
        setPotentialMoves([]);
        setChosenSquare(-1);
        if (fastBackward) {
            historyIndex.current = 0;
            setCurrentBoard([
                -4, -2, -3, -5, -6, -3, -2, -4,
                -1, -1, -1, -1, -1, -1, -1, -1,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0,
                1, 1, 1, 1, 1, 1, 1, 1,
                4, 2, 3, 5, 6, 3, 2, 4]);
                return true;
        }
        if (historyIndex.current-1 >= 0) {
            historyIndex.current--;
            const prevMove = moveHistory.current[historyIndex.current];
            const tempBoard = [...currentBoard];
            tempBoard[prevMove.startSquare] = tempBoard[prevMove.targetSquare];
            tempBoard[prevMove.targetSquare] = prevMove.targetPiece;
            if (prevMove.castlingFlag) {
                tempBoard[prevMove.preCastlingPosition] = prevMove.colour*Piece.ROOK;
                tempBoard[prevMove.postCastlingPosition] = 0;
            }
            if (prevMove.enPassantFlag) {
                tempBoard[prevMove.enPassantPosition] = -prevMove.colour*Piece.PAWN;
            }
            if (prevMove.promotionFlag) {
                tempBoard[prevMove.startSquare] = prevMove.colour*Piece.PAWN;
            }
            setCurrentBoard(tempBoard);
        }
        return true;
    }

    const onNextMoveClicked = (fastForwad: boolean) => {
        if (fastForwad) {
            let tempBoard = [...currentBoard];
            for (let i = historyIndex.current; i < moveHistory.current.length; i++) {
                tempBoard = updateBoardAfterMove(moveHistory.current[i], tempBoard);
                historyIndex.current++;
            }
            setCurrentBoard(tempBoard);
            return false;
        }
        if (historyIndex.current < moveHistory.current.length) {
            const nextMove = moveHistory.current[historyIndex.current];
            const tempBoard = [...currentBoard];
            setCurrentBoard(updateBoardAfterMove(nextMove, tempBoard));
            historyIndex.current++;
        }
        return historyIndex.current !== moveHistory.current.length;
    }

    const updateBoardAfterMove = (move: Move, board: number[]) => {
        board[move.targetSquare] = board[move.startSquare];
        board[move.startSquare] = 0;
        if (move.castlingFlag) {
            board[move.preCastlingPosition] = 0;
            board[move.postCastlingPosition] = Piece.ROOK*move.colour;
        }
        if (move.enPassantFlag) {
            board[move.enPassantPosition] = 0;
        }
        if (move.promotionFlag) {
            board[move.targetSquare] = Piece.QUEEN*move.colour;
        }
        return board;
    }

    const isSameColour = (piece: number, colour: number) => {
        return (piece > 0 && colour > 0) || (piece < 0 && colour < 0)
    }

    useEffect(() => {
        if (gameMode.startsWith("computer") && playerColour === -1 && colourToMove.current === -playerColour) {
            makeComputerMove();
        }
    }, [playerColour]);

    React.useImperativeHandle(ref, () => ({
        reset,
        makeComputerMove,
        onPrevMoveClicked,
        onNextMoveClicked,
        updateFetchedMove
    }));

    return (
        <>
            <div className={`board-container ${playerColour === -1 ? "board-rotated" : ""}`}>
                <div className={`board ${!gameMode.startsWith("menu") || historyIndex.current < moveHistory.current.length ? "board-active" : "" }`}>
                    {
                    currentBoard.map((element, index) => {
                        const row = Math.floor(index / 8);
                        const column = index % 8;
                        if ((row % 2 === 0 && column % 2 === 1) || (row % 2 === 1 && column % 2 === 0)) {
                            return(
                                <div
                                    key={index}
                                    onClick={() => makeMove(index)}
                                    className={`square
                                        ${playerColour === -1 ? "rotated-square" : ""}
                                        ${index === chosenSquare
                                            ? "chosen-square" 
                                            : isCellPartOfLastMove(index) ? "last-move-square-dark" : "dark-square"}`}>
                                    {element !== 0 && potentialAttacks.some(attack => attack.targetSquare === index) && 
                                        <div className={`outer-circle 
                                            ${isCellPartOfLastMove(index) ? "last-move-dark-circle" : " dark-gray-circle"}`}>
                                            <div className={`inner-circle
                                                ${isCellPartOfLastMove(index) ? "last-move-square-dark" : "dark-square"}`}>
                                                <Square piece={element}/>
                                            </div>
                                        </div>
                                    }
                                    {element !== 0 && !potentialAttacks.some(attack => attack.targetSquare === index) && <Square piece={element}/>}
                                    {element === 0 && potentialMoves.some(move => move.targetSquare === index) &&
                                        <div className={`${isCellPartOfLastMove(index) ? "last-move-dark-dot" : "dark-gray-dot"}`}></div>
                                    }
                                </div>
                            );
                        }
                        return(
                            <div
                                key={index}
                                onClick={() => makeMove(index)}
                                className={`square
                                    ${playerColour === -1 ? "rotated-square" : ""}
                                    ${index === chosenSquare
                                        ? "chosen-square"
                                        : isCellPartOfLastMove(index) ? "last-move-square-light" : "light-square"}`}>
                                {element !== 0 && potentialAttacks.some(attack => attack.targetSquare === index) && 
                                    <div className={`outer-circle
                                        ${isCellPartOfLastMove(index) ? "last-move-light-circle" : "light-gray-circle"}`}>
                                        <div className={`inner-circle
                                            ${isCellPartOfLastMove(index) ? "last-move-square-light" : "light-square"}`}>
                                            <Square piece={element}/>
                                        </div>
                                    </div>
                                }
                                {element !== 0 && !potentialAttacks.some(attack => attack.targetSquare === index) && <Square piece={element}/>}
                                {element === 0 && potentialMoves.some(move => move.targetSquare === index) &&
                                    <div className={`${isCellPartOfLastMove(index) ? "last-move-light-dot" : "light-gray-dot"}`}></div>
                                }
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
        )
});

export default Board;