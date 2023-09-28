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
    className: string;
    figure: string;
    xIndex: number;
    yIndex: number;
}

const Square = (props: SquareProps) => {
    if (props.figure === "pawn_white") {
        return (<div className={props.className}><PawnWhite/></div>)
    }
    if (props.figure === "pawn_black") {
        return (<div className={props.className}><PawnBlack/></div>)
    }
    if(props.figure === "rook_white") {
        return(<div className={props.className}><RookWhite/></div>)
    }
    if(props.figure === "rook_black") {
        return(<div className={props.className}><RookBlack/></div>)
    }
    if (props.figure === "knight_white") {
        return (<div className={props.className}><KnightWhite/></div>)
    }
    if (props.figure === "knight_black") {
        return (<div className={props.className}><KnightBlack/></div>)
    }
    if (props.figure === "bishop_white") {
        return (<div className={props.className}><BishopWhite/></div>)
    }
    if (props.figure === "bishop_black") {
        return (<div className={props.className}><BishopBlack/></div>)
    }
    if (props.figure === "queen_white") {
        return (<div className={props.className}><QueenWhite/></div>)
    }
    if (props.figure === "queen_black") {
        return (<div className={props.className}><QueenBlack/></div>)
    }
    if (props.figure === "king_white") {
        return (<div className={props.className}><KingWhite/></div>)
    } 
    if (props.figure === "king_black") {
        return (<div className={props.className}><KingBlack/></div>)
    }
    return (<div className={props.className}>{props.figure}</div>);
    
}

export default Square;