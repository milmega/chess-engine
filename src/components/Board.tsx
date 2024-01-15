import Square from "./Square";
import "../styles/Board.css"
import { useEffect, useRef, useState } from "react";
import { copy2DArray, copy3DArray, getAttackMoves, getMoves, getValidMoves, isKingCheckmated, isSameColour } from "./Validator";
import React from "react";
import MoveGeneratorService from "../services/MoveGeneratorService";
import { Piece } from "./Piece";

interface Props {
    onGameEnd: (colour: number) => void,
    gameMode: string,
    playerColour: number
}

const Board = React.forwardRef(({onGameEnd, gameMode, playerColour}: Props, ref) => {
    const [chosenSquare, setChosenSquare] = useState(-1);
    const [potentialMoves, setPotentialMoves] = useState<number[][]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<number[]>([]);
    const lastMove = useRef<number[]>([]);
    const colourToMove = useRef(1);
    const [whiteKingPosition, setWhiteKingPosition] = useState(60);
    const [blackKingPosition, setBlackKingPosition] = useState(4);
    const [whiteCastling, setWhiteCastling] = useState([false, false, false]); //[hasKingMoved, hasLeftRookMoved, hasRightRookMoved]
    const [blackCastling, setBlackCastling] = useState([false, false, false]);
    const [whiteMoveHistory, setWhiteMoveHistory] = useState<number[][][]>([]); // not working for now
    const [whiteMoveHistoryIndex, setWhiteMoveHistoryIndex] = useState(-1); // not working for now
    const [blackMoveHistory, setBlackMoveHistory] = useState<number[][][]>([]); // not working for now
    const [blackMoveHistoryIndex, setBlackMoveHistoryIndex] = useState(-1); // not working for now
    const [currentBoard, setCurrentBoard] = useState([
        -4, -2, -3, -5, -6, -3, -2, -4,
        -1, -1, -1, -1, -1, -1, -1, -1,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1, 1, 1,
        4, 2, 3, 5, 6, 3, 2, 4]);

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
        setChosenSquare(-1);
        setPotentialMoves([]);
        setPotentialAttacks([]);
        colourToMove.current = 1;
        setWhiteKingPosition(60);
        setBlackKingPosition(4);
        setWhiteCastling([false, false, false]);
        setBlackCastling([false, false, false]);
        lastMove.current = [];
        setCurrentBoard([
            -4, -2, -3, -5, -6, -3, -2, -4,
            -1, -1, -1, -1, -1, -1, -1, -1,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1,
            4, 2, 3, 5, 6, 3, 2, 4]);
        moveGeneratorService.resetBoard();
    }

    const makeMove = (position: number, compMove: number = -1, color: number = colourToMove.current) => { //starting square is taken from state unless computer makes move
        const fromX = compMove > -1 ? Math.floor(compMove / 8) : Math.floor(chosenSquare / 8);
        const fromY = compMove > -1 ? compMove % 8 : chosenSquare % 8;
        const fromPos = compMove > -1 ? compMove : chosenSquare;
        const cordinateX = Math.floor(position / 8);
        const cordinateY = position % 8;
        const piece = currentBoard[position];

        if(gameMode.startsWith("menu")) {
            return;
        }
        if(gameMode.startsWith("computer") && compMove === -1 && color === -playerColour) {
            return;
        }
        if(playerColour === 0) { // if the player has not chosen a colour return
            return;
        }
        if(whiteMoveHistoryIndex+1 < whiteMoveHistory.length || blackMoveHistoryIndex+1 < blackMoveHistory.length) {
            return;
        }
        if(fromPos === -1 || isSameColour(currentBoard[position], currentBoard[fromPos])) {
            if(piece === 0 || !isSameColour(piece, color)){ // ignore if clicked on empty square or on opponent's piece
                return;
            }
            const kingPosition = color > 0 ? whiteKingPosition : blackKingPosition;
            const castling = color > 0 ? whiteCastling : blackCastling;
            const validMoves = getValidMoves(piece, getMoves(piece, position, lastMove.current, currentBoard), position, kingPosition, castling, currentBoard);
            const attacks = getAttackMoves(piece, position, validMoves, currentBoard);
            setPotentialAttacks(attacks);
            setPotentialMoves(validMoves);
            setChosenSquare(position);
        } else {
            const pontentialMovesArray = compMove > -1 ? [[cordinateX-fromX, cordinateY-fromY]] : potentialMoves;
            if(pontentialMovesArray.some(m => fromX + m[0] === cordinateX && fromY + m[1] === cordinateY)) {
                let tempBoard = currentBoard;
                // WHITE CASTLING
                if(currentBoard[fromPos] === Piece.KING) {
                    setWhiteKingPosition(position);
                    setWhiteCastling([true, true, true]);
                    if(Math.abs(cordinateY - fromY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[56] = Piece.EMPTY;
                            tempBoard[59] = Piece.ROOK;
                        } else {
                            tempBoard[63] = Piece.EMPTY;
                            tempBoard[61] = Piece.ROOK;
                        }
                    }
                } 
                // BLACK CASTLING
                else if(currentBoard[fromPos] === -Piece.KING) {
                    setBlackKingPosition(position);
                    setBlackCastling([true, true, true]);
                    if(Math.abs(cordinateY - fromY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[0] = Piece.EMPTY;
                            tempBoard[3] = -Piece.ROOK;
                        } else {
                            tempBoard[7] = Piece.EMPTY;
                            tempBoard[5] = -Piece.ROOK;
                        }
                    }
                }
                //if you move a rook then disable castling
                if(Math.abs(currentBoard[fromPos]) === Piece.ROOK) {
                    if(currentBoard[fromPos] > 0 && fromX === 7 && (fromY === 0 || fromY === 7)) {
                        let tempCastling = whiteCastling;
                        tempCastling[fromY === 0 ? 1 : 2] = true;
                        setWhiteCastling(tempCastling);
                    } else if(currentBoard[fromPos] < 0 && fromX === 0 && (fromY === 0 || fromY === 7)) {
                        let tempCastling = blackCastling;
                        tempCastling[fromY === 0 ? 1 : 2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                //if a rook is captured then disable castling
                if(Math.abs(tempBoard[position]) === Piece.ROOK) {
                    if(currentBoard[position] > 0 && cordinateX === 7 && (cordinateY === 0 || cordinateY === 7)) {
                        let tempCastling = whiteCastling;
                        tempCastling[cordinateY === 0 ? 1 : 2] = true;
                        setWhiteCastling(tempCastling);
                    } else if(currentBoard[position] < 0 && cordinateX === 0 && (cordinateY === 0 || cordinateY === 7)){
                        let tempCastling = blackCastling;
                        tempCastling[cordinateY === 0 ? 1 : 2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                // FIGURE MOVE
                if(Math.abs(currentBoard[fromPos]) === Piece.PAWN ) {
                   if(Math.abs(cordinateY-fromY) === 1 && currentBoard[position] === 0) { //en passant move
                        tempBoard[fromX*8+cordinateY] = 0;
                    }  
                    if(cordinateX === 0 || cordinateX === 7) { // getting a pawn to the last row
                        tempBoard[position] = Piece.QUEEN * color;
                    } else {
                        tempBoard[position] = tempBoard[fromPos];
                    } 
                } else {
                    tempBoard[position] = tempBoard[fromPos];
                }
                tempBoard[fromPos] = 0;
                lastMove.current = [fromPos, position];
                console.log((color > 0 ? "White" : "Black") + " from (" + fromX + ", " + fromY + ") to (" + Math.floor(position/8) + ", " + position%8 + ")");
                setCurrentBoard(tempBoard);

                const colour = tempBoard[position] > 0 ? 1 : -1;
                const kingPosition = colour > 0 ? blackKingPosition : whiteKingPosition; //if whites just made a move check black king
                if(isKingCheckmated(kingPosition, colour, lastMove.current, currentBoard)){
                    onGameEnd(colour);
                } else {
                    //addToBoardHistory(copy2DArray(tempBoard), piece > 0 ? 1 : -1)
                    //colourToMove.current = -colourToMove.current //delete it for single player /  add it for testing
                    if(gameMode.startsWith("computer") && compMove === -1) {
                        makeComputerMove(-color, fromPos, position);
                    }
                }
            }
            setPotentialAttacks([]);
            setPotentialMoves([]);
            setChosenSquare(-1);
        }
    }
    
    // calls backend service to get best move for a copouter; start and destination are coors of the player's last move
    const makeComputerMove = (colour: number, start: number, destination: number) => {
        colourToMove.current = colour;
        moveGeneratorService
            .getMoveData(start, destination, colour)
            .then(moveData => {
                const cors: string[] = moveData.toString().split(',');
                const fromPos = parseInt(cors[0]);
                const toPos = parseInt(cors[1]);        
                setTimeout(() => {
                    setChosenSquare(fromPos);
                    setPotentialMoves([[Math.floor(toPos/8)-Math.floor(fromPos/8), toPos%8-fromPos%8]]);
                    console.log("az", toPos, fromPos, colour);
                    makeMove(toPos, fromPos, colour);
                }, 100);
                colourToMove.current = -colour;
            })
            .catch(error => {
                console.error('There was an error:', error.message);
            });
    }

    /*const convertBoard2String = () => {
        return currentBoard.map(element => element.join(''));
    }*/

    const isCellPartOfLastMove = (pos: number) => {
        return (pos === lastMove.current[0] || pos === lastMove.current[1]);
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

    useEffect(() => {
        if(gameMode.startsWith("computer") && playerColour === -1 && colourToMove.current === -playerColour) {
            makeComputerMove(1, -1, -1);
        }
    }, [playerColour]);

    React.useImperativeHandle(ref, () => ({
        reset,
    }));

    return (
        <>
            <div className={`board ${!gameMode.startsWith("menu") ? "board-active" : "" } ${playerColour === -1 ? "board-rotated" : ""}`}>
                {
                currentBoard.map((element, index) => {
                    const row = Math.floor(index / 8);
                    const column = index % 8;
                    const chosenX = Math.floor(chosenSquare / 8);
                    const chosenY = chosenSquare % 8;
                    if((row % 2 === 0 && column % 2 === 1) || (row % 2 === 1 && column % 2 === 0)) {
                        return(
                            <div
                                key={index}
                                onClick={() => makeMove(index)}
                                className={`square
                                    ${playerColour === -1 ? "rotated-square" : ""}
                                    ${row === chosenX && column === chosenY
                                        ? "chosen-square" 
                                        : isCellPartOfLastMove(index) ? "last-move-square-dark" : "dark-square"}`}>
                                {element !== 0 && potentialAttacks.some(attack => attack === index) && 
                                    <div className={`outer-circle 
                                        ${isCellPartOfLastMove(index) ? "last-move-dark-circle" : " dark-gray-circle"}`}>
                                        <div className={`inner-circle
                                            ${isCellPartOfLastMove(index) ? "last-move-square-dark" : "dark-square"}`}>
                                            <Square piece={element}/>
                                        </div>
                                    </div>
                                }
                                {element !== 0 && !potentialAttacks.some(attack => attack === index) && <Square piece={element}/>}
                                {element === 0 && potentialMoves.some(m => chosenX + m[0] === row && chosenY + m[1] === column) &&
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
                                ${row === chosenX && column === chosenY
                                    ? "chosen-square"
                                    : isCellPartOfLastMove(index) ? "last-move-square-light" : "light-square"}`}>
                            {element !== 0 && potentialAttacks.some(attack => attack === index) && 
                                <div className={`outer-circle
                                    ${isCellPartOfLastMove(index) ? "last-move-light-circle" : "light-gray-circle"}`}>
                                    <div className={`inner-circle
                                        ${isCellPartOfLastMove(index) ? "last-move-square-light" : "light-square"}`}>
                                        <Square piece={element}/>
                                    </div>
                                </div>
                            }
                            {element !== 0 && !potentialAttacks.some(attack => attack === index) && <Square piece={element}/>}
                            {element === 0 && potentialMoves.some(m => chosenX + m[0] === row && chosenY + m[1] === column) &&
                                <div className={`${isCellPartOfLastMove(index) ? "last-move-light-dot" : "light-gray-dot"}`}></div>
                            }
                        </div>
                    );
                })}
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