import Square from "./Square";
import "../styles/Board.css"
import { useState } from "react";
import { getAttackMoves, getMoves, getValidMoves, isKingCheckmated } from "./Validator";
import React from "react";

interface Props {
    onGameEnd: (color: string) => void,
    gameMode: string
}

const Board = React.forwardRef(({onGameEnd, gameMode}: Props, ref) => {
    const [chosenSquareX, setChosenSquareX] = useState(-1);
    const [chosenSquareY, setChosenSquareY] = useState(-1);
    const [potentialMoves, setPotentialMoves] = useState<number[][]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<number[][]>([]);
    const [colorToMove, setColorToMove] = useState("white");
    const [whiteKingPosition, setWhiteKingPosition] = useState([7, 4]);
    const [blackKingPosition, setBlackKingPosition] = useState([0, 4]);
    const [whiteCastling, setWhiteCastling] = useState([false, false, false]); //[hasKingMoved, hasLeftRookMoved, hasRightRookMoved]
    const [blackCastling, setBlackCastling] = useState([false, false, false]);
    const [currentBoard, setCurrentBoard] = useState([
        ["rook_black", "knight_black", "bishop_black", "queen_black", "king_black", "bishop_black", "knight_black", "rook_black"],
        ["pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white"],
        ["rook_white", "knight_white", "bishop_white", "queen_white", "king_white", "bishop_white", "knight_white", "rook_white"]
    ]);

    const reset = () => {
        setChosenSquareX(-1);
        setChosenSquareY(-1);
        setPotentialMoves([]);
        setPotentialAttacks([]);
        setColorToMove("white");
        setWhiteKingPosition([7, 4]);
        setBlackKingPosition([0, 4]);
        setWhiteCastling([false, false, false]);
        setBlackCastling([false, false, false]);
        setCurrentBoard([
            ["rook_black", "knight_black", "bishop_black", "queen_black", "king_black", "bishop_black", "knight_black", "rook_black"],
            ["pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black"],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["", "", "", "", "", "", "", ""],
            ["pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white"],
            ["rook_white", "knight_white", "bishop_white", "queen_white", "king_white", "bishop_white", "knight_white", "rook_white"]
        ]);
    }

    const makeMove = (figure: string, cordinateX: number, cordinateY: number) => {
        if(gameMode === "menu") {
            return;
        }
        if((chosenSquareX === -1 && chosenSquareY === -1)
            || currentBoard[cordinateX][cordinateY].slice(-5) === currentBoard[chosenSquareX][chosenSquareY].slice(-5)) {
            if(currentBoard[cordinateX][cordinateY] === ""){
                return;
            }
            if(figure !== "" && !figure.includes(colorToMove)) {
                return;
            }
            
            const kingPosition = colorToMove === "white" ? whiteKingPosition : blackKingPosition;
            const castling = colorToMove === "white" ? whiteCastling : blackCastling;
            const validMoves = getValidMoves(figure, getMoves(figure, cordinateX, cordinateY, currentBoard), cordinateX, cordinateY, kingPosition, castling, currentBoard);
            const attacks = getAttackMoves(figure, cordinateX, cordinateY, validMoves, currentBoard);
    
            setPotentialAttacks(attacks);
            setPotentialMoves(validMoves);
            setChosenSquareX(cordinateX);
            setChosenSquareY(cordinateY);
        } else {
            if(potentialMoves.some(m => chosenSquareX + m[0] === cordinateX && chosenSquareY + m[1] === cordinateY)) {
                let tempBoard = currentBoard;
                let color = currentBoard[chosenSquareX][chosenSquareY].slice(-5);
                
                if(currentBoard[chosenSquareX][chosenSquareY].startsWith("pawn") && (cordinateX === 0 || cordinateX === 7)) {
                    tempBoard[cordinateX][cordinateY] = "queen_" + color;
                } else {
                    tempBoard[cordinateX][cordinateY] = tempBoard[chosenSquareX][chosenSquareY];
                }
                if(currentBoard[chosenSquareX][chosenSquareY] === "king_white") {
                    setWhiteKingPosition([cordinateX, cordinateY]);
                    setWhiteCastling([true, true, true]);
                    if(Math.abs(cordinateY - chosenSquareY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[7][0] = "";
                            tempBoard[7][3] = "rook_white";
                        } else {
                            tempBoard[7][7] = "";
                            tempBoard[7][5] = "rook_white";
                        }
                    }
                }
                else if(currentBoard[chosenSquareX][chosenSquareY] === "king_black") {
                    setBlackKingPosition([cordinateX, cordinateY]);
                    setBlackCastling([true, true, true]);
                    if(Math.abs(cordinateY - chosenSquareY) > 1) { //if king is doing castling, move rook accordingly
                        if(cordinateY === 2) {
                            tempBoard[0][0] = "";
                            tempBoard[0][3] = "rook_black";
                        } else {
                            tempBoard[0][7] = "";
                            tempBoard[0][5] = "rook_black";
                        }
                    }
                }
                //if you move a rook then disable castling
                if(currentBoard[chosenSquareX][chosenSquareY].startsWith("rook")) {
                    if(currentBoard[chosenSquareX][chosenSquareY].endsWith("white")) {
                        let tempCastling = whiteCastling;
                        tempCastling[1] = true;
                        setWhiteCastling(tempCastling);
                    } else {
                        let tempCastling = blackCastling;
                        tempCastling[2] = true;
                        setBlackCastling(tempCastling);
                    }
                }
                tempBoard[chosenSquareX][chosenSquareY] = "";
                setCurrentBoard(tempBoard);

                const kingPosition = colorToMove === "white" ? blackKingPosition : whiteKingPosition; //if whites just made a move check black king
                if(isKingCheckmated(kingPosition, colorToMove, currentBoard)){
                    onGameEnd(colorToMove);
                } 
                
                if(colorToMove === "white") {
                    setColorToMove("black"); 
                } else {   
                    setColorToMove("white");
                }             
            }
            setPotentialAttacks([]);
            setPotentialMoves([]);
            setChosenSquareX(-1);
            setChosenSquareY(-1);
        }
    }

    React.useImperativeHandle(ref, () => ({
        reset,
    }));

    return (
        <div className={`board ${gameMode !== "menu" ? "board-active" : ""}`}>
            {
            currentBoard.map((row, rowIndex) => row.map((element, index) => {
                if((rowIndex % 2 === 0 && index % 2 === 1) || (rowIndex % 2 === 1 && index % 2 === 0)) {
                    return(
                        <div
                            key={rowIndex + ", " + index}
                            onClick={() => makeMove(element, rowIndex, index)}
                            className={`square
                            ${rowIndex === chosenSquareX && index === chosenSquareY ? "chosen-square" : "dark-square"}`}>
                            {element !== "" && potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && 
                                <div className="outer-circle dark-gray-circle">
                                    <div className="inner-circle dark-square">
                                        <Square figure={element}/>
                                    </div>
                                </div>
                            }
                            {element !== "" && !potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && <Square figure={element}/>}
                            {element === "" && potentialMoves.some(m => chosenSquareX + m[0] === rowIndex && chosenSquareY + m[1] === index) &&  <div className="dark-gray-dot"></div>}
                        </div>
                    );
                }
                return(
                    <div
                        key={rowIndex+index}
                        onClick={() => makeMove(element, rowIndex, index)}
                        className={`square ${rowIndex === chosenSquareX && index === chosenSquareY ? "chosen-square" : "light-square"}`}>
                        {element !== "" && potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && 
                            <div className="outer-circle light-gray-circle">
                                <div className="inner-circle light-square">
                                    <Square figure={element}/>
                                </div>
                            </div>
                        }
                        {element !== "" && !potentialAttacks.some(a => a[0] === rowIndex && a[1] === index) && <Square figure={element}/>}
                        {element === "" && potentialMoves.some(m => chosenSquareX + m[0] === rowIndex && chosenSquareY + m[1] === index) && <div className="light-gray-dot"></div>}
                    </div>
                );
            }))}
        </div>
        )
});

export default Board;