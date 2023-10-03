import "../styles/Square.css"

import PawnWhite from "./figures/PawnWhite";
import PawnBlack from "./figures/PawnBlack";
import KnightBlack from "./figures/KnightBlack";
import KnightWhite from "./figures/KnightWhite";
import BishopWhite from "./figures/BishopWhite";
import BishopBlack from "./figures/BishopBlack";
import KingWhite from "./figures/KingWhite";
import KingBlack from "./figures/KingBlack";
import QueenBlack from "./figures/QueenBlack";
import QueenWhite from "./figures/QueenWhite";
import RookWhite from "./figures/RookWhite";
import RookBlack from "./figures/RookBlack";

type SquareProps = {
    figure: string;
}

const Square = (props: SquareProps) => {
    if (props.figure === "pawn_white") {
        return <PawnWhite/>
    }
    if (props.figure === "pawn_black") {
        return <PawnBlack/>
    }
    if(props.figure === "rook_white") {
        return <RookWhite/>
    }
    if(props.figure === "rook_black") {
        return<RookBlack/>
    }
    if (props.figure === "knight_white") {
        return <KnightWhite/>
    }
    if (props.figure === "knight_black") {
        return <KnightBlack/>
    }
    if (props.figure === "bishop_white") {
        return <BishopWhite/>
    }
    if (props.figure === "bishop_black") {
        return <BishopBlack/>
    }
    if (props.figure === "queen_white") {
        return <QueenWhite/>
    }
    if (props.figure === "queen_black") {
        return <QueenBlack/>
    }
    if (props.figure === "king_white") {
        return <KingWhite/>
    } 
    if (props.figure === "king_black") {
        return <KingBlack/>
    }
    return (<div>{props.figure}</div>);
    
}

export default Square;