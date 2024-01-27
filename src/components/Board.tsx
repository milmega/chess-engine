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
    const [potentialMoves, setPotentialMoves] = useState<number[][]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<number[]>([]);
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
    const lastMove = useRef<number[]>([]);
    const colourToMove = useRef(1);
    const material = useRef<number[][]>([[0, 8, 2, 2, 2, 1, 1], [0, 8, 2, 2, 2, 1, 1]]); //white material, blackMaterial
    const moveHistory = useRef<Move[]>([]);
    const historyIndex = useRef(0);

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
        colourToMove.current = 1;
        lastMove.current = [];
        material.current = [[0, 8, 2, 2, 2, 1, 1], [0, 8, 2, 2, 2, 1, 1]];
        moveHistory.current = [];
        historyIndex.current = 0;
        moveGeneratorService.resetBoard();
    }

    const makeMove = (position: number, compMove: number = -1) => { //starting square is taken from state unless computer makes move
        const fromX = compMove > -1 ? Math.floor(compMove / 8) : Math.floor(chosenSquare / 8);
        const fromY = compMove > -1 ? compMove % 8 : chosenSquare % 8;
        const fromPos = compMove > -1 ? compMove : chosenSquare;
        const cordinateX = Math.floor(position / 8);
        const cordinateY = position % 8;
        const piece = currentBoard[position];
        const colour = colourToMove.current;

        if(gameMode.startsWith("menu")) {
            return;
        }
        if(gameMode.startsWith("computer") && compMove === -1 && colour === -playerColour) {
            return;
        }
        if(playerColour === 0) { // if the player has not chosen a colour return
            return;
        }
        if(historyIndex.current+1 < moveHistory.current.length) {
            //TODO: show prompt
            return;
        }
        if(fromPos === -1 || isSameColour(currentBoard[position], currentBoard[fromPos])) {
            if(piece === 0 || !isSameColour(piece, colour)){ // ignore if clicked on empty square or on opponent's piece
                return;
            }
            const kingPosition = colour > 0 ? whiteKingPosition : blackKingPosition;
            const castling = colour > 0 ? whiteCastling : blackCastling;
            const validMoves = getValidMoves(piece, position, kingPosition, castling, lastMove.current, currentBoard);
            const attacks = getAttackMoves(piece, position, validMoves, currentBoard);
            setPotentialAttacks(attacks);
            setPotentialMoves(validMoves);
            setChosenSquare(position);
        } else {
            const pontentialMovesArray = compMove > -1 ? [[cordinateX-fromX, cordinateY-fromY]] : potentialMoves;
            if(pontentialMovesArray.some(m => fromX + m[0] === cordinateX && fromY + m[1] === cordinateY)) {
                let tempBoard = currentBoard; //TODO: Should it be copied? Yes, but makeMove for computer uses currentBoard as well which would cancel user move. Need to find a solution
                const move: Move = new Move(tempBoard[fromPos], fromPos, position, colour, tempBoard[position]);

                // WHITE CASTLING
                if(tempBoard[fromPos] === Piece.KING) {
                    setWhiteKingPosition(position);
                    setWhiteCastling([true, true, true]);
                    move.castlingFlag = true;
                    if(Math.abs(cordinateY - fromY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[56] = Piece.EMPTY;
                            tempBoard[59] = Piece.ROOK;
                            move.preCastlingPosition = 56;
                            move.postCastlingPosition = 59;
                        } else {
                            tempBoard[63] = Piece.EMPTY;
                            tempBoard[61] = Piece.ROOK;
                            move.preCastlingPosition = 63;
                            move.postCastlingPosition = 61;
                        }
                    }
                } 
                // BLACK CASTLING
                else if(tempBoard[fromPos] === -Piece.KING) {
                    setBlackKingPosition(position);
                    setBlackCastling([true, true, true]);
                    move.castlingFlag = true;
                    if(Math.abs(cordinateY - fromY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[0] = Piece.EMPTY;
                            tempBoard[3] = -Piece.ROOK;
                            move.preCastlingPosition = 0;
                            move.postCastlingPosition = 3;
                        } else {
                            tempBoard[7] = Piece.EMPTY;
                            tempBoard[5] = -Piece.ROOK;
                            move.preCastlingPosition = 7;
                            move.postCastlingPosition = 5;
                        }
                    }
                }
                //if you move a rook then disable castling
                if(Math.abs(tempBoard[fromPos]) === Piece.ROOK) {
                    if(tempBoard[fromPos] > 0 && fromX === 7 && (fromY === 0 || fromY === 7)) {
                        let tempCastling = whiteCastling;
                        tempCastling[fromY === 0 ? 1 : 2] = true;
                        setWhiteCastling(tempCastling);
                    } else if(tempBoard[fromPos] < 0 && fromX === 0 && (fromY === 0 || fromY === 7)) {
                        let tempCastling = blackCastling;
                        tempCastling[fromY === 0 ? 1 : 2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                //if a rook is captured then disable castling
                if(Math.abs(tempBoard[position]) === Piece.ROOK) {
                    if(tempBoard[position] > 0 && cordinateX === 7 && (cordinateY === 0 || cordinateY === 7)) {
                        let tempCastling = whiteCastling;
                        tempCastling[cordinateY === 0 ? 1 : 2] = true;
                        setWhiteCastling(tempCastling);
                    } else if(tempBoard[position] < 0 && cordinateX === 0 && (cordinateY === 0 || cordinateY === 7)){
                        let tempCastling = blackCastling;
                        tempCastling[cordinateY === 0 ? 1 : 2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                // PIECE MOVE
                if(Math.abs(tempBoard[fromPos]) === Piece.PAWN ) {
                   if(Math.abs(cordinateY-fromY) === 1 && tempBoard[position] === 0) { //en passant move
                        tempBoard[fromX*8+cordinateY] = 0;
                        move.enpassantFlag = true;
                        move.enpassantPosition = fromX*8+cordinateY;
                        material.current[colour > 0 ? 1 : 0][Piece.PAWN]--;
                    }  
                    if(cordinateX === 0 || cordinateX === 7) { // getting a pawn to the last row
                        tempBoard[position] = Piece.QUEEN * colour;
                        move.promotionFlag = true;
                        material.current[colour > 0 ? 0 : 1][Piece.QUEEN]++;
                        material.current[colour > 0 ? 0 : 1][Piece.PAWN]--;
                    } else {
                        tempBoard[position] = tempBoard[fromPos];
                        if(piece !== 0) {
                            material.current[piece > 0 ? 0 : 1][Math.abs(piece)]--;
                        }
                    } 
                } else {
                    tempBoard[position] = tempBoard[fromPos];
                    if(piece !== 0) {
                        material.current[piece > 0 ? 0 : 1][Math.abs(piece)]--;
                    }
                }
                tempBoard[fromPos] = 0;
                moveHistory.current.push(move);
                historyIndex.current++; 
                lastMove.current = [fromPos, position];
                console.log((colour > 0 ? "White" : "Black") + " from (" + fromX + ", " + fromY + ") to (" + Math.floor(position/8) + ", " + position%8 + "), tp: " + piece);
                setCurrentBoard(tempBoard);

                const kingPosition = colour > 0 ? blackKingPosition : whiteKingPosition; //if whites just made a move check black king
                const inCheck = isInCheck(kingPosition, tempBoard);
                const possibleMoves = generateAllMoves(-colour, kingPosition, colour > 0 ? blackCastling : whiteCastling, lastMove.current, tempBoard);
                
                const drawReason = isDraw(material.current, moveHistory.current, tempBoard);
                if(possibleMoves.length === 0){
                    onGameEnd(inCheck ? colour : 0, ""); //declare a winner after a checkmate or a stalemate
                } else if(drawReason.length > 0) {
                    onGameEnd(0, drawReason); //declare a draw and provide a reason
                } else {
                    //addToBoardHistory(copy2DArray(tempBoard), piece > 0 ? 1 : -1)
                    //colourToMove.current = -colourToMove.current //delete it for single player /  add it for testing !!!
                    if(gameMode.startsWith("computer") && compMove === -1) {
                        colourToMove.current = -colourToMove.current;
                        makeComputerMove(fromPos, position);
                    }
                }
            }
            setPotentialAttacks([]);
            setPotentialMoves([]);
            setChosenSquare(-1);
        }
    }
    
    // calls backend service to get best move for a copouter; start and destination are coors of the player's last move
    const makeComputerMove = (start: number, destination: number) => {
        moveGeneratorService
            .getMoveData(start, destination, colourToMove.current)
            .then(moveData => {
                const cors: string[] = moveData.toString().split(',');
                const fromPos = parseInt(cors[0]);
                const toPos = parseInt(cors[1]);        
                setTimeout(() => {
                    setChosenSquare(fromPos);
                    setPotentialMoves([[Math.floor(toPos/8)-Math.floor(fromPos/8), toPos%8-fromPos%8]]);
                    makeMove(toPos, fromPos);
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
        return (pos === move.start || pos === move.target);
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
            tempBoard[prevMove.start] = tempBoard[prevMove.target];
            tempBoard[prevMove.target] = prevMove.capture;
            if(prevMove.castlingFlag) {
                tempBoard[prevMove.preCastlingPosition] = Piece.ROOK*prevMove.colour;
                tempBoard[prevMove.postCastlingPosition] = 0;
            }
            if(prevMove.enpassantFlag) {
                tempBoard[prevMove.enpassantPosition] = Piece.PAWN*-prevMove.colour;
            }
            if(prevMove.promotionFlag) {
                tempBoard[prevMove.start] = Piece.PAWN*prevMove.colour;
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
        board[move.target] = board[move.start];
        board[move.start] = 0;
        if(move.castlingFlag) {
            board[move.preCastlingPosition] = 0;
            board[move.postCastlingPosition] = Piece.ROOK*move.colour;
        }
        if(move.enpassantFlag) {
            board[move.enpassantPosition] = 0;
        }
        if(move.promotionFlag) {
            board[move.target] = Piece.QUEEN*move.colour;
        }
        return board;
    }

    useEffect(() => {
        if(gameMode.startsWith("computer") && playerColour === -1 && colourToMove.current === -playerColour) {
            makeComputerMove(-1, -1);
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
        </>
        )
});

export default Board;