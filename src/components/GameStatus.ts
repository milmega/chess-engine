import { Move } from "./Move";

export class GameStatus {
    public isGameLive: boolean;
    public lastMove: Move;
    public whiteTime: number;
    public blackTime: number;
    
    constructor(isGameLive: boolean, lastMove: Move, whiteTime: number, blackTime: number) {
        this.isGameLive = isGameLive;
        this.lastMove = lastMove;
        this.whiteTime = whiteTime;
        this.blackTime = blackTime;
    }
}