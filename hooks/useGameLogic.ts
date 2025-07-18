
import { useState, useEffect, useCallback } from 'react';
import { GameState, Coin, ActionType, PC } from '../types';
import { 
    INITIAL_COINS_DATA, NORMAL_STARTING_CASH, SANDBOX_STARTING_CASH, 
    PC_COSTS, GPU_COST, PC_MAX_LEVEL, GPU_LIMIT_PER_PC 
} from '../constants';
import { generateAiNews, generateProAdvice } from '../services/aiService';

export const getNewGameState = (isSandbox: boolean): GameState => {
    const now = new Date().toISOString();
    const startingCash = isSandbox ? SANDBOX_STARTING_CASH : NORMAL_STARTING_CASH;
    return {
        coins: INITIAL_COINS_DATA.map(c => ({...c, history: [{ date: now, price: c.price }]})),
        selectedCoinId: 'btc',
        cash: startingCash,
        holdings: {},
        message: `Welcome! Choose a coin and start trading.`,
        sandboxMode: isSandbox,
        initialCash: startingCash,
        news: { headline: 'Market is Stable', content: 'No major news affecting the crypto market today.', isAiNews: false },
        timeStep: 1,
        gameDate: now,
        timeSpeed: 1, // Default to 1 day per second
        pcs: Array(6).fill(null).map((_, i) => ({ id: i, level: 0, gpus: 0, miningCoinId: null })),
    };
};

