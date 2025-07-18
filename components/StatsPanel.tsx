
import React from 'react';
import { Coin } from '../types';
import { DollarSign, Coins, Briefcase } from 'lucide-react';

interface StatsPanelProps {
    cash: number;
    holdings: number;
    selectedCoin: Coin;
    netWorth: number;
    sandboxMode: boolean;
}

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
};

const StatItem: React.FC<{ icon: React.ReactNode, label: string, value: string, subValue?: string }> = ({ icon, label, value, subValue }) => (
    <div className="flex items-center gap-3">
        <div className="flex-shrink-0 bg-brand-secondary/50 p-2 rounded-full text-brand-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-lg font-bold text-white">{value} <span className="text-xs font-normal text-gray-400">{subValue}</span></p>
        </div>
    </div>
);

const StatsPanel: React.FC<StatsPanelProps> = ({ cash, holdings, selectedCoin, netWorth, sandboxMode }) => {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-white">Your Portfolio</h2>
            <StatItem icon={<DollarSign size={20} />} label="Cash" value={formatCurrency(cash)} />
            <StatItem 
                icon={<Coins size={20} />} 
                label="Holdings" 
                value={holdings.toFixed(4)}
                subValue={`(${selectedCoin.symbol})`}
            />
            <StatItem 
                icon={<Briefcase size={20} />} 
                label="Net Worth" 
                value={formatCurrency(netWorth)}
                subValue={sandboxMode ? '(Sandbox)' : ''}
            />
        </div>
    );
};

export default StatsPanel;
