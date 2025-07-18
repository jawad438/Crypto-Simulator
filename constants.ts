
export const NORMAL_STARTING_CASH = 10000;
export const SANDBOX_STARTING_CASH = 1000000000;
export const LOCAL_STORAGE_KEY = 'cryptoSimSaveSlots_v3';
export const MAX_SAVE_SLOTS = 10;

export const PC_MAX_LEVEL = 4;
export const GPU_LIMIT_PER_PC = 10;
export const GPU_COST = 400;
export const PC_COSTS = [
  1000, // Cost to buy (level 1)
  5000, // Cost to upgrade to level 2
  25000, // Cost to upgrade to level 3
  100000, // Cost to upgrade to level 4
];

// History is now initialized dynamically in useGameLogic
export const INITIAL_COINS_DATA = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 60000 },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 3000 },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', price: 1 },
  { id: 'bnb', name: 'Binance Coin', symbol: 'BNB', price: 580 },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', price: 0.45 },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', price: 0.52 },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', price: 0.15 },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', price: 7.5 },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', price: 85 },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 150 },
  { id: 'matic', name: 'Polygon', symbol: 'MATIC', price: 0.7 },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', price: 35 },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', price: 18 },
  { id: 'atom', name: 'Cosmos', symbol: 'ATOM', price: 11 },
  { id: 'uni', name: 'Uniswap', symbol: 'UNI', price: 10 },
  { id: 'xlm', name: 'Stellar', symbol: 'XLM', price: 0.11 },
  { id: 'vet', name: 'VeChain', symbol: 'VET', price: 0.035 },
  { id: 'theta', name: 'Theta', symbol: 'THETA', price: 2.5 },
  { id: 'fil', name: 'Filecoin', symbol: 'FIL', price: 6 },
  { id: 'algo', name: 'Algorand', symbol: 'ALGO', price: 0.18 },
];

export const TIME_SPEEDS = [
    { label: 'Paused', value: 0 },
    { label: '1 Day/sec', value: 1 },
    { label: '7 Days/sec', value: 7 },
    { label: '30 Days/sec', value: 30 },
];
