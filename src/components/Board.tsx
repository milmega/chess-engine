import Square from "./Square";
import "../styles/Board.css"
import { useState } from "react";
import { getAttackMoves, getMoves, getValidMoves, isKingCheckmated, isSameColour } from "./Validator";
import React from "react";
import MoveGeneratorService from "../services/MoveGeneratorService";

interface Props {
    onGameEnd: (colour: number) => void,
    gameMode: string,
    playerColour: boolean
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
    const [colourToMove, setColourToMove] = useState(1);
    const [whiteKingPosition, setWhiteKingPosition] = useState([7, 4]);
    const [blackKingPosition, setBlackKingPosition] = useState([0, 4]);
    const [whiteCastling, setWhiteCastling] = useState([false, false, false]); //[hasKingMoved, hasLeftRookMoved, hasRightRookMoved]
    const [blackCastling, setBlackCastling] = useState([false, false, false]);
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
    const moveGeneratorService = new MoveGeneratorService('http://localhost:8080');

    const reset = () => {
        setChosenSquareX(-1);
        setChosenSquareY(-1);
        setPotentialMoves([]);
        setPotentialAttacks([]);
        setColourToMove(1);
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
    }

    const makeMove = (cordinateX: number, cordinateY: number, compMove: number[] = []) => { //starting square is taken from state unless computer makes move
        const fromX = compMove.length > 0 ? compMove[0] : chosenSquareX;
        const fromY = compMove.length > 0 ? compMove[1] : chosenSquareY;
        const piece = currentBoard[cordinateX][cordinateY];

        if(gameMode.startsWith("menu")) {
            return;
        }
        if((fromX === -1 && fromY === -1) || isSameColour(currentBoard[cordinateX][cordinateY], currentBoard[fromX][fromY])) {
            if(currentBoard[cordinateX][cordinateY] === 0){ //ignore if clicked on empty square
                return;
            }
            if(piece !== 0 && !isSameColour(piece, colourToMove)) { //ignore if clicked on the opponent's piece
                return;
            }
            const kingPosition = colourToMove > 0 ? whiteKingPosition : blackKingPosition;
            const castling = colourToMove ? whiteCastling : blackCastling;
            const validMoves = getValidMoves(piece, getMoves(piece, cordinateX, cordinateY, currentBoard), cordinateX, cordinateY, kingPosition, castling, currentBoard);
            const attacks = getAttackMoves(piece, cordinateX, cordinateY, validMoves, currentBoard);
    
            setPotentialAttacks(attacks);
            setPotentialMoves(validMoves);
            setChosenSquareX(cordinateX);
            setChosenSquareY(cordinateY);
        } else {
            const pontentialMovesArray = compMove.length > 0 ? [[cordinateX-fromX, cordinateY-fromY]] : potentialMoves;
            if(pontentialMovesArray.some(m => fromX + m[0] === cordinateX && fromY + m[1] === cordinateY)) {
                let tempBoard = currentBoard;
                // FIGURE MOVE
                if(Math.abs(currentBoard[fromY][fromY]) === Piece.PAWN && (cordinateX === 0 || cordinateX === 7)) {
                    tempBoard[cordinateX][cordinateY] = Piece.QUEEN * colourToMove;
                } else {
                    tempBoard[cordinateX][cordinateY] = tempBoard[fromX][fromY];
                }
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
                    if(currentBoard[fromX][fromY] > 0) {
                        let tempCastling = whiteCastling;
                        tempCastling[1] = true;
                        setWhiteCastling(tempCastling);
                    } else {
                        let tempCastling = blackCastling;
                        tempCastling[2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                tempBoard[fromX][fromY] = 0;
                setLastMove([fromX, fromY, cordinateX, cordinateY]);
                setCurrentBoard(tempBoard);

                const kingPosition = colourToMove > 0 ? blackKingPosition : whiteKingPosition; //if whites just made a move check black king
                if(isKingCheckmated(kingPosition, colourToMove, currentBoard)){
                    onGameEnd(colourToMove);
                } 
                
                if(compMove.length === 0) {
                    computeComputerMove(-colourToMove);
                }
            }
            setPotentialAttacks([]);
            setPotentialMoves([]);
            setChosenSquareX(-1);
            setChosenSquareY(-1);
        }
    }

    const computeComputerMove = (colour: number) => { //TODO: make a feature so user can choose white or black
        const whiteKing = whiteKingPosition[0]*8 + whiteKingPosition[1];
        const blackKing = blackKingPosition[0]*8 + blackKingPosition[1];
        const wCastling = (Number(whiteCastling[0]) * 100).toString() + (Number(whiteCastling[1]) * 10).toString() + Number(whiteCastling[2]).toString();
        const bCastling = (Number(blackCastling[0]) * 100 ).toString() + (Number(blackCastling[1]) * 10).toString() + Number(blackCastling[2]);
        moveGeneratorService
            .getMoveData(convertBoard2String(), colour, whiteKing, blackKing, wCastling, bCastling)
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
                    makeMove(toX, toY, [fromX, fromY]);
                }, 1500);
                setColourToMove(-colour); 
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

    React.useImperativeHandle(ref, () => ({
        reset,
    }));

    return (
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
        )
});

export default Board;