
import React from 'react';
import { Play, FolderOpen, DoorOpen } from 'lucide-react';

interface StartMenuProps {
    onNewGame: () => void;
    onLoadGame: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ onNewGame, onLoadGame }) => {
    return (
        <div className="bg-brand-bg min-h-screen flex flex-col items-center justify-center text-white p-4">
            <div className="text-center mb-12">
                <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">Crypto Trading Simulator</h1>
                <p className="text-lg text-gray-400">Hone your skills, watch the market, become a legend.</p>
            </div>
            <div className="w-full max-w-sm space-y-4">
                <button
                    onClick={onNewGame}
                    className="w-full flex items-center justify-center gap-3 text-lg font-semibold bg-brand-accent-green/80 hover:bg-brand-accent-green text-white py-4 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105"
                >
                    <Play size={24} />
                    New Game
                </button>
                <button
                    onClick={onLoadGame}
                    className="w-full flex items-center justify-center gap-3 text-lg font-semibold bg-brand-primary/80 hover:bg-brand-primary text-white py-4 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105"
                >
                    <FolderOpen size={24} />
                    Load Game
                </button>
                 <button
                    onClick={() => window.close()}
                    className="w-full flex items-center justify-center gap-3 text-lg font-semibold bg-brand-secondary/80 hover:bg-brand-secondary text-white py-4 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105"
                >
                    <DoorOpen size={24} />
                    Quit Game
                </button>
            </div>
             <footer className="absolute bottom-4 text-xs text-gray-500">
                A Gemini-Powered Simulator
            </footer>
        </div>
    );
};

export default StartMenu;
