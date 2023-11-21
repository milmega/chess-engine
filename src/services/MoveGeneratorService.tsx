import axios, { AxiosResponse } from 'axios';

export default class MoveGeneratorService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getMoveData(board: string, colour: boolean): Promise<string> {
    try {
        const response: AxiosResponse<string> = await axios.get<string>(`${this.baseUrl}/move?board=${board}&colour=${colour}`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching user data');
    }
  }
}
