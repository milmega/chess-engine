export const getMoves = (figure: string, cordinateX: number, cordinateY: number, board: string[][]) => {
    const movesForFigure: number[][] = getMovesForFigure(figure, cordinateX, cordinateY, board);

    if(figure.startsWith("king") || figure.startsWith("knight") || figure.startsWith("pawn")) {
        return movesForFigure.filter(m => {
            let newX = cordinateX + m[0];
            let newY = cordinateY + m[1];
            if(newX < 0 || newX > 7 || newY < 0 || newY > 7) {
                return false;
            }
            if((board[newX][newY].endsWith("black") && figure.endsWith("black"))
                || (board[newX][newY].endsWith("white") && figure.endsWith("white"))) {
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
            let potentialSquare = board[newX][newY]; 
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

export const getMovesForFigure = (figure: string, cordinateX: number, cordinateY: number, board: string[][]) => {
    if(figure.startsWith("pawn")) {
        let pawnMoves: number[][] = [];
        if(figure.endsWith("white")) {
            if(board[cordinateX - 1][cordinateY] === "") {
                pawnMoves.push([-1, 0]);
            }
            if(cordinateX === 6 && board[5][cordinateY] === "" && board[4][cordinateY] === "") {
                pawnMoves.push([-2, 0]);
            }
            if(cordinateX > 0 && cordinateY > 0 && board[cordinateX - 1][cordinateY - 1].endsWith("black")) {
                pawnMoves.push([-1, -1]);
            }
            if(cordinateX > 0 && cordinateY < 7 && board[cordinateX + 1][cordinateY + 1].endsWith("black")) {
                pawnMoves.push([-1, 1])
            }
        } else { //black pawn
            if(board[cordinateX + 1][cordinateY] === "") {
                pawnMoves.push([1, 0]);
            }
            if(cordinateX === 1 && board[2][cordinateY] === "" && board[3][cordinateY] === "") {
                pawnMoves.push([2, 0]);
            }
            if(cordinateX < 7 && cordinateY > 0 && board[cordinateX + 1][cordinateY - 1].endsWith("white")) {
                pawnMoves.push([1, -1]);
            }
            if(cordinateX < 7 && cordinateY < 7 && board[cordinateX + 1][cordinateY + 1].endsWith("white")) {
                pawnMoves.push([1, 1])
            }
        }
        return pawnMoves;
    }
    if(figure.startsWith("rook")) {
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

//returns list of attack moves for a figure to show a circle around potential prey or a list of all squares under attack that king cannot go to
export const getAttackMoves = (figure: string, fromX: number, fromY: number, possibleMoves: number[][], board: string[][], potentialAttacks: boolean = false) => {
    const attacks: number[][] = [];
    possibleMoves.forEach(m => {
        if(!potentialAttacks && board[fromX + m[0]][fromY + m[1]] !== "" && board[fromX + m[0]][fromY + m[1]].slice(-5) !== figure.slice(-5)) {
            attacks.push([fromX + m[0], fromY + m[1]]);
        }
        else if(potentialAttacks && board[fromX + m[0]][fromY + m[1]] === "") {
            attacks.push([fromX + m[0], fromY + m[1]]);
        }
    });
    return attacks;
}

//filters list of valid moves to prevent checking the king and enables moves that defend from checking
export const getValidMoves = (figure: string, moves: number[][], fromX: number, fromY: number, kingPosition: number[], board: string[][]) => {
    //TODO figure out hot filter moves for all pieces so they dont cause king to be checked
    
    const newMoves = moves.filter(move => {
        const newX = fromX + move[0];
        const newY = fromY + move[1];

        const tempBoard = copy2DArray(board);
        tempBoard[newX][newY] = figure;
        tempBoard[fromX][fromY] = "";

        if(figure.startsWith("king")) {
            return !isKingUnderCheck(newX, newY, tempBoard);
        } else {
            return !isKingUnderCheck(kingPosition[0], kingPosition[1], tempBoard);
        }
         
    });

    return newMoves;
}

const isKingUnderCheck = (kingX: number, kingY: number, board: string[][]) => {
    const color = board[kingX][kingY].slice(-5);

    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            if(board[i][j] === "" || board[i][j].endsWith(color)) {
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

const copy2DArray = (array: any[][]) => {
    return array.map(x => [...x]);
}