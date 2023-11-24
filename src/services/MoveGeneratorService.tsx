import axios, { AxiosResponse } from 'axios';

export default class MoveGeneratorService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getMoveData(board: string, colour: number, whiteKing: number, blackKing: number, whiteCastling: string, blackCastling: string): Promise<string> {
    try {
        const response: AxiosResponse<string> = 
          await axios.get<string>(`${this.baseUrl}/move?board=${board}&colour=${colour}&whiteKing=${whiteKing}&blackKing=${blackKing}&whiteCastling=${whiteCastling}&blackCastling=${blackCastling}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching user data');
    }
  }
}
