import Square from "./Square";
import "../styles/Board.css"
import { useState } from "react";
import { getAttackMoves, getMoves, getValidMoves, isKingCheckmated } from "./Validator";
import React from "react";
import MoveGeneratorService from "../services/MoveGeneratorService";

interface Props {
    onGameEnd: (colour: string) => void,
    gameMode: string,
    playerColour: boolean
}

const Board = React.forwardRef(({onGameEnd, gameMode, playerColour}: Props, ref) => {
    const [chosenSquareX, setChosenSquareX] = useState(-1);
    const [chosenSquareY, setChosenSquareY] = useState(-1);
    const [potentialMoves, setPotentialMoves] = useState<number[][]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<number[][]>([]);
    const [colourToMove, setColourToMove] = useState("white");
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
  const moveGeneratorService = new MoveGeneratorService('http://localhost:8080');

    const reset = () => {
        setChosenSquareX(-1);
        setChosenSquareY(-1);
        setPotentialMoves([]);
        setPotentialAttacks([]);
        setColourToMove("white");
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
        if(gameMode.startsWith("menu")) {
            return;
        }
        if((chosenSquareX === -1 && chosenSquareY === -1)
            || currentBoard[cordinateX][cordinateY].slice(-5) === currentBoard[chosenSquareX][chosenSquareY].slice(-5)) {
            if(currentBoard[cordinateX][cordinateY] === ""){
                return;
            }
            if(figure !== "" && !figure.includes(colourToMove)) {
                return;
            }
            
            const kingPosition = colourToMove === "white" ? whiteKingPosition : blackKingPosition;
            const castling = colourToMove === "white" ? whiteCastling : blackCastling;
            const validMoves = getValidMoves(figure, getMoves(figure, cordinateX, cordinateY, currentBoard), cordinateX, cordinateY, kingPosition, castling, currentBoard);
            const attacks = getAttackMoves(figure, cordinateX, cordinateY, validMoves, currentBoard);
    
            setPotentialAttacks(attacks);
            setPotentialMoves(validMoves);
            setChosenSquareX(cordinateX);
            setChosenSquareY(cordinateY);
        } else {
            if(potentialMoves.some(m => chosenSquareX + m[0] === cordinateX && chosenSquareY + m[1] === cordinateY)) {
                let tempBoard = currentBoard;
                let colour = currentBoard[chosenSquareX][chosenSquareY].slice(-5);
                
                if(currentBoard[chosenSquareX][chosenSquareY].startsWith("pawn") && (cordinateX === 0 || cordinateX === 7)) {
                    tempBoard[cordinateX][cordinateY] = "queen_" + colour;
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

                const kingPosition = colourToMove === "white" ? blackKingPosition : whiteKingPosition; //if whites just made a move check black king
                if(isKingCheckmated(kingPosition, colourToMove, currentBoard)){
                    onGameEnd(colourToMove);
                } 
                if(colourToMove === "white") {
                    setColourToMove("black");
                    //computeComputerMove(false);
                } else {   
                    setColourToMove("white");
                    //computeComputerMove(true);
                }
                          
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
                console.log("data: " + moveData);
                const cors: string = moveData.toString();
                const fromX = parseInt(cors.charAt(0));
                const fromY = parseInt(cors.charAt(1));
                const toX = parseInt(cors.charAt(2));
                const toY = parseInt(cors.charAt(3));
                let tempBoard = currentBoard;
                tempBoard[+toX][+toY] = tempBoard[+fromX][+fromY];
                tempBoard[+fromX][+fromY] = "";
                setCurrentBoard(tempBoard);
                setColourToMove("white"); //TODO: adjust it so it updated colour to move
                 
            })
            .catch(error => {
                console.error('There was an error:', error.message);
            });
    }

    const convertBoard2String = () => { //TODO: rewrite current board so it uses ints
        let convertedBoard = "";
        console.log(currentBoard);
        for(let i = 0; i < 8; i++) {
            for(let j = 0; j < 8; j++) {
                if(i === 4 && j === 4) {
                    console.log(currentBoard[i][j]);
                }
                if(currentBoard[i][j] === "") {
                    convertedBoard += "0";
                    continue;
                }
                if(currentBoard[i][j].endsWith("black")) {
                    convertedBoard += "-"
                }
                if(currentBoard[i][j].startsWith("pawn")) {
                    convertedBoard += "1"
                }
                else if(currentBoard[i][j].startsWith("knight")) {
                    convertedBoard += "2"
                }
                else if(currentBoard[i][j].startsWith("bishop")) {
                    convertedBoard += "3"
                }
                else if(currentBoard[i][j].startsWith("rook")) {
                    convertedBoard += "4"
                }
                else if(currentBoard[i][j].startsWith("queen")) {
                    convertedBoard += "5"
                }
                else if(currentBoard[i][j].startsWith("king")) {
                    convertedBoard += "6"
                }
            }
        }
        console.log(convertedBoard);
        return convertedBoard;
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