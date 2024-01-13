import Square from "./Square";
import "../styles/Board.css"
import { useRef, useState } from "react";
import { copy2DArray, copy3DArray, getAttackMoves, getMoves, getValidMoves, isKingCheckmated, isSameColour } from "./Validator";
import React from "react";
import MoveGeneratorService from "../services/MoveGeneratorService";

interface Props {
    onGameEnd: (colour: number) => void,
    gameMode: string,
    playerColour: number
}

export enum Piece {
    EMPTY = 0,
    PAWN = 1,
    KNIGHT = 2,
    BISHOP = 3,
    ROOK = 4,
    QUEEN = 5,
    KING = 6
}

const Board = React.forwardRef(({onGameEnd, gameMode, playerColour}: Props, ref) => {
    const [chosenSquareX, setChosenSquareX] = useState(-1);
    const [chosenSquareY, setChosenSquareY] = useState(-1);
    const [potentialMoves, setPotentialMoves] = useState<number[][]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<number[][]>([]);
    const [lastMove, setLastMove] = useState<number[]>([-1, -1, -1, -1]); //coordinates of last move, index 0 and 1 are for square "from", index 2 and 3 are for square "to"
    const colourToMove = useRef(1);
    const [whiteKingPosition, setWhiteKingPosition] = useState([7, 4]);
    const [blackKingPosition, setBlackKingPosition] = useState([0, 6]);
    const [whiteCastling, setWhiteCastling] = useState([false, false, false]); //[hasKingMoved, hasLeftRookMoved, hasRightRookMoved]
    const [blackCastling, setBlackCastling] = useState([false, false, false]);
    const [whiteMoveHistory, setWhiteMoveHistory] = useState<number[][][]>([]); // not working for now
    const [whiteMoveHistoryIndex, setWhiteMoveHistoryIndex] = useState(-1); // not working for now
    const [blackMoveHistory, setBlackMoveHistory] = useState<number[][][]>([]); // not working for now
    const [blackMoveHistoryIndex, setBlackMoveHistoryIndex] = useState(-1); // not working for now
    const [currentBoard, setCurrentBoard] = useState([
        [-4, -2, -3, -5, -6, -3, -2, -4],
        [-1, -1, -1, -1, -1, -1, -1, -1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [4, 2, 3, 5, 6, 3, 2, 4]
    ]);

     /*
        [-4, -2, -3, -5, -6, -3, -2, -4],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [4, 2, 3, 5, 6, 3, 2, 4]
        */

    const moveGeneratorService = new MoveGeneratorService('http://localhost:8080');

    const reset = () => {
        setChosenSquareX(-1);
        setChosenSquareY(-1);
        setPotentialMoves([]);
        setPotentialAttacks([]);
        colourToMove.current = 1;
        setWhiteKingPosition([7, 4]);
        setBlackKingPosition([0, 4]);
        setWhiteCastling([false, false, false]);
        setBlackCastling([false, false, false]);
        setLastMove([-1, -1, -1, -1]);
        setCurrentBoard([
            [-4, -2, -3, -5, -6, -3, -2, -4],
            [-1, -1, -1, -1, -1, -1, -1, -1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [4, 2, 3, 5, 6, 3, 2, 4]
        ]);
        moveGeneratorService.resetBoard();
    }

    const makeMove = (cordinateX: number, cordinateY: number, compMove: number[] = [], color: number = colourToMove.current) => { //starting square is taken from state unless computer makes move
        const fromX = compMove.length > 0 ? compMove[0] : chosenSquareX;
        const fromY = compMove.length > 0 ? compMove[1] : chosenSquareY;
        const piece = currentBoard[cordinateX][cordinateY];

        if(gameMode.startsWith("menu")) {
            return;
        }
        if(gameMode.startsWith("computer") && compMove.length === 0 && color === -1) { //TODO: make it block moves when it's computers turn. For now it's working but fix it when it's possible to play with blacks
            return;
        }

        if(whiteMoveHistoryIndex+1 < whiteMoveHistory.length || blackMoveHistoryIndex+1 < blackMoveHistory.length) {
            return;
        }
        if((fromX === -1 && fromY === -1) || isSameColour(currentBoard[cordinateX][cordinateY], currentBoard[fromX][fromY])) {
            if(currentBoard[cordinateX][cordinateY] === 0){ // ignore if clicked on empty square
                return;
            }
            if(piece !== 0 && !isSameColour(piece, color)) { // ignore if clicked on the opponent's piece
                return;
            }
            const kingPosition = color > 0 ? whiteKingPosition : blackKingPosition;
            const castling = color > 0 ? whiteCastling : blackCastling;
            const validMoves = getValidMoves(piece, getMoves(piece, cordinateX, cordinateY, lastMove, currentBoard), cordinateX, cordinateY, kingPosition, castling, currentBoard);
            const attacks = getAttackMoves(piece, cordinateX, cordinateY, validMoves, currentBoard);
            
            setPotentialAttacks(attacks);
            setPotentialMoves(validMoves);
            setChosenSquareX(cordinateX);
            setChosenSquareY(cordinateY);
        } else {
            const pontentialMovesArray = compMove.length > 0 ? [[cordinateX-fromX, cordinateY-fromY]] : potentialMoves;
            if(pontentialMovesArray.some(m => fromX + m[0] === cordinateX && fromY + m[1] === cordinateY)) {
                let tempBoard = currentBoard;
                // WHITE CASTLING
                if(currentBoard[fromX][fromY] === Piece.KING) {
                    setWhiteKingPosition([cordinateX, cordinateY]);
                    setWhiteCastling([true, true, true]);
                    if(Math.abs(cordinateY - fromY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[7][0] = Piece.EMPTY;
                            tempBoard[7][3] = Piece.ROOK;
                        } else {
                            tempBoard[7][7] = Piece.EMPTY;
                            tempBoard[7][5] = Piece.ROOK;
                        }
                    }
                } 
                // BLACK CASTLING
                else if(currentBoard[fromX][fromY] === -Piece.KING) {
                    setBlackKingPosition([cordinateX, cordinateY]);
                    setBlackCastling([true, true, true]);
                    if(Math.abs(cordinateY - fromY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[0][0] = Piece.EMPTY;
                            tempBoard[0][3] = -Piece.ROOK;
                        } else {
                            tempBoard[0][7] = Piece.EMPTY;
                            tempBoard[0][5] = -Piece.ROOK;
                        }
                    }
                }
                //if you move a rook then disable castling
                if(Math.abs(currentBoard[fromX][fromY]) === Piece.ROOK) {
                    if(currentBoard[fromX][fromY] > 0 && fromX === 7 && (fromY === 0 || fromY === 7)) {
                        let tempCastling = whiteCastling;
                        tempCastling[fromY === 0 ? 1 : 2] = true;
                        setWhiteCastling(tempCastling);
                    } else if(currentBoard[fromX][fromY] < 0 && fromX === 0 && (fromY === 0 || fromY === 7)) {
                        let tempCastling = blackCastling;
                        tempCastling[fromY === 0 ? 1 : 2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                //if a rook is captured then disable castling
                if(Math.abs(tempBoard[cordinateX][cordinateY]) === Piece.ROOK) {
                    if(currentBoard[cordinateX][cordinateY] > 0 && cordinateX === 7 && (cordinateY === 0 || cordinateY === 7)) {
                        let tempCastling = whiteCastling;
                        tempCastling[cordinateY === 0 ? 1 : 2] = true;
                        setWhiteCastling(tempCastling);
                    } else if(currentBoard[cordinateX][cordinateY] < 0 && cordinateX === 0 && (cordinateY === 0 || cordinateY === 7)){
                        let tempCastling = blackCastling;
                        tempCastling[cordinateY === 0 ? 1 : 2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                // FIGURE MOVE
                if(Math.abs(currentBoard[fromX][fromY]) === Piece.PAWN ) {
                   if(Math.abs(cordinateY-fromY) === 1 && currentBoard[cordinateX][cordinateY] === 0) { //en passant move
                        tempBoard[fromX][cordinateY] = 0;
                    }  
                    if(cordinateX === 0 || cordinateX === 7) { // getting a pawn to the last row
                        tempBoard[cordinateX][cordinateY] = Piece.QUEEN * color;
                    } else {
                        tempBoard[cordinateX][cordinateY] = tempBoard[fromX][fromY];
                    } 
                }
                tempBoard[fromX][fromY] = 0;
                setLastMove([fromX, fromY, cordinateX, cordinateY]);
                console.log((color > 0 ? "White" : "Black") + " from (" + fromX + ", " + fromY + ") to (" + cordinateX + ", " + cordinateY + ")");
                setCurrentBoard(tempBoard);

                const colour = tempBoard[cordinateX][cordinateY] > 0 ? 1 : -1;
                const kingPosition = colour > 0 ? blackKingPosition : whiteKingPosition; //if whites just made a move check black king
                if(isKingCheckmated(kingPosition, colour, lastMove, currentBoard)){
                    onGameEnd(colour);
                } else {
                    addToBoardHistory(copy2DArray(tempBoard), piece > 0 ? 1 : -1)
                    colourToMove.current = -colourToMove.current //delete it for single player
                    if(gameMode.startsWith("computer") && compMove.length === 0) {
                        getComputerMove(-color, fromX*8+fromY, cordinateX*8+cordinateY);
                    }
                }
            }
            setPotentialAttacks([]);
            setPotentialMoves([]);
            setChosenSquareX(-1);
            setChosenSquareY(-1);
        }
    }
    //TODO: when the only move is king taking a queen, the king dissapears 
    const getComputerMove = (colour: number, start: number, destination: number) => { //TODO: make a feature so user can choose white or black
        colourToMove.current = colour;
        moveGeneratorService
            .getMoveData(start, destination, colour)
            .then(moveData => {
                const cors: string = moveData.toString();
                const fromX = parseInt(cors.charAt(0));
                const fromY = parseInt(cors.charAt(1));
                const toX = parseInt(cors.charAt(2));
                const toY = parseInt(cors.charAt(3));           
                setTimeout(() => {
                    setChosenSquareX(fromX);
                    setChosenSquareY(fromY);
                    setPotentialMoves([[toX-fromX, toY-fromY]]);
                    makeMove(toX, toY, [fromX, fromY], colour);
                }, 100);
                colourToMove.current = -colour;
            })
            .catch(error => {
                console.error('There was an error:', error.message);
            });
    }

    const convertBoard2String = () => {
        return currentBoard.map(row => row.join('')).join('');
    }

    const isCellPartOfLastMove = (x: number, y: number) => {
        return (x === lastMove[0] && y === lastMove[1]) || (x === lastMove[2] && y === lastMove[3])
    }

    const addToBoardHistory = (board: number[][], colour: number) => {
        if(colour > 0) {
            const tmpBoard = copy3DArray(whiteMoveHistory); //not working because useState is not updated before black makes move
            tmpBoard.push(board);
            setWhiteMoveHistory(tmpBoard);
            setWhiteMoveHistoryIndex(whiteMoveHistoryIndex+1)
        } else {
            const tmpBoard = copy3DArray(blackMoveHistory); //not working because useState is not updated before black makes move
            tmpBoard.push(board);
            setBlackMoveHistory(tmpBoard);
            setBlackMoveHistoryIndex(blackMoveHistoryIndex+1);
        }
        
    }

    const onPrevMoveClicked = () => {
        if(whiteMoveHistoryIndex-1 >= 0 && whiteMoveHistoryIndex > blackMoveHistoryIndex) {
            console.log("prev: " + whiteMoveHistoryIndex + ", " + whiteMoveHistory.length)
            setWhiteMoveHistoryIndex(whiteMoveHistoryIndex-1);
        } else if(blackMoveHistoryIndex-1 >= 0 && whiteMoveHistoryIndex <= blackMoveHistoryIndex) {
            console.log("prev: " + blackMoveHistoryIndex + ", " + blackMoveHistory.length)
            setWhiteMoveHistoryIndex(blackMoveHistoryIndex-1);
        }
        //setCurrentBoard(boardHistory[boardHistoryIndex]);
    }

    const onNextMoveClicked = () => {
        console.log("next")
    }

    React.useImperativeHandle(ref, () => ({
        reset,
    }));

    return (
        <>
            <div className={`board ${!gameMode.startsWith("menu") ? "board-active" : ""}`}>
                {
                currentBoard.map((row, rowIndex) => row.map((element, index) => {
                    if((rowIndex % 2 === 0 && index % 2 === 1) || (rowIndex % 2 === 1 && index % 2 === 0)) {
                        return(
                            <div
                                key={rowIndex + ", " + index}
                                onClick={() => makeMove(rowIndex, index)}
                                className={`square
                                    ${rowIndex === chosenSquareX && index === chosenSquareY 
                                        ? "chosen-square" 
                                        : isCellPartOfLastMove(rowIndex, index) ? "last-move-square-dark" : "dark-square"}`}>
                                {element !== 0 && potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && 
                                    <div className={`outer-circle 
                                        ${isCellPartOfLastMove(rowIndex, index) ? "last-move-dark-circle" : " dark-gray-circle"}`}>
                                        <div className={`inner-circle
                                            ${isCellPartOfLastMove(rowIndex, index) ? "last-move-square-dark" : "dark-square"}`}>
                                            <Square piece={element}/>
                                        </div>
                                    </div>
                                }
                                {element !== 0 && !potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && <Square piece={element}/>}
                                {element === 0 && potentialMoves.some(m => chosenSquareX + m[0] === rowIndex && chosenSquareY + m[1] === index) &&
                                    <div className={`${isCellPartOfLastMove(rowIndex, index) ? "last-move-dark-dot" : "dark-gray-dot"}`}></div>
                                }
                            </div>
                        );
                    }
                    return(
                        <div
                            key={rowIndex+index}
                            onClick={() => makeMove(rowIndex, index)}
                            className={`square ${rowIndex === chosenSquareX && index === chosenSquareY 
                                ? "chosen-square"
                                : isCellPartOfLastMove(rowIndex, index) ? "last-move-square-light" : "light-square"}`}>
                            {element !== 0 && potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && 
                                <div className={`outer-circle 
                                    ${isCellPartOfLastMove(rowIndex, index) ? "last-move-light-circle" : "light-gray-circle"}`}>
                                    <div className={`inner-circle
                                        ${isCellPartOfLastMove(rowIndex, index) ? "last-move-square-light" : "light-square"}`}>
                                        <Square piece={element}/>
                                    </div>
                                </div>
                            }
                            {element !== 0 && !potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && <Square piece={element}/>}
                            {element === 0 && potentialMoves.some(m => chosenSquareX + m[0] === rowIndex && chosenSquareY + m[1] === index) &&
                                <div className={`${isCellPartOfLastMove(rowIndex, index) ? "last-move-light-dot" : "light-gray-dot"}`}></div>
                            }
                        </div>
                    );
                }))}
            </div>
            <div className="under-board">
                <div className="timer">Time</div>
                <div className="move-buttons-container">
                    <div className="prev-move-button" onClick={onPrevMoveClicked}>Prev</div>
                    <div className="next-move-button" onClick={onNextMoveClicked}>Next</div>
                </div>
            </div>
        </>
        )
});

export default Board;