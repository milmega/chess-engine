import Square from "./Square";
import "../styles/Board.css"
import { useEffect, useRef, useState } from "react";
import { generateAllMoves, getAttackMoves, getValidMoves, isInCheck, isSameColour, isDraw } from "./MoveGenerator";
import React from "react";
import MoveGeneratorService from "../services/MoveGeneratorService";
import { Piece } from "./Piece";
import { Move } from "./Move";

interface Props {
    onGameEnd: (colour: number, drawDetails: string) => void,
    gameMode: string,
    playerColour: number
}

const Board = React.forwardRef(({onGameEnd, gameMode, playerColour}: Props, ref) => {
    const [chosenSquare, setChosenSquare] = useState(-1);
    const [potentialMoves, setPotentialMoves] = useState<Move[]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<Move[]>([]);
    const [whiteKingPosition, setWhiteKingPosition] = useState(60);
    const [blackKingPosition, setBlackKingPosition] = useState(4);
    const [whiteCastling, setWhiteCastling] = useState([false, false, false]); //[hasKingMoved, hasLeftRookMoved, hasRightRookMoved]
    const [blackCastling, setBlackCastling] = useState([false, false, false]);
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
    const material = useRef<number[][]>([[0, 8, 2, 2, 2, 1, 1], [0, 8, 2, 2, 2, 1, 1]]); //white material, blackMaterial
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

    const moveGeneratorService = new MoveGeneratorService('http://localhost:8080');

    const reset = () => {
        setChosenSquare(-1);
        setPotentialMoves([]);
        setPotentialAttacks([]);
        setWhiteKingPosition(60);
        setBlackKingPosition(4);
        setWhiteCastling([false, false, false]);
        setBlackCastling([false, false, false]);
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
        material.current = [[0, 8, 2, 2, 2, 1, 1], [0, 8, 2, 2, 2, 1, 1]];
        moveHistory.current = [];
        historyIndex.current = 0;
        moveGeneratorService.resetBoard();
    }

    const makeMove = (position: number, compMove: Move | null = null) => { //starting square is taken from state unless computer makes move
        const fromPos = compMove ? compMove.startSquare : chosenSquare;
        const piece = currentBoard[position];
        const colour = colourToMove.current;
        
        if(gameMode.startsWith("menu")) {
            return;
        }
        if(gameMode.startsWith("computer") && !compMove && colour === -playerColour) {
            return;
        }
        if(playerColour === 0) { // if the player has not chosen a colour return
            return;
        }
        if(historyIndex.current+1 < moveHistory.current.length) {
            //TODO: show prompt
            return;
        }

        if(allMoves.current.length === 0 && compMove === null) {
            moveGeneratorService
            .getAllMoves(colourToMove.current)
            .then(data => {
                allMoves.current.push(...data);
                makeMove(position, compMove);
            });
            return;
        }

        if(fromPos === -1 || isSameColour(currentBoard[position], currentBoard[fromPos])) {
            if(piece === 0 || !isSameColour(piece, colour)){ // ignore if clicked on empty square or on opponent's piece
                return;
            }
            const allMovesFromPosition: Move[] = [];
            const attacks: Move[] = [];
            allMoves.current.filter(move => move.startSquare === position).forEach(move => {
                if(currentBoard[move.targetSquare] !== 0) {
                    attacks.push(move);
                }
                allMovesFromPosition.push(move);
            });
            
            setPotentialAttacks(attacks);
            setPotentialMoves(allMovesFromPosition);
            setChosenSquare(position);
        } else {
            const move = compMove ? compMove : potentialMoves.find(move => move.targetSquare === position);
            if(move) {
                let tempBoard = currentBoard; //TODO: Should it be copied? Yes, but makeMove for computer uses currentBoard as well which would cancel user move. Need to find a solution
                // CASTLING
                if (Math.abs(move.piece) === Piece.KING) {
                    setWhiteKingPosition(move.targetSquare);
                    if(move.colour > 0) {
                        setWhiteCastling([true, true, true]);
                    } else {
                        setBlackCastling([true, true, true]);
                    }
                    if (move.castlingFlag) { //if king is doing castling, move rook accordingly
                        tempBoard[move.preCastlingPosition] = Piece.EMPTY;
                        tempBoard[move.postCastlingPosition] = Piece.ROOK*move.colour;
                    }
                }
                // PIECE MOVE
                if(move.enpassantFlag) {
                    tempBoard[move.enpassantPosition] = Piece.EMPTY;
                    material.current[move.colour > 0 ? 1 : 0][Piece.PAWN]--;
                }
                if(move.promotionFlag) {
                    tempBoard[move.targetSquare] = Piece.QUEEN*move.colour;
                    material.current[move.colour > 0 ? 0 : 1][Piece.QUEEN]++;
                    material.current[move.colour > 0 ? 0 : 1][Piece.PAWN]--;
                } else {
                    tempBoard[move.targetSquare] = tempBoard[fromPos];
                }
                if(move.targetPiece !== Piece.EMPTY) {
                    material.current[move.targetPiece > 0 ? 0 : 1][Math.abs(move.targetPiece)]--;
                }
                tempBoard[move.startSquare] = Piece.EMPTY;

                // update backend
                moveGeneratorService.makeMove(move); //TODO: get response from backend if its a checkmate or draw
                moveHistory.current.push(move);
                historyIndex.current++;
                allMoves.current = [];
                
                console.log((colour > 0 ? "White" : "Black") + " from (" + move.fromX + ", " + move.fromY + ") to (" + move.toX + ", " + move.toY + "), tp: " + move.targetPiece);
                setCurrentBoard(tempBoard);

                const kingPosition = colour > 0 ? blackKingPosition : whiteKingPosition; //if whites just made a move check black king
                const inCheck = isInCheck(kingPosition, tempBoard);
                const possibleMoves = generateAllMoves(-colour, kingPosition, colour > 0 ? blackCastling : whiteCastling, moveHistory.current[historyIndex.current-1], tempBoard);
                
                const drawReason = isDraw(material.current, moveHistory.current, tempBoard);
                if(possibleMoves.length === 0){
                    onGameEnd(inCheck ? colour : 0, ""); //declare a winner after a checkmate or a stalemate
                } else if(drawReason.length > 0) {
                    onGameEnd(0, drawReason); //declare a draw and provide a reason
                } else {
                    colourToMove.current = -colourToMove.current
                    if(gameMode.startsWith("computer") && !compMove) {
                        makeComputerMove();
                    }
                }
            }
            setPotentialAttacks([]);
            setPotentialMoves([]);
            setChosenSquare(-1);
        }
    }
    
    // calls backend service to get best move for a copouter; start and destination are coors of the player's last move
    const makeComputerMove = () => {
        moveGeneratorService
            .getBestMove(colourToMove.current)
            .then(move => {       
                setTimeout(() => {
                    setChosenSquare(move.startSquare);
                    setPotentialMoves([move]);
                    makeMove(move.targetSquare, move);
                }, 100);
                colourToMove.current = -colourToMove.current;
            })
            .catch(error => {
                console.error('There was an error:', error.message);
            });
    }

    const isCellPartOfLastMove = (pos: number) => {
        if(historyIndex.current === 0) {
            return false;
        }
        const move = moveHistory.current[historyIndex.current-1];
        return (pos === move.startSquare || pos === move.targetSquare);
    }

    const onPrevMoveClicked = (fastBackward: boolean) => {
        setPotentialAttacks([]);
        setPotentialMoves([]);
        setChosenSquare(-1);
        if(fastBackward) {
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
                return;
        }
        if(historyIndex.current-1 >= 0) {
            historyIndex.current--;
            const prevMove = moveHistory.current[historyIndex.current];
            const tempBoard = [...currentBoard]; //TODO: make sure it's copied like here in other places as well
            tempBoard[prevMove.startSquare] = tempBoard[prevMove.targetSquare];
            tempBoard[prevMove.targetSquare] = prevMove.targetPiece;
            if(prevMove.castlingFlag) {
                tempBoard[prevMove.preCastlingPosition] = prevMove.colour*Piece.ROOK;
                tempBoard[prevMove.postCastlingPosition] = 0;
            }
            if(prevMove.enpassantFlag) {
                tempBoard[prevMove.enpassantPosition] = -prevMove.colour*Piece.PAWN;
            }
            if(prevMove.promotionFlag) {
                tempBoard[prevMove.startSquare] = prevMove.colour*Piece.PAWN;
            }
            setCurrentBoard(tempBoard);
        }
    }

    const onNextMoveClicked = (fastForwad: boolean) => {
        if(fastForwad) {
            let tempBoard = [...currentBoard];
            for(let i = historyIndex.current; i < moveHistory.current.length; i++) {
                tempBoard = updateBoardAfterMove(moveHistory.current[i], tempBoard);
                historyIndex.current++;
            }
            setCurrentBoard(tempBoard);
            return;
        }
        if(historyIndex.current < moveHistory.current.length) {
            const nextMove = moveHistory.current[historyIndex.current];
            const tempBoard = [...currentBoard]; //TODO: make sure it's copied like here in other places as well
            setCurrentBoard(updateBoardAfterMove(nextMove, tempBoard));
            historyIndex.current++;
        }
    }

    const updateBoardAfterMove = (move: Move, board: number[]) => {
        board[move.targetSquare] = board[move.startSquare];
        board[move.startSquare] = 0;
        if(move.castlingFlag) {
            board[move.preCastlingPosition] = 0;
            board[move.postCastlingPosition] = Piece.ROOK*move.colour;
        }
        if(move.enpassantFlag) {
            board[move.enpassantPosition] = 0;
        }
        if(move.promotionFlag) {
            board[move.targetSquare] = Piece.QUEEN*move.colour;
        }
        return board;
    }

    useEffect(() => {
        if(gameMode.startsWith("computer") && playerColour === -1 && colourToMove.current === -playerColour) {
            makeComputerMove();
        }
    }, [playerColour]);

    React.useImperativeHandle(ref, () => ({
        reset,
        onPrevMoveClicked,
        onNextMoveClicked
    }));

    return (
        <>
            <div className={`board ${!gameMode.startsWith("menu") ? "board-active" : "" } ${playerColour === -1 ? "board-rotated" : ""}`}>
                {
                currentBoard.map((element, index) => {
                    const row = Math.floor(index / 8);
                    const column = index % 8;
                    if((row % 2 === 0 && column % 2 === 1) || (row % 2 === 1 && column % 2 === 0)) {
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
        </>
        )
});

export default Board;