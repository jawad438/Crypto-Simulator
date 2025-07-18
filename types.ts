
export interface Coin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  history: { date: string; price: number }[];
}

export interface Holdings {
  [key: string]: number;
}

export interface PC {
  id: number;
  level: number; // 0 for not bought, 1-4 for levels
  gpus: number; // 0-10
  miningCoinId: string | null;
}

export interface GameState {
  coins: Coin[];
  selectedCoinId: string;
  cash: number;
  holdings: Holdings;
  message: string;
  sandboxMode: boolean;
  initialCash: number;
  news: { headline: string; content: string; isAiNews: boolean };
  timeStep: number;
  gameDate: string;
  timeSpeed: number; // Days per tick
  pcs: PC[];
  isGeneratingAdvice?: boolean;
}

export type ActionType = 'promote' | 'bribe' | 'advice';

export interface AiNewsResponse {
  coinId: string;
  headline: string;
  content: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  impact: number;
}

export interface AiProAdvice {
  buy: {
      coinId: string;
      reason: string;
  };
  sell: {
      coinId: string;
      reason: string;
  };
}

export interface SaveSlot {
    gameState: GameState | null;
    lastSaved: string | null;
}