export const useGameLogic = (
    initialState: GameState | null,
    onStateUpdate: (newState: GameState) => void
) => {
    const [state, setState] = useState<GameState | null>(initialState);
    const [isAiNewsGenerating, setIsAiNewsGenerating] = useState(false);

    useEffect(() => {
        setState(initialState);
    }, [initialState]);

    useEffect(() => {
        if (state) {
            onStateUpdate(state);
        }
    }, [state, onStateUpdate]);

    // Game Over Check
    useEffect(() => {
        if (state && state.cash <= 0 && !state.sandboxMode) {
            alert('Game Over! You ran out of cash.');
            if(logic.quitGame) logic.quitGame();
        }
    }, [state?.cash, state?.sandboxMode]);
    
    // Core Game Loop for time, prices, and mining
    useEffect(() => {
        if (!state || state.timeSpeed === 0) return;

        const gameTick = setInterval(() => {
            setState(prevState => {
                if (!prevState) return null;
                // 1. Advance Time
                const newDate = new Date(prevState.gameDate);
                newDate.setDate(newDate.getDate() + prevState.timeSpeed);
                const newDateISO = newDate.toISOString();

                // 2. Simulate price for all coins
                const updatedCoins = prevState.coins.map(coin => {
                    let newPrice = coin.price;
                    const rand = Math.random();

                    if (rand < 0.4) { newPrice *= 1 + (Math.random() - 0.5) * 0.01; } 
                    else if (rand < 0.7) { newPrice *= 1 + (Math.random() - 0.5) * 0.06; } 
                    else if (rand < 0.9) { newPrice *= 1 + (Math.random() - 0.5) * 0.2; } 
                    else if (rand < 0.95) { if (Math.random() > 0.6) newPrice *= 0.5; } 
                    else { if (Math.random() > 0.6) newPrice *= 1.5; }

                    if (newPrice < 0.01 && coin.symbol !== 'USDT') newPrice = 0.01;
                    if (coin.symbol === 'USDT') newPrice = 1 + (Math.random() - 0.5) * 0.005;

                    const newHistory = [...coin.history, { date: newDateISO, price: newPrice }].slice(-100);
                    return { ...coin, price: newPrice, history: newHistory };
                });

                // 3. Calculate mining rewards
                const newHoldings = { ...prevState.holdings };
                prevState.pcs.forEach(pc => {
                    if (pc.level > 0 && pc.gpus > 0 && pc.miningCoinId) {
                        const coin = updatedCoins.find(c => c.id === pc.miningCoinId);
                        if (coin && coin.price > 0) {
                            const hashRate = (pc.level * 5) + (pc.gpus * 10);
                            const dollarsMined = hashRate * 0.5 * prevState.timeSpeed;
                            const coinsMined = dollarsMined / coin.price;
                            
                            newHoldings[pc.miningCoinId] = (newHoldings[pc.miningCoinId] || 0) + coinsMined;
                        }
                    }
                });

                return {
                    ...prevState,
                    coins: updatedCoins,
                    holdings: newHoldings,
                    gameDate: newDateISO,
                    timeStep: prevState.timeStep + 1,
                };
            });
        }, 1000);

        return () => clearInterval(gameTick);
    }, [state?.timeSpeed]);

    // AI News Generation Loop
    useEffect(() => {
        if (!state) return;
        const aiNewsInterval = setInterval(async () => {
            if (isAiNewsGenerating || state.timeSpeed === 0 || !process.env.API_KEY) return;

            setIsAiNewsGenerating(true);
            try {
                const coinInfo = state.coins.map(c => ({ id: c.id, name: c.name, symbol: c.symbol }));
                const aiNews = await generateAiNews(coinInfo);

                if (aiNews && state.coins.find(c => c.id === aiNews.coinId)) {
                    setState(prevState => {
                        if (!prevState) return null;
                        const targetCoin = prevState.coins.find(c => c.id === aiNews.coinId);
                        if (!targetCoin) return prevState;

                        const impactPercent = aiNews.impact / 100;
                        const changeMultiplier = aiNews.sentiment === 'POSITIVE' ? (1 + impactPercent) : (1 - impactPercent);
                        
                        let newPrice = targetCoin.price * changeMultiplier;
                        if(newPrice < 0.01 && targetCoin.symbol !== 'USDT') newPrice = 0.01;

                        const updatedCoins = prevState.coins.map(coin => {
                            if (coin.id === aiNews.coinId) {
                                const newHistory = [...coin.history, { date: prevState.gameDate, price: newPrice }].slice(-100);
                                return { ...coin, price: newPrice, history: newHistory };
                            }
                            return coin;
                        });
                        
                        return {
                            ...prevState,
                            coins: updatedCoins,
                            news: { headline: aiNews.headline, content: aiNews.content, isAiNews: true },
                            message: `AI News Alert! Market reacts to news about ${targetCoin.name}.`
                        };
                    });
                }
            } catch (error) {
                console.error("Failed to generate AI news:", error);
                setState(prevState => prevState ? {...prevState, message: "AI news service is currently unavailable."} : null);
            } finally {
                setIsAiNewsGenerating(false);
            }
        }, 20000);

        return () => clearInterval(aiNewsInterval);
    }, [isAiNewsGenerating, state?.coins, state?.gameDate, state?.timeSpeed]);
    
    const updateState = (updater: (prevState: GameState) => GameState) => {
        setState(prev => prev ? updater(prev) : null);
    };
    
    const setMessage = useCallback((message: string) => {
       updateState(prev => ({...prev, message }));
    }, []);

    const updateCoinPrice = useCallback((coinId: string, newPrice: number) => {
        updateState(prevState => {
            const updatedCoins = prevState.coins.map(coin => {
                if (coin.id === coinId) {
                    const newHistory = [...coin.history, { date: prevState.gameDate, price: newPrice }].slice(-100);
                    return { ...coin, price: newPrice, history: newHistory };
                }
                return coin;
            });
            return { ...prevState, coins: updatedCoins };
        });
    }, []);

    const handleCoinChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        if (!state) return;
        updateState(prevState => ({ ...prevState, selectedCoinId: event.target.value, message: `Selected ${state.coins.find(c=>c.id === event.target.value)?.name}` }));
    }, [state?.coins]);

    const buyCoin = useCallback((amount: number) => {
        updateState(prevState => {
            if (amount <= 0) return { ...prevState, message: 'Please enter a positive amount to buy.' };

            const coin = prevState.coins.find(c => c.id === prevState.selectedCoinId);
            if (!coin) return prevState;

            let effectivePrice = coin.price;
            let mistake = false;
            if (Math.random() < 0.1) {
                effectivePrice *= 1.10;
                mistake = true;
            }
            
            const cost = amount * effectivePrice;
            if (!prevState.sandboxMode && prevState.cash < cost) {
                return { ...prevState, message: 'Not enough cash to make this purchase.' };
            }

            return {
                ...prevState,
                cash: prevState.sandboxMode ? prevState.cash : prevState.cash - cost,
                holdings: {
                    ...prevState.holdings,
                    [coin.id]: (prevState.holdings[coin.id] || 0) + amount,
                },
                message: `Successfully bought ${amount.toFixed(4)} ${coin.symbol}. ${mistake ? 'A costly mistake increased the price!' : ''}`
            };
        });
    }, []);

    const sellCoin = useCallback((amount: number) => {
        updateState(prevState => {
            if (amount <= 0) return { ...prevState, message: 'Please enter a positive amount to sell.' };
            
            const coin = prevState.coins.find(c => c.id === prevState.selectedCoinId);
            if (!coin) return prevState;

            const currentHolding = prevState.holdings[coin.id] || 0;
            if (currentHolding < amount) {
                return { ...prevState, message: `You only have ${currentHolding.toFixed(4)} ${coin.symbol} to sell.` };
            }

            let effectivePrice = coin.price;
            let mistake = false;
            if (Math.random() < 0.1) {
                effectivePrice *= 0.90;
                mistake = true;
            }
            const proceeds = amount * effectivePrice;

            return {
                ...prevState,
                cash: prevState.cash + proceeds,
                holdings: {
                    ...prevState.holdings,
                    [coin.id]: currentHolding - amount,
                },
                message: `Successfully sold ${amount.toFixed(4)} ${coin.symbol}. ${mistake ? 'A costly mistake decreased the price!' : ''}`
            };
        });
    }, []);
    
    const sellAllCoins = useCallback(() => {
        if (!state) return;
        const holdingAmount = state.holdings[state.selectedCoinId] || 0;
        if (holdingAmount > 0) {
            sellCoin(holdingAmount);
        } else {
            updateState(prevState => ({ ...prevState, message: 'You have no coins to sell.' }));
        }
    }, [state?.holdings, state?.selectedCoinId, sellCoin]);

    const getProAdvice = useCallback(async () => {
       if (!state || !process.env.API_KEY) return;

        const cost = 150;
        if (!state.sandboxMode && state.cash < cost) {
            setMessage("Not enough cash to buy Pro Advice.");
            return;
        }

        updateState(prev => ({...prev, isGeneratingAdvice: true, message: "AI analyst is thinking..."}));
        
        try {
            const coinHistories = state.coins.map(c => ({
                id: c.id,
                name: c.name,
                history: c.history.slice(-20) // send last 20 data points
            }));

            let advice = await generateProAdvice(coinHistories);

            // Simulate 80% accuracy
            if (Math.random() > 0.8) {
                // inaccurate advice
                [advice.buy, advice.sell] = [advice.sell, advice.buy];
                setMessage("AI Advice (Inaccurate): The AI seems confused today...");
            }

            const buyCoin = state.coins.find(c => c.id === advice.buy.coinId);
            const sellCoin = state.coins.find(c => c.id === advice.sell.coinId);

            const adviceMessage = `AI says: "Consider buying ${buyCoin?.name} because ${advice.buy.reason}. It might be wise to avoid ${sellCoin?.name} because ${advice.sell.reason}."`;
            
            updateState(prev => ({
                ...prev,
                cash: prev.sandboxMode ? prev.cash : prev.cash - cost,
                message: adviceMessage,
                isGeneratingAdvice: false,
            }));

        } catch (error) {
             console.error("Failed to generate AI pro advice:", error);
             updateState(prev => ({
                 ...prev, 
                 message: "The AI analyst is unavailable right now. Try again later.",
                 isGeneratingAdvice: false,
             }));
        }
    }, [state]);

    const handleAction = useCallback((action: ActionType) => {
        updateState(prevState => {
            const coin = prevState.coins.find(c => c.id === prevState.selectedCoinId);
            if (!coin) return prevState;

            let cost = 0;
            let message = '';
            let priceMultiplier = 1;

            switch (action) {
                case 'promote':
                    cost = 400;
                    message = `You paid $400 to promote ${coin.name}! Price increased.`;
                    priceMultiplier = 1.05;
                    break;
                case 'bribe':
                    cost = 100000;
                    message = `You paid $100,000 to bribe the owners of ${coin.name}! Price doubled!`;
                    priceMultiplier = 2;
                    break;
                case 'advice': // This case is now handled by getProAdvice
                    return prevState;
            }

            if (!prevState.sandboxMode && prevState.cash < cost) {
                return { ...prevState, message: `Not enough cash for this action (Cost: $${cost}).` };
            }

            if (priceMultiplier !== 1) {
                const newPrice = coin.price * priceMultiplier;
                const newHistory = [...coin.history, { date: prevState.gameDate, price: newPrice }].slice(-100);
                const updatedCoins = prevState.coins.map(c => c.id === coin.id ? { ...c, price: newPrice, history: newHistory } : c);
                return {
                    ...prevState,
                    coins: updatedCoins,
                    cash: prevState.sandboxMode ? prevState.cash : prevState.cash - cost,
                    message: message,
                };
            }
            return {
                ...prevState,
                cash: prevState.sandboxMode ? prevState.cash : prevState.cash - cost,
                message: message,
            };
        });
    }, []);

    const generateNews = useCallback(() => {
        updateState(prevState => {
            const isTargeted = Math.random() > 0.3;
            let headline = 'Generic Market News';
            let content = 'Analysts report a day of calm, with no significant events driving market behavior.';
            let updatedCoins = [...prevState.coins];
            
            if (isTargeted) {
                const targetCoinIndex = Math.floor(Math.random() * prevState.coins.length);
                const targetCoin = prevState.coins[targetCoinIndex];
                const isPositive = Math.random() > 0.5;
                const changePercent = (Math.random() * 0.10 + 0.05);
                const changeMultiplier = isPositive ? (1 + changePercent) : (1 - changePercent);
                const newPrice = targetCoin.price * changeMultiplier;

                if (isPositive) {
                    headline = `Positive Outlook for ${targetCoin.name} (${targetCoin.symbol})!`;
                    content = `A recent breakthrough in ${targetCoin.name}'s technology has investors excited, causing a surge in its value.`;
                } else {
                    headline = `Regulatory Concerns for ${targetCoin.name} (${targetCoin.symbol})!`;
                    content = `Negative reports about ${targetCoin.name}'s compliance have surfaced, leading to a significant price drop.`;
                }
                
                const newHistory = [...targetCoin.history, { date: prevState.gameDate, price: newPrice }].slice(-100);
                updatedCoins = prevState.coins.map(c => c.id === targetCoin.id ? { ...c, price: newPrice, history: newHistory } : c);
            } else {
                 headline = `Market Sentiments are Mixed`;
                 content = `While some tokens see minor gains, others face slight downturns. Overall market remains unpredictable.`;
            }

            return { ...prevState, coins: updatedCoins, news: { headline, content, isAiNews: false }, message: "News updated! Check the headlines." };
        });
    }, []);

    const toggleSandboxMode = useCallback(() => {
        if (!state) return;
        const newSandboxMode = !state.sandboxMode;

        if (newSandboxMode) { // Turning Sandbox ON
            if (window.confirm('Enable Sandbox Mode for this game? All purchases will become free. This will not reset your progress.')) {
                updateState(prevState => ({
                    ...prevState,
                    sandboxMode: true,
                    cash: SANDBOX_STARTING_CASH,
                    message: 'Sandbox Mode enabled. Enjoy unlimited funds!'
                }));
            }
        } else { // Turning Sandbox OFF
            if (window.confirm('This will start a new NORMAL game in the current slot. Your sandbox progress will be lost. Are you sure?')) {
                setState(getNewGameState(false));
            }
        }
    }, [state]);

    const fullReset = useCallback(() => {
        if (window.confirm('This will start a new game in the current slot. Are you sure?')) {
            setState(getNewGameState(false));
        }
    }, []);

    const setTimeSpeed = useCallback((speed: number) => {
        updateState(prevState => ({ ...prevState, timeSpeed: speed }));
    }, []);
    
    const buyOrUpgradePc = useCallback((pcId: number) => {
        updateState(prevState => {
            const pc = prevState.pcs.find(p => p.id === pcId);
            if (!pc || pc.level >= PC_MAX_LEVEL) return prevState;

            const cost = PC_COSTS[pc.level];
            if (!prevState.sandboxMode && prevState.cash < cost) {
                return { ...prevState, message: `Not enough cash to ${pc.level === 0 ? 'buy' : 'upgrade'} PC. Cost: $${cost.toLocaleString()}`};
            }

            const updatedPcs = prevState.pcs.map(p => 
                p.id === pcId ? { ...p, level: p.level + 1 } : p
            );
            
            return {
                ...prevState,
                pcs: updatedPcs,
                cash: prevState.sandboxMode ? prevState.cash : prevState.cash - cost,
                message: `Successfully ${pc.level === 0 ? 'bought' : 'upgraded'} PC ${pcId + 1} to Level ${pc.level + 1}!`
            };
        });
    }, []);

    const buyGpu = useCallback((pcId: number) => {
        updateState(prevState => {
            const pc = prevState.pcs.find(p => p.id === pcId);
            if (!pc || pc.level === 0 || pc.gpus >= GPU_LIMIT_PER_PC) return prevState;

            if (!prevState.sandboxMode && prevState.cash < GPU_COST) {
                return { ...prevState, message: `Not enough cash to buy GPU. Cost: $${GPU_COST.toLocaleString()}`};
            }

            const updatedPcs = prevState.pcs.map(p => 
                p.id === pcId ? { ...p, gpus: p.gpus + 1 } : p
            );
            
            return {
                ...prevState,
                pcs: updatedPcs,
                cash: prevState.sandboxMode ? prevState.cash : prevState.cash - GPU_COST,
                message: `Successfully added a GPU to PC ${pcId + 1}!`
            };
        });
    }, []);

    const setMiningCoin = useCallback((pcId: number, coinId: string | null) => {
        updateState(prevState => {
            const updatedPcs = prevState.pcs.map(p => 
                p.id === pcId ? { ...p, miningCoinId: coinId } : p
            );
            const coinName = prevState.coins.find(c => c.id === coinId)?.name;
            return {
                ...prevState,
                pcs: updatedPcs,
                message: coinId ? `PC ${pcId + 1} is now mining ${coinName}.` : `PC ${pcId + 1} has stopped mining.`
            };
        });
    }, []);

    const logic = {
        state,
        setMessage,
        handleCoinChange,
        buyCoin,
        sellCoin,
        sellAllCoins,
        handleAction,
        getProAdvice,
        generateNews,
        toggleSandboxMode,
        fullReset,
        setTimeSpeed,
        buyOrUpgradePc,
        buyGpu,
        setMiningCoin,
        showSaveSlots: () => {},
        quitGame: () => {},
    };

    return logic;
};
