
import React from 'react';
import { ActionType } from '../types';
import { Megaphone, Handshake, Lightbulb, Calendar, Timer, BrainCircuit } from 'lucide-react';
import { TIME_SPEEDS } from '../constants';

interface ActionsPanelProps {
    handleAction: (action: ActionType) => void;
    getProAdvice: () => void;
    isGeneratingAdvice: boolean;
    cash: number;
    sandboxMode: boolean;
    gameDate: string;
    timeSpeed: number;
    setTimeSpeed: (speed: number) => void;
}

const ActionButton: React.FC<{
    onClick: () => void;
    label: string;
    cost: number;
    icon: React.ReactNode;
    disabled: boolean;
    isThinking?: boolean;
}> = ({ onClick, label, cost, icon, disabled, isThinking }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full flex items-center justify-between bg-brand-secondary/50 hover:bg-brand-secondary/80 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold">{isThinking ? 'Thinking...' : label}</span>
        </div>
        {!isThinking && <span className="text-xs text-red-400">(${cost.toLocaleString()})</span>}
    </button>
);


const ActionsPanel: React.FC<ActionsPanelProps> = ({ handleAction, getProAdvice, isGeneratingAdvice, cash, sandboxMode, gameDate, timeSpeed, setTimeSpeed }) => {
    const isPromoteDisabled = !sandboxMode && cash < 400;
    const isBribeDisabled = !sandboxMode && cash < 100000;
    const isAdviceDisabled = (!sandboxMode && cash < 150) || isGeneratingAdvice;
    
    const formattedDate = new Date(gameDate).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="bg-black/20 p-4 rounded-lg border border-brand-secondary/20 space-y-4">
            <div>
                <h2 className="text-xl font-semibold text-center text-white mb-2">Actions</h2>
                <div className="space-y-3">
                    <ActionButton 
                        onClick={() => handleAction('promote')} 
                        label="Post Promotion" 
                        cost={400} 
                        icon={<Megaphone className="text-blue-400" size={20} />} 
                        disabled={isPromoteDisabled}
                    />
                    <ActionButton 
                        onClick={() => handleAction('bribe')} 
                        label="Bribe Owner" 
                        cost={100000} 
                        icon={<Handshake className="text-green-400" size={20} />} 
                        disabled={isBribeDisabled}
                    />
                    <ActionButton 
                        onClick={getProAdvice} 
                        label="Buy Pro Advice" 
                        cost={150} 
                        icon={<BrainCircuit className="text-yellow-400" size={20} />}
                        disabled={isAdviceDisabled}
                        isThinking={isGeneratingAdvice}
                    />
                </div>
            </div>
            <div className="h-px bg-brand-secondary/30"></div>
            <div>
                 <h2 className="text-xl font-semibold text-center text-white mb-3">Controls</h2>
                 <div className="flex items-center justify-center gap-2 text-lg mb-3 bg-brand-secondary/30 p-2 rounded-lg">
                    <Calendar size={20} className="text-brand-primary"/>
                    <span className="font-mono text-gray-200">{formattedDate}</span>
                 </div>
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {TIME_SPEEDS.map(speed => (
                        <button
                            key={speed.value}
                            onClick={() => setTimeSpeed(speed.value)}
                            className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                timeSpeed === speed.value 
                                ? 'bg-brand-primary text-white shadow-lg' 
                                : 'bg-brand-secondary/50 hover:bg-brand-secondary/80 text-gray-300'
                            }`}
                        >
                            {speed.label}
                        </button>
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default ActionsPanel;
