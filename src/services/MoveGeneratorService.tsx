import axios, { AxiosResponse } from 'axios';
import { Move } from '../components/Move';

export default class MoveGeneratorService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getBestMove(colour: number): Promise<Move> {
    try {
      const response: AxiosResponse<Move> = await axios.get<Move>(`${this.baseUrl}/move?colour=${colour}`);
      return response.data;
    } catch(error) {
      throw new Error('Error fetching user data:' + error);
    }
  }

  async getAllMoves(colour: number): Promise<Move[]> {
    try {
      const response: AxiosResponse<Move[]> = await axios.get<Move[]>(`${this.baseUrl}/allMoves?colour=${colour}`);
      return response.data;
    } catch(error) {
      throw new Error('Error fetching user data:' + error);
    }
  }

  async makeMove(move: Move) {
    axios.post(`${this.baseUrl}/makeMove`, move)
      .then(response => {
        console.log('Move made successfully');
      })
      .catch(error => {
        console.error('Error making the request:', error);
      });
  }

  async resetBoard() {
    axios.post(`${this.baseUrl}/reset`)
      .then(response => {
        console.log('Reset successful');
      })
      .catch(error => {
        console.error('Error making the request:', error);
      });
  }

}
