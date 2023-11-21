import { Piece } from "./Board";

export const getMoves = (piece: number, cordinateX: number, cordinateY: number, board: number[][]) => {
    const movesForPiece: number[][] = getMovesForPiece(piece, cordinateX, cordinateY, board);

    if(Math.abs(piece) === Piece.KING || Math.abs(piece) === Piece.KNIGHT || Math.abs(piece) === Piece.PAWN) {
        return movesForPiece.filter(m => {
            let newX = cordinateX + m[0];
            let newY = cordinateY + m[1];
            if(newX < 0 || newX > 7 || newY < 0 || newY > 7) {
                return false;
            }
            return !isPieceSameColour(board[newX][newY], piece);
        });
    }

    const allMovesForPiece: number[][] = [];
    movesForPiece.forEach(m => {
        for(let i = 1; i < 8; i++) {
            let newX = cordinateX + m[0] * i;
            let newY = cordinateY + m[1] * i;
            if(newX < 0 || newX > 7 || newY < 0 || newY > 7) {
                break;
            }
            let potentialSquare = board[newX][newY]; 
            if(potentialSquare === 0) {
                allMovesForPiece.push([m[0] * i, m[1] * i]);
                continue;
            }
            else if(!isPieceSameColour(potentialSquare, piece)) {
                allMovesForPiece.push([m[0] * i, m[1] * i]);
            }
            break;
        }
    })
    return allMovesForPiece;
}

export const getMovesForPiece = (piece: number, cordinateX: number, cordinateY: number, board: number[][]) => {
    if(Math.abs(piece) === Piece.PAWN) {
        let pawnMoves: number[][] = [];
        if(piece > 0) {
            if(board[cordinateX - 1][cordinateY] === 0) {
                pawnMoves.push([-1, 0]);
            }
            if(cordinateX === 6 && board[5][cordinateY] === 0 && board[4][cordinateY] === 0) {
                pawnMoves.push([-2, 0]);
            }
            if(cordinateX > 0 && cordinateY > 0 && board[cordinateX - 1][cordinateY - 1] < 0) {
                pawnMoves.push([-1, -1]);
            }
            if(cordinateX > 0 && cordinateY < 7 && board[cordinateX - 1][cordinateY + 1] < 0) {
                pawnMoves.push([-1, 1])
            }
        } else { //black pawn
            if(board[cordinateX + 1][cordinateY] === 0) {
                pawnMoves.push([1, 0]);
            }
            if(cordinateX === 1 && board[2][cordinateY] === 0 && board[3][cordinateY] === 0) {
                pawnMoves.push([2, 0]);
            }
            if(cordinateX < 7 && cordinateY > 0 && board[cordinateX + 1][cordinateY - 1] > 0) {
                pawnMoves.push([1, -1]);
            }
            if(cordinateX < 7 && cordinateY < 7 && board[cordinateX + 1][cordinateY + 1] > 0) {
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

//returns list of attack moves for a piece to show a circle around potential prey or a list of all squares under attack that king cannot go to
export const getAttackMoves = (piece: number, fromX: number, fromY: number, possibleMoves: number[][], board: number[][], potentialAttacks: boolean = false) => {
    const attacks: number[][] = [];
    possibleMoves.forEach(m => {
        if(!potentialAttacks && board[fromX + m[0]][fromY + m[1]] !== 0 && !isPieceSameColour(board[fromX + m[0]][fromY + m[1]], piece)) {
            attacks.push([fromX + m[0], fromY + m[1]]);
        }
        else if(potentialAttacks && board[fromX + m[0]][fromY + m[1]] === 0) {
            attacks.push([fromX + m[0], fromY + m[1]]);
        }
    });
    return attacks;
}

//filters list of valid moves to prevent checking the king and enables moves that defend from checking
export const getValidMoves = (piece: number, moves: number[][], fromX: number, fromY: number, kingPosition: number[], castling: boolean[], board: number[][]) => {   
    const newMoves = moves.filter(move => {
        const newX = fromX + move[0];
        const newY = fromY + move[1];

        const tempBoard = copy2DArray(board);
        tempBoard[newX][newY] = piece;
        tempBoard[fromX][fromY] = 0;

        if(Math.abs(piece) === Piece.KING) {
            return !isKingUnderCheck(newX, newY, tempBoard);
        } else {
            return !isKingUnderCheck(kingPosition[0], kingPosition[1], tempBoard);
        }
    });
    if(Math.abs(piece) === Piece.KING && !castling[0] && (!castling[1] || !castling[2])) {
        newMoves.push(...getCastlingMoves(piece > 0 ? 1 : -1, castling, board));
    }
    return newMoves;
}

//checks if king in checkmated
export const isKingCheckmated = (kingPosition: number[], colour: number, board: number[][]) => {
    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            if(board[i][j] === 0 || isSameColour(board[i][j], colour)) {
                continue;
            }
            const moves = getValidMoves(board[i][j], getMoves(board[i][j], i, j, board), i, j, kingPosition, [false, false, false], board);
            if(moves.length > 0) {
                return false;
            }
        }
    }
    return true;
}

//checks if king is under check
const isKingUnderCheck = (kingX: number, kingY: number, board: number[][]) => {
    const colour = board[kingX][kingY] > 0 ? 1 : -1;
    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            if(board[i][j] === 0 || isSameColour(board[i][j], colour)) {
                continue;
            }
            const moves = getMoves(board[i][j], i, j, board);
            const attackMoves = getAttackMoves(board[i][j], i, j, moves, board);

            if(attackMoves.some(move => kingX === move[0] && kingY === move[1])) {
                return true;
            }
        }
    }
    return false;
}

//checks if castling is possible and returns an array with possible moves
const getCastlingMoves = (colour: number, castling: boolean[], board: number[][]) => {
    const castlingMoves: number[][] = [];
    const row = colour === 1 ? 7 : 0;
    let leftCastlingEnabled: boolean = true;
    let rightCastlingEnabled: boolean = true;

    for(let i = 0; i < 8; i++) {
        if(!leftCastlingEnabled && !rightCastlingEnabled) {
            break;
        }
        for(let j = 0; j < 8; j++) {
            if(board[i][j] === 0 || board[i][j]*colour > 0) {
                continue;
            }

            const moves = getMoves(board[i][j], i, j, board);
            leftCastlingEnabled = !moves.some(move => move[0] + i === row && move[1] + j < 5);
            rightCastlingEnabled = !moves.some(move => move[0] + i === row && move[1] + j > 3);
        }
    }
    if(!castling[1] && leftCastlingEnabled && board[row][1] === 0 && board[row][2] === 0 && board[row][3] === 0) { //if left rook hasn't moved
        castlingMoves.push([0, -2]);
    }
    if(!castling[2] && rightCastlingEnabled && board[row][5] === 0 && board[row][6] === 0) { //if right rook hasn't moved
        castlingMoves.push([0, 2]);
    }

    return castlingMoves;
}

const copy2DArray = (array: any[][]) => {
    return array.map(x => [...x]);
}

export const isSameColour = (piece: number, colour: number) => {
    return (piece > 0 && colour > 0) || (piece < 0 && colour < 0)
}

export const isPieceSameColour = (piece1: number, piece2: number) => {
    return (piece1 > 0 && piece2 > 0) || (piece1 < 0 && piece2 < 0);
}