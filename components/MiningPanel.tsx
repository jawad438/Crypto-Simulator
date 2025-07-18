
import React from 'react';
import { PC, Coin } from '../types';
import PCSlot from './PCSlot';
import { Cpu } from 'lucide-react';

interface MiningPanelProps {
    pcs: PC[];
    coins: Coin[];
    cash: number;
    sandboxMode: boolean;
    buyOrUpgradePc: (pcId: number) => void;
    buyGpu: (pcId: number) => void;
    setMiningCoin: (pcId: number, coinId: string | null) => void;
}

const MiningPanel: React.FC<MiningPanelProps> = (props) => {
    return (
        <div className="bg-black/20 p-4 rounded-lg border border-brand-secondary/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Cpu size={22} className="text-brand-primary" />
                Mining Operations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {props.pcs.map(pc => (
                    <PCSlot 
                        key={pc.id}
                        pc={pc}
                        {...props}
                    />
                ))}
            </div>
        </div>
    );
};

export default MiningPanel;
