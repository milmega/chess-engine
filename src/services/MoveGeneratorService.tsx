import axios, { AxiosResponse } from 'axios';

export default class MoveGeneratorService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getMoveData(start: number, destination: number, colour: number): Promise<string> {
    const data = {
      start: start,
      destination: destination,
      colour: colour
    };

    try {
      const response: AxiosResponse<string> = await axios.get<string>(`${this.baseUrl}/move`, {params: data});
      return response.data;
    } catch(error) {
      throw new Error('Error fetching user data:' + error);
    }
  }

  async getAllMoves(colour: number): Promise<string> {
    try {
      const response: AxiosResponse<string> = await axios.get<string>(`${this.baseUrl}/allMoves?colour=${colour}`);
      return response.data;
    } catch(error) {
      throw new Error('Error fetching user data:' + error);
    }
  }

  async makeMove(colour: number, startSquare: number, targetSquare: number) {
    axios.post(`${this.baseUrl}/makeMove?colour=${colour}&start=${startSquare}&target=${targetSquare}`)
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
