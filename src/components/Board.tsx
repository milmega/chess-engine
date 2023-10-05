import Square from "./Square";
import "../styles/Board.css"
import { useState } from "react";
import { getAttackMoves, getMoves, getValidMoves } from "./Validator";

const Board = () => {

    const [chosenSquareX, setChosenSquareX] = useState(-1);
    const [chosenSquareY, setChosenSquareY] = useState(-1);
    const [potentialMoves, setPotentialMoves] = useState<number[][]>([]);
    const [potentialAttacks, setPotentialAttacks] = useState<number[][]>([]);
    const [colorToMove, setColorToMove] = useState("white");
    const [whiteKingPosition, setWhiteKingPosition] = useState([7, 4]);
    const [blackKingPosition, setBlackKingPosition] = useState([0, 4]);
    //const [whiteCastling, setWhiteCastling] = useState({rook70: true, rook77: true, king: true}); TODO: deal with castling after checking
    //const [blackCastling, setBlackCastling] = useState({rook00: true, rook07: true, king: true});
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

    const makeMove = (figure: string, cordinateX: number, cordinateY: number) => {
        if((chosenSquareX === -1 && chosenSquareY === -1)
            || currentBoard[cordinateX][cordinateY].slice(-5) === currentBoard[chosenSquareX][chosenSquareY].slice(-5)) {
            if(currentBoard[cordinateX][cordinateY] === ""){
                return;
            }
            if(figure !== "" && !figure.includes(colorToMove)) {
                return;
            }
            
            const kingPosition = colorToMove === "white" ? whiteKingPosition : blackKingPosition;
            const validMoves = getValidMoves(figure, getMoves(figure, cordinateX, cordinateY, currentBoard), cordinateX, cordinateY, kingPosition, currentBoard);
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
                    tempBoard[cordinateX][cordinateY] = "queen_" + color; //TODO enable more choices
                } else {
                    tempBoard[cordinateX][cordinateY] = tempBoard[chosenSquareX][chosenSquareY];
                }
                if(figure === "white_king") {
                    setWhiteKingPosition([cordinateX, cordinateY]);
                }
                else if(figure === "black_king") {
                    setBlackKingPosition([cordinateX, cordinateY]);
                }
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