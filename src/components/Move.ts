export class Move {
    public static lastId: number = 0;
    public id: number;
    public colour: number;
    public piece: number;
    public startSquare: number;
    public targetSquare: number;
    public targetPiece: number;
    public fromX: number;
    public fromY: number;
    public toX: number;
    public toY: number;
    public changeX: number;
    public changeY: number;
    public pawnTwoSquaresMove: boolean;
    public promotionFlag: boolean;
    public enpassantFlag: boolean;
    public enpassantPosition: number;
    public castlingFlag: boolean;
    public preCastlingPosition: number;
    public postCastlingPosition: number;
    public gameResult: number;

    constructor(piece: number, startSquare: number, targetSquare: number, targetPiece: number) {
        Move.lastId++;
        this.id = Move.lastId;
        this.piece = piece;
        this.startSquare = startSquare;
        this.targetSquare = targetSquare;
        this.colour = piece > 0 ? 1 : -1;
        this.targetPiece = targetPiece;
        this.promotionFlag = false;
        this.castlingFlag = false;
        this.preCastlingPosition = -1;
        this.postCastlingPosition = -1;
        this.enpassantFlag = false;
        this.enpassantPosition = -1;
        this.pawnTwoSquaresMove = false;
        this.fromX = Math.floor(startSquare / 8);
        this.fromY = startSquare % 8;
        this.toX = Math.floor(targetSquare / 8);
        this.toY = targetSquare % 8;
        this.changeX = this.toX - this.fromX;
        this.changeY = this.toY = this.fromY;
        this.gameResult = 0;
    }
}