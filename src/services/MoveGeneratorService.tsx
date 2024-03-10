import axios, { AxiosResponse } from 'axios';
import { Move } from '../components/Move';

export default class MoveGeneratorService {
    private baseUrl: string;

    constructor() {
      this.baseUrl = 'https://chess-engine-service-sjnc6hg37q-ew.a.run.app';
      //this.baseUrl = 'http://localhost:8080';
    }

    async getBestMove(id: number, colour: number): Promise<Move> {
        try {
            const response: AxiosResponse<Move> = await axios.get<Move>(`${this.baseUrl}/move?id=${id}&colour=${colour}`);
            return response.data;
        } catch(error) {
            throw new Error('Error fetching user data:' + error);
        }
    }

    async getAllMoves(id: number, colour: number): Promise<Move[]> {
        try {
            const response: AxiosResponse<Move[]> = await axios.get<Move[]>(`${this.baseUrl}/allMoves?id=${id}&colour=${colour}`);
            return response.data;
        } catch(error) {
            throw new Error('Error fetching user data:' + error);
        }
    }

    async makeMove(id: number, move: Move): Promise<number> {
        try {
            const response: AxiosResponse<number> = await axios.post<number>(`${this.baseUrl}/makeMove?id=${id}`, move);
            return response.data;
        } catch(error) {
            throw new Error('Error making the request:' + error);
        }
    }

    async createNewGame(colour: number, playerId: number): Promise<number> {
        try {
            const response: AxiosResponse<number> = await axios.get<number>(`${this.baseUrl}/newGame?colour=${colour}&playerId=${playerId}`);
            return response.data;
        } catch(error) {
            throw new Error('Error while creating new game:' + error);
        }
    }

    async resetGame(id: number) {
        axios.post(`${this.baseUrl}/reset?id=${id}`)
            .then(response => console.log('Reset successful'))
            .catch(error => {
                console.error('Error making the request:', error);
            });
    }

    async cancelSearch(playerId: number) {
        axios.post(`${this.baseUrl}/cancelSearch?id=${playerId}`)
            .then(_ => console.log('Search cancelled successfully'))
            .catch(error => {
                console.error('Error making the request:', error);
            });
    }

    async fetchOpponentMove(gameId: number): Promise<Move> {
        try {
            const response: AxiosResponse<Move> = await axios.get<Move>(`${this.baseUrl}/fetchMove?gameId=${gameId}`);
            return response.data;
        } catch(error) {
            throw new Error('Error fetching user data:' + error);
        }
    }

    async checkIfGameIsLive(gameId: number): Promise<boolean> {
        try {
            const response: AxiosResponse<boolean> = await axios.get<boolean>(`${this.baseUrl}/isGameLive?gameId=${gameId}`);
            return response.data;
        } catch(error) {
            throw new Error('Error fetching user data:' + error);
        }
    }

    async generateID(): Promise<number> {
        try {
            const response: AxiosResponse<number> = await axios.get<number>(`${this.baseUrl}/generateId`);
            return response.data;
        } catch(error) {
            throw new Error('Error while generating Id' + error);
        }
    }
}
