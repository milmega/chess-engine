import "../styles/Square.css"

import PawnWhite from "./pieces/PawnWhite";
import PawnBlack from "./pieces/PawnBlack";
import KnightBlack from "./pieces/KnightBlack";
import KnightWhite from "./pieces/KnightWhite";
import BishopWhite from "./pieces/BishopWhite";
import BishopBlack from "./pieces/BishopBlack";
import KingWhite from "./pieces/KingWhite";
import KingBlack from "./pieces/KingBlack";
import QueenBlack from "./pieces/QueenBlack";
import QueenWhite from "./pieces/QueenWhite";
import RookWhite from "./pieces/RookWhite";
import RookBlack from "./pieces/RookBlack";
import { Piece } from "./Piece";

type SquareProps = {
    piece: number;
    scale: string;
}

const Square = ({piece, scale}: SquareProps) => {
    if (piece === Piece.PAWN) {
        return <PawnWhite scale={scale}/>
    }
    if (piece === -Piece.PAWN) {
        return <PawnBlack scale={scale}/>
    }
    if(piece === Piece.ROOK) {
        return <RookWhite scale={scale}/>
    }
    if(piece === -Piece.ROOK) {
        return<RookBlack scale={scale}/>
    }
    if (piece === Piece.KNIGHT) {
        return <KnightWhite scale={scale}/>
    }
    if (piece === -Piece.KNIGHT) {
        return <KnightBlack scale={scale}/>
    }
    if (piece === Piece.BISHOP) {
        return <BishopWhite scale={scale}/>
    }
    if (piece === -Piece.BISHOP) {
        return <BishopBlack scale={scale}/>
    }
    if (piece === Piece.QUEEN) {
        return <QueenWhite scale={scale}/>
    }
    if (piece === -Piece.QUEEN) {
        return <QueenBlack scale={scale}/>
    }
    if (piece === Piece.KING) {
        return <KingWhite scale={scale}/>
    } 
    if (piece === -Piece.KING) {
        return <KingBlack scale={scale}/>
    }
    return (<div>{piece}</div>);
    
}

export default Square;

Square.defaultProps = {
    piece: Piece.PAWN,
    scale: "2"
}