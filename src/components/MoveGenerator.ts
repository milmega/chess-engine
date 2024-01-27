import { Move } from "./Move";
import { Piece } from "./Piece";

export const generateAllMoves = (colour: number, kingPosition: number, castling: boolean[], lastMove: number[], board: number[]) => {
    const allMoves: number[][] = [];
    for (let i = 0; i < 64; i++) {
        if(!isSameColour(board[i], colour)) {
            continue;
        }
        const validMoves = getValidMoves(board[i], i, kingPosition, castling, lastMove, board);
        validMoves.forEach(move => { allMoves.push([i, i+move[0]*8+move[1]])})
    }
    return allMoves;
}

//filters list of moves to prevent checking the king and enables moves that defend from checking
export const getValidMoves = (piece: number, fromPos: number, kingPosition: number, castling: boolean[], lastMove: number[], board: number[]) => { 
    const moves = getMoves(piece, fromPos, lastMove, board);
    const newMoves = moves.filter(move => {
        const toPosition = fromPos+move[0]*8+move[1];
        const tempBoard = [...board];
        tempBoard[toPosition] = piece;
        tempBoard[fromPos] = 0;

        if(Math.abs(piece) === Piece.KING) {
            return !isInCheck(toPosition, tempBoard);
        } else {
            return !isInCheck(kingPosition, tempBoard);
        }
    });
    if(Math.abs(piece) === Piece.KING && !castling[0] && (!castling[1] || !castling[2])) {
        newMoves.push(...getCastlingMoves(piece > 0 ? 1 : -1, castling, board));
    }
    return newMoves;
}

const getMoves = (piece: number, position: number, lastMove: number[] = [], board: number[]) => { // TODO: add cache for moves in the same ply
    const movesForPiece: number[][] = getMovesForPiece(piece, position, board);
    const cordinateX = Math.floor(position / 8);
    const cordinateY = position % 8;
    if(lastMove.length > 0 &&  Math.abs(piece) === Piece.PAWN && Math.abs(board[lastMove[1]]) === Piece.PAWN) {
        const enpassant = getEnpassantMove(piece, cordinateX, cordinateY, lastMove);
        if(enpassant.length > 0) {
            movesForPiece.push(enpassant);
        }
    }
    
    if(Math.abs(piece) === Piece.KING || Math.abs(piece) === Piece.KNIGHT || Math.abs(piece) === Piece.PAWN) {
        var x = movesForPiece.filter(m => {
            let newX = cordinateX + m[0];
            let newY = cordinateY + m[1];
            if(newX < 0 || newX > 7 || newY < 0 || newY > 7) {
                return false;
            }
            return !isSameColour(board[newX*8+newY], piece);
        });
        return x;
    }

    const allMovesForPiece: number[][] = [];
    movesForPiece.forEach(m => {
        for(let i = 1; i < 8; i++) {
            let newX = cordinateX + m[0] * i;
            let newY = cordinateY + m[1] * i;
            if(newX < 0 || newX > 7 || newY < 0 || newY > 7) {
                break;
            }
            let potentialSquare = board[newX*8+newY]; 
            if(potentialSquare === 0) {
                allMovesForPiece.push([m[0] * i, m[1] * i]);
                continue;
            }
            else if(!isSameColour(potentialSquare, piece)) {
                allMovesForPiece.push([m[0] * i, m[1] * i]);
            }
            break;
        }
    })
    return allMovesForPiece;
}

