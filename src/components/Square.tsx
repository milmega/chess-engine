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
import { Piece } from "./Board";

type SquareProps = {
    piece: number;
}

const Square = (props: SquareProps) => {
    if (props.piece === Piece.PAWN) {
        return <PawnWhite/>
    }
    if (props.piece === -Piece.PAWN) {
        return <PawnBlack/>
    }
    if(props.piece === Piece.ROOK) {
        return <RookWhite/>
    }
    if(props.piece === -Piece.ROOK) {
        return<RookBlack/>
    }
    if (props.piece === Piece.KNIGHT) {
        return <KnightWhite/>
    }
    if (props.piece === -Piece.KNIGHT) {
        return <KnightBlack/>
    }
    if (props.piece === Piece.BISHOP) {
        return <BishopWhite/>
    }
    if (props.piece === -Piece.BISHOP) {
        return <BishopBlack/>
    }
    if (props.piece === Piece.QUEEN) {
        return <QueenWhite/>
    }
    if (props.piece === -Piece.QUEEN) {
        return <QueenBlack/>
    }
    if (props.piece === Piece.KING) {
        return <KingWhite/>
    } 
    if (props.piece === -Piece.KING) {
        return <KingBlack/>
    }
    return (<div>{props.piece}</div>);
    
}

export default Square;