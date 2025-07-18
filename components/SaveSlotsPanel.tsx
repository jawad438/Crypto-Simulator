
import React, { useMemo } from 'react';
import { SaveSlot, GameState } from '../types';
import { Save, FolderOpen, Trash2, X, PlusCircle } from 'lucide-react';

interface SaveSlotsPanelProps {
    slots: SaveSlot[];
    activeSlotIndex: number;
    onClose: () => void;
    onLoad: (index: number) => void;
    onSave: (index: number) => void;
    onDelete: (index: number) => void;
    onNewGame: (index: number) => void;
}

const formatRelativeTime = (isoString: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays}d ago`;
};

const getNetWorth = (gameState: GameState | null) => {
    if (!gameState) return 0;
    const holdingsValue = Object.keys(gameState.holdings).reduce((acc, coinId) => {
        const coin = gameState.coins.find(c => c.id === coinId);
        const amount = gameState.holdings[coinId];
        if (coin && amount) {
            return acc + coin.price * amount;
        }
        return acc;
    }, 0);
    return gameState.cash + holdingsValue;
};

const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
};

const SaveSlotsPanel: React.FC<SaveSlotsPanelProps> = ({ slots, activeSlotIndex, onClose, onLoad, onSave, onDelete, onNewGame }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl bg-brand-surface rounded-2xl shadow-2xl border border-brand-secondary/30 p-6 relative">
                <h2 className="text-2xl font-bold text-center text-white mb-6">Manage Game Saves</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {slots.map((slot, index) => {
                        const isSlotActive = index === activeSlotIndex;
                        const isEmpty = !slot.gameState;
                        const netWorth = useMemo(() => getNetWorth(slot.gameState), [slot.gameState]);

                        return (
                            <div key={index} className={`p-4 rounded-lg border-2 transition-all ${isSlotActive ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-secondary/30 bg-black/20'}`}>
                                <h3 className="font-bold text-lg text-white">
                                    Slot {index + 1} {isSlotActive && <span className="text-xs text-brand-primary">(Active)</span>}
                                </h3>
                                {isEmpty ? (
                                    <div className="text-center py-6">
                                        <p className="text-gray-400 mb-4">Empty Slot</p>
                                        <button onClick={() => onNewGame(index)} className="flex items-center justify-center gap-2 w-full text-sm bg-brand-accent-green/80 hover:bg-brand-accent-green text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                            <PlusCircle size={16}/> Start New Game
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 mt-2">
                                        <div className="text-sm text-gray-300">
                                            <p>Net Worth: <span className="font-semibold text-white">{formatCurrency(netWorth)} {slot.gameState?.sandboxMode && '(SB)'}</span></p>
                                            <p>Last Saved: <span className="font-semibold text-white">{formatRelativeTime(slot.lastSaved)}</span></p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button onClick={() => onSave(index)} disabled={!isSlotActive} className="flex items-center justify-center gap-2 text-xs bg-blue-600/80 hover:bg-blue-600 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                                <Save size={14}/> Save
                                            </button>
                                            <button onClick={() => onLoad(index)} className="flex items-center justify-center gap-2 text-xs bg-green-600/80 hover:bg-green-600 text-white font-bold py-2 rounded-md transition-colors">
                                                <FolderOpen size={14}/> Load
                                            </button>
                                            <button onClick={() => onDelete(index)} className="flex items-center justify-center gap-2 text-xs bg-red-600/80 hover:bg-red-600 text-white font-bold py-2 rounded-md transition-colors">
                                                <Trash2 size={14}/> Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SaveSlotsPanel;
