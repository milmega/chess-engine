export class Move {
    public static lastId: number = 0;
    public id: number;
    public piece: number;
    public start: number;
    public target: number;
    public colour: number;
    public capture: number;
    public promotionFlag: boolean
    public castlingFlag: boolean;
    public castlingPosition: number;
    public enpassantFlag: boolean;
    public enpassantPosition: number;

    constructor(piece: number, start: number, target: number, colour: number, capture: number) {
        Move.lastId++;
        this.id = Move.lastId;
        this.piece = piece;
        this.start = start;
        this.target = target;
        this.colour = colour;
        this.capture = capture;
        this.promotionFlag = false;
        this.castlingFlag = false;
        this.castlingPosition = -1;
        this.enpassantFlag = false;
        this.enpassantPosition = -1;
    }
}