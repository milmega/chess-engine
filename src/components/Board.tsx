import Square from "./Square";
import "../styles/Board.css"
import { useState } from "react";
import { getAttackMoves, getMoves, getValidMoves, isKingCheckmated, isPieceSameColour, isSameColour } from "./Validator";
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

    const makeMove = (piece: number, cordinateX: number, cordinateY: number) => {
        if(gameMode.startsWith("menu")) {
            return;
        }
        if((chosenSquareX === -1 && chosenSquareY === -1) || isPieceSameColour(currentBoard[cordinateX][cordinateY], currentBoard[chosenSquareX][chosenSquareY])) {
            if(currentBoard[cordinateX][cordinateY] === 0){
                return;
            }
            if(piece !== 0 && !isSameColour(piece, colourToMove)) {
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
            if(potentialMoves.some(m => chosenSquareX + m[0] === cordinateX && chosenSquareY + m[1] === cordinateY)) {
                let tempBoard = currentBoard;
                
                if(Math.abs(currentBoard[chosenSquareX][chosenSquareY]) === Piece.PAWN && (cordinateX === 0 || cordinateX === 7)) {
                    tempBoard[cordinateX][cordinateY] = Piece.QUEEN * colourToMove;
                } else {
                    tempBoard[cordinateX][cordinateY] = tempBoard[chosenSquareX][chosenSquareY];
                }
                if(currentBoard[chosenSquareX][chosenSquareY] === Piece.KING) {
                    setWhiteKingPosition([cordinateX, cordinateY]);
                    setWhiteCastling([true, true, true]);
                    if(Math.abs(cordinateY - chosenSquareY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[7][0] = Piece.EMPTY;
                            tempBoard[7][3] = Piece.ROOK;
                        } else {
                            tempBoard[7][7] = Piece.EMPTY;
                            tempBoard[7][5] = Piece.ROOK;
                        }
                    }
                }
                else if(currentBoard[chosenSquareX][chosenSquareY] === -Piece.KING) {
                    setBlackKingPosition([cordinateX, cordinateY]);
                    setBlackCastling([true, true, true]);
                    if(Math.abs(cordinateY - chosenSquareY) > 1) { //if king is doing castling, move rook accordingly
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
                if(Math.abs(currentBoard[chosenSquareX][chosenSquareY]) === Piece.ROOK) {
                    if(currentBoard[chosenSquareX][chosenSquareY] > 0) {
                        let tempCastling = whiteCastling;
                        tempCastling[1] = true;
                        setWhiteCastling(tempCastling);
                    } else {
                        let tempCastling = blackCastling;
                        tempCastling[2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                tempBoard[chosenSquareX][chosenSquareY] = 0;
                setCurrentBoard(tempBoard);

                const kingPosition = colourToMove > 0 ? blackKingPosition : whiteKingPosition; //if whites just made a move check black king
                if(isKingCheckmated(kingPosition, colourToMove, currentBoard)){
                    onGameEnd(colourToMove);
                } 
                setColourToMove(-colourToMove);
                //computeComputerMove()
            }
            setPotentialAttacks([]);
            setPotentialMoves([]);
            setChosenSquareX(-1);
            setChosenSquareY(-1);
        }
    }

    const computeComputerMove = (colour: boolean) => { //TODO: make a feature so user can choose white or black
        moveGeneratorService
            .getMoveData(convertBoard2String(), colour)
            .then(moveData => {
                const cors: string = moveData.toString();
                const fromX = parseInt(cors.charAt(0));
                const fromY = parseInt(cors.charAt(1));
                const toX = parseInt(cors.charAt(2));
                const toY = parseInt(cors.charAt(3));
                let tempBoard = currentBoard;
                tempBoard[+toX][+toY] = tempBoard[+fromX][+fromY];
                tempBoard[+fromX][+fromY] = 0;
                setCurrentBoard(tempBoard);
                setColourToMove(1); //TODO: adjust it so it updated colour to move
                 
            })
            .catch(error => {
                console.error('There was an error:', error.message);
            });
    }

    const convertBoard2String = () => { //TODO: rewrite current board so it uses ints
        return currentBoard.map(row => row.join('')).join('');
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
                            onClick={() => makeMove(element, rowIndex, index)}
                            className={`square
                            ${rowIndex === chosenSquareX && index === chosenSquareY ? "chosen-square" : "dark-square"}`}>
                            {element !== 0 && potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && 
                                <div className="outer-circle dark-gray-circle">
                                    <div className="inner-circle dark-square">
                                        <Square piece={element}/>
                                    </div>
                                </div>
                            }
                            {element !== 0 && !potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && <Square piece={element}/>}
                            {element === 0 && potentialMoves.some(m => chosenSquareX + m[0] === rowIndex && chosenSquareY + m[1] === index) &&  <div className="dark-gray-dot"></div>}
                        </div>
                    );
                }
                return(
                    <div
                        key={rowIndex+index}
                        onClick={() => makeMove(element, rowIndex, index)}
                        className={`square ${rowIndex === chosenSquareX && index === chosenSquareY ? "chosen-square" : "light-square"}`}>
                        {element !== 0 && potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && 
                            <div className="outer-circle light-gray-circle">
                                <div className="inner-circle light-square">
                                    <Square piece={element}/>
                                </div>
                            </div>
                        }
                        {element !== 0 && !potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && <Square piece={element}/>}
                        {element === 0 && potentialMoves.some(m => chosenSquareX + m[0] === rowIndex && chosenSquareY + m[1] === index) && <div className="light-gray-dot"></div>}
                    </div>
                );
            }))}
        </div>
        )
});

export default Board;