import Square from "./Square";
import "../styles/Board.css"
import { useState } from "react";

const Board = () => {

    const [chosenSquareX, setChosenSquareX] = useState(-1);
    const [chosenSquareY, setChosenSquareY] = useState(-1);
    const [potentialMoves, setPotentialMoves] = useState<number[][]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<number[][]>([]);
    const [colorToMove, setColorToMove] = useState("white");
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

    /*const initialBoard: string[][] = [
        ["rook_black", "knight_black", "bishop_black", "queen_black", "king_black", "bishop_black", "knight_black", "rook_black"],
        ["pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black", "pawn_black"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white", "pawn_white"],
        ["rook_white", "knight_white", "bishop_white", "queen_white", "king_white", "bishop_white", "knight_white", "rook_white"]
    ];*/



    const makeMove = (figure: string, cordinateX: number, cordinateY: number) => {
        const possibleMoves = getPossibleMoves(figure, cordinateX, cordinateY);
        console.log("//" + possibleMoves);

        if((chosenSquareX === -1 && chosenSquareY === -1)
            || currentBoard[cordinateX][cordinateY].slice(-5) === currentBoard[chosenSquareX][chosenSquareY].slice(-5)) {
            if(currentBoard[cordinateX][cordinateY] === ""){
                return;
            }
            if(figure !== "" && !figure.includes(colorToMove)) {
                return;
            }
            const attacks: number[][] = [];
            possibleMoves.forEach(m => {
                if(currentBoard[cordinateX + m[0]][cordinateY + m[1]] !== "" && currentBoard[cordinateX + m[0]][cordinateY + m[1]].slice(-5) !== figure.slice(-5)) {
                    attacks.push([cordinateX + m[0], cordinateY + m[1]]);
                }
            })
            setPotentialAttacks(attacks);
            setChosenSquareX(cordinateX);
            setChosenSquareY(cordinateY);
            setPotentialMoves(possibleMoves);
        } else {
            if(potentialMoves.some(m => chosenSquareX + m[0] === cordinateX && chosenSquareY + m[1] === cordinateY)) {
                let tempBoard = currentBoard;
                tempBoard[cordinateX][cordinateY] = tempBoard[chosenSquareX][chosenSquareY];
                tempBoard[chosenSquareX][chosenSquareY] = "";
                setCurrentBoard(tempBoard);
                
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

    const getPossibleMoves = (figure: string, cordinateX: number, cordinateY: number) => {
        const movesForFigure: number[][] = getMovesForFigure(figure, cordinateX, cordinateY);
        
        if(figure.startsWith("king") || figure.startsWith("knight") || figure.startsWith("pawn")) {
            return movesForFigure.filter(m => {
                let newX = cordinateX + m[0];
                let newY = cordinateY + m[1];
                if(newX < 0 || newX > 7 || newY < 0 || newY > 7) {
                    return false;
                }
                if((currentBoard[newX][newY].endsWith("black") && figure.endsWith("black"))
                    || (currentBoard[newX][newY].endsWith("white") && figure.endsWith("white"))) {
                    return false;
                }
                return true;
            });
        }

        const allMovesForFigure: number[][] = [];
        movesForFigure.forEach(m => {
            for(let i = 1; i < 8; i++) {
                let newX = cordinateX + m[0] * i;
                let newY = cordinateY + m[1] * i;
                if(newX < 0 || newX > 7 || newY < 0 || newY > 7) {
                    break;
                }
                let potentialSquare = currentBoard[newX][newY]; 
                if(potentialSquare === "") {
                    allMovesForFigure.push([m[0] * i, m[1] * i]);
                } 
                else if((potentialSquare.endsWith("white") && figure.endsWith("black")) || (potentialSquare.endsWith("black") && figure.endsWith("white"))) {
                    allMovesForFigure.push([m[0] * i, m[1] * i]);
                    break;
                }
                else {
                    break;
                }
            }
        })
        return allMovesForFigure;
    }

    const getMovesForFigure = (figure: string, cordinateX: number, cordinateY: number) => {
        if(figure.startsWith("pawn")) {
            let pawnMoves: number[][] = [];
            if(figure.endsWith("white")) {
                if(currentBoard[cordinateX - 1][cordinateY] === "") {
                    pawnMoves.push([-1, 0]);
                }
                if(cordinateX === 6 && currentBoard[5][cordinateY] === "" && currentBoard[4][cordinateY] === "") {
                    pawnMoves.push([-2, 0]);
                }
                if(cordinateX > 0 && cordinateY > 0 && currentBoard[cordinateX - 1][cordinateY - 1].endsWith("black")) {
                    pawnMoves.push([-1, -1]);
                }
                if(cordinateX > 0 && cordinateY < 7 && currentBoard[cordinateX + 1][cordinateY + 1].endsWith("black")) {
                    pawnMoves.push([-1, 1])
                }
            } else { //black pawn
                if(currentBoard[cordinateX + 1][cordinateY] === "") {
                    pawnMoves.push([1, 0]);
                }
                if(cordinateX === 1 && currentBoard[2][cordinateY] === "" && currentBoard[3][cordinateY] === "") {
                    pawnMoves.push([2, 0]);
                }
                if(cordinateX < 7 && cordinateY > 0 && currentBoard[cordinateX + 1][cordinateY - 1].endsWith("white")) {
                    pawnMoves.push([1, -1]);
                }
                if(cordinateX < 7 && cordinateY < 7 && currentBoard[cordinateX + 1][cordinateY + 1].endsWith("white")) {
                    pawnMoves.push([1, 1])
                }
            }
            return pawnMoves;
        }
        if(figure.startsWith("rook")) {
            //how to deal with castling
            return [[1, 0], [-1, 0], [0, 1], [0, -1]]; 
        }
        if(figure.startsWith("knight")) {
            return [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        }
        if(figure.startsWith("bishop")) {
            return [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        }
        if(figure.startsWith("king")) {
            // deal with castling
            return [[1, 0], [1, 1], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];
        }
        if(figure.startsWith("queen")) {
            return [[1, 0], [1, 1], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];
        }
        return [];
    }

    console.log(potentialAttacks);
    return (
        <div className="board">
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
}

export default Board;