
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameLogic, getNewGameState } from './hooks/useGameLogic';
import Header from './components/Header';
import StatsPanel from './components/StatsPanel';
import TradePanel from './components/TradePanel';
import ActionsPanel from './components/ActionsPanel';
import NewsPanel from './components/NewsPanel';
import PriceChart from './components/PriceChart';
import MiningPanel from './components/MiningPanel';
import StartMenu from './components/StartMenu';
import SaveSlotsPanel from './components/SaveSlotsPanel';
import { RefreshCw } from 'lucide-react';
import { GameState, SaveSlot } from './types';
import { LOCAL_STORAGE_KEY, MAX_SAVE_SLOTS } from './constants';

const GameView: React.FC<{ gameState: GameState, logic: any }> = ({ gameState, logic }) => {
    const selectedCoin = gameState.coins.find(c => c.id === gameState.selectedCoinId);

    if (!selectedCoin) {
        return <div className="bg-brand-bg min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    const netWorth = useMemo(() => {
        const holdingsValue = Object.keys(gameState.holdings).reduce((acc, coinId) => {
            const coin = gameState.coins.find(c => c.id === coinId);
            const amount = gameState.holdings[coinId];
            if (coin && amount) {
                return acc + coin.price * amount;
            }
            return acc;
        }, 0);
        return gameState.cash + holdingsValue;
    }, [gameState.cash, gameState.holdings, gameState.coins]);

    return (
        <div className="bg-brand-bg text-gray-100 min-h-screen font-sans p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-7xl bg-brand-surface/70 backdrop-blur-md rounded-2xl shadow-2xl border border-brand-secondary/30 p-4 sm:p-6 md:p-8 relative">
                <Header 
                    resetGame={logic.fullReset} 
                    sandboxMode={gameState.sandboxMode} 
                    toggleSandboxMode={logic.toggleSandboxMode} 
                    onShowSaveSlots={logic.showSaveSlots}
                />

                <main>
                    <h1 className="text-3xl sm:text-4xl font-bold text-center text-white mb-4 pt-12 sm:pt-8">
                        Crypto Trading Simulator
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-black/20 p-4 rounded-lg border border-brand-secondary/20">
                                <PriceChart data={selectedCoin.history} coinSymbol={selectedCoin.symbol} />
                            </div>
                            <NewsPanel news={gameState.news} />
                            <MiningPanel 
                                pcs={gameState.pcs}
                                coins={gameState.coins}
                                cash={gameState.cash}
                                sandboxMode={gameState.sandboxMode}
                                buyOrUpgradePc={logic.buyOrUpgradePc}
                                buyGpu={logic.buyGpu}
                                setMiningCoin={logic.setMiningCoin}
                            />
                        </div>

                        <div className="space-y-6">
                           <div className="bg-black/20 p-4 rounded-lg border border-brand-secondary/20 space-y-4">
                             <StatsPanel
                                cash={gameState.cash}
                                holdings={gameState.holdings[gameState.selectedCoinId] || 0}
                                selectedCoin={selectedCoin}
                                netWorth={netWorth}
                                sandboxMode={gameState.sandboxMode}
                             />
                             <div className="h-px bg-brand-secondary/30"></div>
                             <TradePanel
                                coins={gameState.coins}
                                selectedCoinId={gameState.selectedCoinId}
                                handleCoinChange={logic.handleCoinChange}
                                buyCoin={logic.buyCoin}
                                sellCoin={logic.sellCoin}
                                sellAllCoins={logic.sellAllCoins}
                             />
                           </div>
                           <ActionsPanel 
                             handleAction={logic.handleAction}
                             getProAdvice={logic.getProAdvice}
                             isGeneratingAdvice={gameState.isGeneratingAdvice || false}
                             cash={gameState.cash} 
                             sandboxMode={gameState.sandboxMode}
                             gameDate={gameState.gameDate}
                             timeSpeed={gameState.timeSpeed}
                             setTimeSpeed={logic.setTimeSpeed}
                           />
                        </div>
                    </div>
                    
                    {gameState.message && (
                        <div className="mt-6 text-center text-sm p-3 rounded-md bg-brand-primary/20 border border-brand-primary/50 text-brand-primary">
                            {gameState.message}
                        </div>
                    )}
                </main>
            </div>
            
            <button
                onClick={logic.generateNews}
                className="fixed bottom-4 right-4 bg-brand-primary hover:bg-blue-500 text-white font-bold py-3 px-3 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-110 flex items-center gap-2"
                aria-label="Read The News"
            >
                <RefreshCw size={20} />
                <span className="hidden sm:inline">Read The News</span>
            </button>
        </div>
    );
};