const getMovesForPiece = (piece: number, position: number, board: number[]) => {
    const cordinateX = Math.floor(position/8);
    const cordinateY = position%8;
    if(Math.abs(piece) === Piece.PAWN) {
        let pawnMoves: number[][] = [];
        if(piece > 0) {
            if(board[(cordinateX - 1)*8+cordinateY] === 0) {
                pawnMoves.push([-1, 0]);
            }
            if(cordinateX === 6 && board[40+cordinateY] === 0 && board[32+cordinateY] === 0) {
                pawnMoves.push([-2, 0]);
            }
            if(cordinateX > 0 && cordinateY > 0 && board[(cordinateX - 1)*8+cordinateY - 1] < 0) {
                pawnMoves.push([-1, -1]);
            }
            if(cordinateX > 0 && cordinateY < 7 && board[(cordinateX - 1)*8+cordinateY + 1] < 0) {
                pawnMoves.push([-1, 1])
            }
        } else { //black pawn
            if(board[(cordinateX + 1)*8+cordinateY] === 0) {
                pawnMoves.push([1, 0]);
            }
            if(cordinateX === 1 && board[16+cordinateY] === 0 && board[24+cordinateY] === 0) {
                pawnMoves.push([2, 0]);
            }
            if(cordinateX < 7 && cordinateY > 0 && board[(cordinateX + 1)*8+cordinateY - 1] > 0) {
                pawnMoves.push([1, -1]);
            }
            if(cordinateX < 7 && cordinateY < 7 && board[(cordinateX + 1)*8+cordinateY + 1] > 0) {
                pawnMoves.push([1, 1])
            }
        }
        return pawnMoves;
    }
    if(Math.abs(piece) === Piece.ROOK) {
        return [[1, 0], [-1, 0], [0, 1], [0, -1]]; 
    }
    if(Math.abs(piece) === Piece.KNIGHT) {
        return [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
    }
    if(Math.abs(piece) === Piece.BISHOP) {
        return [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    }
    if(Math.abs(piece) === Piece.KING) {
        return [[1, 0], [1, 1], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];
    }
    if(Math.abs(piece) === Piece.QUEEN) {
        return [[1, 0], [1, 1], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]];
    }
    return [];
}

// x and y are cordinates of the player's pawn, lastMove are cordinates from and to of the computer
const getEnpassantMove = (piece: number, x: number, y: number, [lastMoveFrom, lastMoveTo]: number[]) => {
    if(Math.abs(lastMoveTo - lastMoveFrom) > 8 && x === Math.floor(lastMoveTo/8) && Math.abs(y - lastMoveTo%8) === 1) {
        return [piece > 0 ? -1 : 1, (lastMoveTo%8)-y];
    }
    return [];
}

//returns list of attack moves for a piece to show a circle around potential prey or a list of all squares under attack that king cannot go to
export const getAttackMoves = (piece: number, fromPos: number, possibleMoves: number[][], board: number[]) => {
    return possibleMoves
                .filter(m => board[fromPos + m[0] * 8 + m[1]] !== 0 && !isSameColour(board[fromPos + m[0] * 8 + m[1]], piece))
                .map(m => fromPos + m[0] * 8 + m[1]);
}

//checks if castling is possible and returns an array with possible moves
const getCastlingMoves = (colour: number, castling: boolean[], board: number[]) => {
    const castlingMoves: number[][] = [];
    const row = colour === 1 ? 7 : 0;
    let leftCastlingEnabled: boolean = true;
    let rightCastlingEnabled: boolean = true;

    for(let i = 0; i < 64; i++) {
        if(!leftCastlingEnabled && !rightCastlingEnabled) {
            break;
        }
        if(board[i] === 0 || isSameColour(board[i], colour)) {
            continue;
        }
        const moves = getMoves(board[i], i, [], board);
        leftCastlingEnabled = !moves.some(move => move[0] + Math.floor(i/8) === row && move[1] + i%8 < 5); //checking if any square on the casling way is under attack
        rightCastlingEnabled = !moves.some(move => move[0] + Math.floor(i/8) === row && move[1] + i%8 > 3);
    }
    if(!castling[1] && leftCastlingEnabled && board[row*8+1] === 0 && board[row*8+2] === 0 && board[row*8+3] === 0) { //if left rook hasn't moved
        castlingMoves.push([0, -2]);
    }
    if(!castling[2] && rightCastlingEnabled && board[row*8+5] === 0 && board[row*8+6] === 0) { //if right rook hasn't moved
        castlingMoves.push([0, 2]);
    }

    return castlingMoves;
}

//checks if king is under check
export const isInCheck = (kingPosition: number, board: number[]) => {
    const colour = board[kingPosition] > 0 ? 1 : -1;
    for (let i = 0; i < 64; i++) {
        if (board[i] === 0 || isSameColour(colour, board[i])) {
            continue;
        }
        const moves = getMoves(board[i], i, [], board); //TODO: should I pass lastMove for enpassant? i dont think so because its checks for its own moves
        const attackMoves = getAttackMoves(board[i], i, moves, board);
        if(attackMoves.some(move => kingPosition === move)) {
            return true;
        }
    }
    return false;
}

export const isDraw = (material: number[][], moveHistory: Move[], board: number[]) => {
    if(drawByInsufficientMaterial(material, board)) { return "By insufficient material"; }
    if (drawBy50MoveRule(moveHistory)) { return "By 50 move rule"; }
    if(drawBy3foldRepetition(moveHistory)){ return "By threefold repetition"; }
    return "";
}

const drawByInsufficientMaterial = (material: number[][], board: number[]) => {
    if((material[0][1] | material[0][4] | material[0][5] | material[1][1] | material[1][4] | material[1][5]) > 0) { // if any side has pawns, rooks or queen, it is not a draw
        return false;
    }
    if((material[0][2] | material[0][3] | material[1][2] | material[1][3]) === 0) { //if only 2 kings left, it is a draw
            return true;
    }
    if(((material[0][2] | material[0][3]) === 1 && (material[1][2] | material[1][3]) === 0) ||
        ((material[0][2] | material[0][3]) === 0 && (material[1][2] | material[1][3]) === 1)) { //if one side has one knight/bishop and the other one has only king, it's a draw
            return true;
    }
    if((material[0][2] === 1 && material[0][3] === 0 && material[1][2] === 0 && material[1][3] === 1) ||
        (material[0][2] === 0 && material[0][3] === 1 && material[1][2] === 1 && material[1][3] === 0)) { // if one side has a knight and the other one has a bishop
        return true;
    }
    if(material[0][2] === 0 && material[0][3] === 1 && material[1][2] === 0 && material[1][3] === 1) { //if both sides have a bishop - check if on the same colour
        const whiteBishop = board.indexOf(Piece.BISHOP);
        const whiteBishopRow = Math.floor(whiteBishop/8);
        const whiteBishopColumn = whiteBishop%8;
        const blackBishop = board.indexOf(-Piece.BISHOP);
        const blackBishopRow = Math.floor(blackBishop/8);
        const blackBishopColumn = blackBishop%8;
        const whiteOnWhite = (whiteBishopRow%2 === 0 && whiteBishopColumn % 2 === 0) || (whiteBishopRow%2 === 1 && whiteBishopColumn % 2 === 1);
        const blackOnWhite = (blackBishopRow%2 === 0 && blackBishopColumn % 2 === 0) || (blackBishopRow%2 === 1 && blackBishopColumn % 2 === 1);
        return whiteOnWhite === blackOnWhite;
    }
    return false;
}

//50-move rule - no capture or pawn move in last 50 moves
const drawBy50MoveRule = (moveHistory: Move[]) => {
    if(moveHistory.length < 100) {
        return false;
    }
    return moveHistory.reverse().find(move => move.capture !== 0)!.id >= moveHistory.length-100;
}

const drawBy3foldRepetition = (moveHistory: Move[]) => { //simplified version of 3foldRepetition
    
    if(moveHistory.length < 8) {
        return false;
    }
    const last8Moves = moveHistory.slice(-8);
    if(last8Moves[0].start === last8Moves[4].start && last8Moves[0].target === last8Moves[4].target &&
        last8Moves[1].start === last8Moves[5].start && last8Moves[1].target === last8Moves[5].target &&
        last8Moves[2].start === last8Moves[6].start && last8Moves[2].target === last8Moves[6].target &&
        last8Moves[3].start === last8Moves[7].start && last8Moves[3].target === last8Moves[7].target) {
        return true;
    }
    return false;
}
  
export const isSameColour = (piece: number, colour: number) => {
    return (piece > 0 && colour > 0) || (piece < 0 && colour < 0)
}