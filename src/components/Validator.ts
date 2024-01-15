import { Piece } from "./Piece";

export const getMoves = (piece: number, position: number, lastMove: number[] = [], board: number[]) => { // TODO: add cache for moves in the same ply
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

export const getMovesForPiece = (piece: number, position: number, board: number[]) => {
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

//filters list of valid moves to prevent checking the king and enables moves that defend from checking
export const getValidMoves = (piece: number, moves: number[][], fromPos: number, kingPosition: number, castling: boolean[], board: number[]) => {   
    const newMoves = moves.filter(move => {
        const toPosition = fromPos+move[0]*8+move[1];

        const tempBoard = [...board];
        tempBoard[toPosition] = piece;
        tempBoard[fromPos] = 0;

        if(Math.abs(piece) === Piece.KING) {
            return !isKingUnderCheck(toPosition, tempBoard);
        } else {
            return !isKingUnderCheck(kingPosition, tempBoard);
        }
    });
    if(Math.abs(piece) === Piece.KING && !castling[0] && (!castling[1] || !castling[2])) {
        newMoves.push(...getCastlingMoves(piece > 0 ? 1 : -1, castling, board));
    }
    return newMoves;
}

//checks if king in checkmated
export const isKingCheckmated = (kingPosition: number, colour: number, lastMove: number[], board: number[]) => {
    for(let i = 0; i < 64; i++) {
        if(board[i] === 0 || isSameColour(board[i], colour)) {
            continue;
        }
        const moves = getValidMoves(board[i], getMoves(board[i], i, lastMove, board), i, kingPosition, [false, false, false], board);
            if(moves.length > 0) {
                return false;
            }
    }
    return true;
}

//checks if king is under check
const isKingUnderCheck = (kingPosition: number, board: number[]) => {
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
        leftCastlingEnabled = !moves.some(move => move[0] + Math.floor(i/8) === row && move[1] + i%8 < 5); //wtf did I do here? 
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

export const copy2DArray = (array: any[][]) => {
    return array.map(x => [...x]);
}

export const copy3DArray = (list: any[][][]) => {
    return list.map(array => copy2DArray(array));
  };
  

export const isSameColour = (piece: number, colour: number) => {
    return (piece > 0 && colour > 0) || (piece < 0 && colour < 0)
}