const App: React.FC = () => {
    const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
    const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
    const [showSaveSlotsPanel, setShowSaveSlotsPanel] = useState(false);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                setSaveSlots(JSON.parse(savedData));
            } else {
                setSaveSlots(Array(MAX_SAVE_SLOTS).fill({ gameState: null, lastSaved: null }));
            }
        } catch (error) {
            console.error("Error loading save slots:", error);
            setSaveSlots(Array(MAX_SAVE_SLOTS).fill({ gameState: null, lastSaved: null }));
        }
    }, []);

    const updateAndPersistSlots = useCallback((newSlots: SaveSlot[]) => {
        setSaveSlots(newSlots);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSlots));
    }, []);
    
    const handleStateUpdate = useCallback((newState: GameState) => {
        if (activeSlotIndex === null) return;
        // Don't persist on every tick, only on significant changes handled by autosave or manual save.
    }, [activeSlotIndex]);
    
    const initialGameState = useMemo(() => {
        if (activeSlotIndex !== null && saveSlots[activeSlotIndex]?.gameState) {
            return saveSlots[activeSlotIndex].gameState;
        }
        return null;
    }, [activeSlotIndex, saveSlots]);

    const logic = useGameLogic(initialGameState, handleStateUpdate);

    useEffect(() => {
        // Auto-save every 5 minutes
        const autoSaveInterval = setInterval(() => {
            if (activeSlotIndex !== null && logic.state) {
                console.log(`Autosaving game in slot ${activeSlotIndex + 1}...`);
                handleSave(activeSlotIndex);
            }
        }, 300000); // 5 minutes

        return () => clearInterval(autoSaveInterval);
    }, [activeSlotIndex, logic.state, saveSlots]);


    const handleNewGame = (slotIndex: number) => {
        const newSlots = [...saveSlots];
        newSlots[slotIndex] = { gameState: getNewGameState(false), lastSaved: new Date().toISOString() };
        updateAndPersistSlots(newSlots);
        setActiveSlotIndex(slotIndex);
        setShowSaveSlotsPanel(false);
    };

    const handleLoad = (slotIndex: number) => {
        if (saveSlots[slotIndex]?.gameState) {
            setActiveSlotIndex(slotIndex);
            setShowSaveSlotsPanel(false);
        }
    };

    const handleSave = (slotIndex: number) => {
        if (logic.state) {
            const newSlots = [...saveSlots];
            newSlots[slotIndex] = { gameState: logic.state, lastSaved: new Date().toISOString() };
            updateAndPersistSlots(newSlots);
            logic.setMessage(`Game saved to slot ${slotIndex + 1}.`);
        }
    };

    const handleDelete = (slotIndex: number) => {
        if (window.confirm(`Are you sure you want to delete the save in slot ${slotIndex + 1}?`)) {
            const newSlots = [...saveSlots];
            newSlots[slotIndex] = { gameState: null, lastSaved: null };
            updateAndPersistSlots(newSlots);
            if(activeSlotIndex === slotIndex) {
              setActiveSlotIndex(null); // Go back to start menu if active game is deleted
            }
        }
    };
    
    logic.showSaveSlots = () => setShowSaveSlotsPanel(true);
    logic.quitGame = () => setActiveSlotIndex(null);


    if (activeSlotIndex === null) {
        return <StartMenu onNewGame={() => handleNewGame(0)} onLoadGame={() => setShowSaveSlotsPanel(true)} />;
    }

    if (!logic.state) {
         return <div className="bg-brand-bg min-h-screen flex items-center justify-center text-white">Initializing Game...</div>;
    }

    return (
        <>
            <GameView gameState={logic.state} logic={logic} />
            {showSaveSlotsPanel && (
                <SaveSlotsPanel
                    slots={saveSlots}
                    activeSlotIndex={activeSlotIndex}
                    onClose={() => setShowSaveSlotsPanel(false)}
                    onLoad={handleLoad}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onNewGame={handleNewGame}
                />
            )}
        </>
    );
};

export default App;
