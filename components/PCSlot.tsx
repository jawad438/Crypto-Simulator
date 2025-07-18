
import React from 'react';
import { PC, Coin } from '../types';
import { PC_COSTS, GPU_COST, PC_MAX_LEVEL, GPU_LIMIT_PER_PC } from '../constants';
import { Server, MemoryStick, Hammer, PlusCircle, ChevronDown } from 'lucide-react';

interface PCSlotProps {
    pc: PC;
    coins: Coin[];
    cash: number;
    sandboxMode: boolean;
    buyOrUpgradePc: (pcId: number) => void;
    buyGpu: (pcId: number) => void;
    setMiningCoin: (pcId: number, coinId: string | null) => void;
}

const PCSlot: React.FC<PCSlotProps> = ({ pc, coins, cash, sandboxMode, buyOrUpgradePc, buyGpu, setMiningCoin }) => {
    const isMaxLevel = pc.level >= PC_MAX_LEVEL;
    const isMaxGpus = pc.gpus >= GPU_LIMIT_PER_PC;
    
    const upgradeCost = isMaxLevel ? 0 : PC_COSTS[pc.level];

    const canAffordUpgrade = sandboxMode || cash >= upgradeCost;
    const canAffordGpu = sandboxMode || cash >= GPU_COST;

    const handleCoinSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setMiningCoin(pc.id, e.target.value === 'none' ? null : e.target.value);
    };

    return (
        <div className="bg-brand-secondary/30 border border-brand-secondary/50 rounded-lg p-3 space-y-3 flex flex-col justify-between">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-white">PC Slot #{pc.id + 1}</h3>
                <div className="flex items-center gap-3 text-xs">
                     <div className="flex items-center gap-1">
                        <Server size={14} className={pc.level > 0 ? 'text-green-400' : 'text-gray-500'}/>
                        <span>Lvl {pc.level}</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <MemoryStick size={14} className={pc.gpus > 0 ? 'text-blue-400' : 'text-gray-500'}/>
                        <span>{pc.gpus}/{GPU_LIMIT_PER_PC}</span>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2">
                <button
                    onClick={() => buyOrUpgradePc(pc.id)}
                    disabled={isMaxLevel || !canAffordUpgrade}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-md shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Hammer size={16} />
                    {pc.level === 0 ? 'Buy PC' : 'Upgrade PC'}
                    {!isMaxLevel && <span className="text-xs">(${upgradeCost.toLocaleString()})</span>}
                </button>
                 <button
                    onClick={() => buyGpu(pc.id)}
                    disabled={pc.level === 0 || isMaxGpus || !canAffordGpu}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-green-600/80 hover:bg-green-600 text-white font-semibold py-1.5 px-3 rounded-md shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusCircle size={16} />
                    Buy GPU
                    <span className="text-xs">(${GPU_COST.toLocaleString()})</span>
                </button>
            </div>
            
            <div className="relative">
                 <label htmlFor={`mining-select-${pc.id}`} className="sr-only">Select coin to mine</label>
                 <select
                    id={`mining-select-${pc.id}`}
                    value={pc.miningCoinId || 'none'}
                    onChange={handleCoinSelect}
                    disabled={pc.gpus === 0}
                    className="w-full appearance-none bg-brand-secondary/50 border border-brand-secondary/30 text-white text-sm rounded-md focus:ring-brand-primary focus:border-brand-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <option value="none">-- Select Coin --</option>
                    {coins
                        .filter(c => c.symbol !== 'USDT') // Can't mine stablecoin
                        .map(coin => (
                        <option key={coin.id} value={coin.id}>
                           Mine {coin.symbol}
                        </option>
                    ))}
                 </select>
                 <ChevronDown size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );
};

export default PCSlot;
