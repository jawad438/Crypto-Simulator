
import React from 'react';
import { Power, RefreshCcw, Save } from 'lucide-react';

interface HeaderProps {
    resetGame: () => void;
    sandboxMode: boolean;
    toggleSandboxMode: () => void;
    onShowSaveSlots: () => void;
}

const Header: React.FC<HeaderProps> = ({ resetGame, sandboxMode, toggleSandboxMode, onShowSaveSlots }) => {
    return (
        <header className="absolute top-4 left-4 right-4 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <button
                    onClick={onShowSaveSlots}
                    className="flex items-center gap-2 text-xs sm:text-sm bg-brand-primary/80 hover:bg-brand-primary text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-all duration-200"
                >
                    <Save size={16} />
                    <span className="hidden sm:inline">Save Slots</span>
                </button>
                <button
                    onClick={resetGame}
                    title="Start a new game in the current slot"
                    className="flex items-center gap-2 text-xs sm:text-sm bg-brand-accent-red/80 hover:bg-brand-accent-red text-white font-semibold py-2 px-3 rounded-lg shadow-md transition-all duration-200"
                >
                    <RefreshCcw size={16} />
                    <span className="hidden sm:inline">New Game</span>
                </button>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-semibold text-gray-300">Sandbox Mode</span>
                <label htmlFor="sandbox-toggle" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="sandbox-toggle"
                            className="sr-only"
                            checked={sandboxMode}
                            onChange={toggleSandboxMode}
                        />
                        <div className={`block w-14 h-8 rounded-full ${sandboxMode ? 'bg-brand-accent-green' : 'bg-brand-secondary'}`}></div>
                        <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out" style={{ transform: sandboxMode ? 'translateX(100%)' : 'translateX(0)' }}>
                            <Power size={18} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${sandboxMode ? 'text-brand-accent-green' : 'text-brand-secondary'}`} />
                        </div>
                    </div>
                </label>
            </div>
        </header>
    );
};

export default Header;
