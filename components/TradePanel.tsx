
import React, { useState } from 'react';
import { Coin } from '../types';
import { TrendingUp, TrendingDown, XCircle } from 'lucide-react';

interface TradePanelProps {
    coins: Coin[];
    selectedCoinId: string;
    handleCoinChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    buyCoin: (amount: number) => void;
    sellCoin: (amount: number) => void;
    sellAllCoins: () => void;
}

const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    if (value < 0.01 && value > 0) return `$${value.toFixed(4)}`;
    return `$${value.toFixed(2)}`;
};

const TradePanel: React.FC<TradePanelProps> = ({ coins, selectedCoinId, handleCoinChange, buyCoin, sellCoin, sellAllCoins }) => {
    const [amount, setAmount] = useState('');

    const handleBuy = () => {
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount) && numAmount > 0) {
            buyCoin(numAmount);
        }
    };

    const handleSell = () => {
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount) && numAmount > 0) {
            sellCoin(numAmount);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-white">Trade Center</h2>
            <div>
                <label htmlFor="coin-select" className="block text-sm font-medium text-gray-300 mb-1">
                    Choose Coin
                </label>
                <select
                    id="coin-select"
                    value={selectedCoinId}
                    onChange={handleCoinChange}
                    className="w-full bg-brand-secondary/50 border border-brand-secondary/30 text-white rounded-lg focus:ring-brand-primary focus:border-brand-primary p-2.5"
                >
                    {coins.map(coin => (
                        <option key={coin.id} value={coin.id}>
                            {coin.name} ({formatCurrency(coin.price)})
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="amount-input" className="block text-sm font-medium text-gray-300 mb-1">
                    Amount
                </label>
                <input
                    type="number"
                    id="amount-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 10.5"
                    min="0"
                    className="w-full bg-brand-secondary/50 border border-brand-secondary/30 text-white rounded-lg focus:ring-brand-primary focus:border-brand-primary p-2.5"
                />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleBuy}
                    className="flex items-center justify-center gap-2 w-full bg-brand-accent-green/80 hover:bg-brand-accent-green text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <TrendingUp size={18} /> Buy
                </button>
                <button
                    onClick={handleSell}
                    className="flex items-center justify-center gap-2 w-full bg-brand-accent-red/80 hover:bg-brand-accent-red text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <TrendingDown size={18} /> Sell
                </button>
            </div>
             <button
                onClick={sellAllCoins}
                className="flex items-center justify-center gap-2 w-full bg-yellow-600/80 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                <XCircle size={18} /> Sell All
            </button>
        </div>
    );
};

export default TradePanel;
