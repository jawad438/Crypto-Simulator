
import { GoogleGenAI, Type } from "@google/genai";
import { AiNewsResponse, AiProAdvice } from '../types';

let lastRequestTime = 0;
const COOLDOWN = 5000; // 5-second cooldown

const checkApiKey = () => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return false;
    }
    return true;
}

const checkCooldown = () => {
    const now = Date.now();
    if (now - lastRequestTime < COOLDOWN) {
        console.log("AI request cooldown active.");
        return false;
    }
    lastRequestTime = now;
    return true;
}

export const generateAiNews = async (
    coins: { id: string; name: string; symbol: string }[]
): Promise<AiNewsResponse | null> => {
    if (!checkApiKey() || !checkCooldown()) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const coinList = coins.map(c => `${c.name} (${c.symbol}) - id: ${c.id}`).join(', ');

    const schema = {
        type: Type.OBJECT,
        properties: {
            coinId: {
                type: Type.STRING,
                description: 'The id of the cryptocurrency the news is about.',
                enum: coins.map(c => c.id)
            },
            headline: {
                type: Type.STRING,
                description: 'A creative and engaging news headline. Do not include the coin name in the headline.'
            },
            content: {
                type: Type.STRING,
                description: 'A short news article (2-3 sentences) explaining the event.'
            },
            sentiment: {
                type: Type.STRING,
                description: 'The sentiment of the news.',
                enum: ['POSITIVE', 'NEGATIVE']
            },
            impact: {
                type: Type.INTEGER,
                description: 'The absolute percentage impact on the coin price (an integer between 5 and 25).'
            }
        },
        required: ['coinId', 'headline', 'content', 'sentiment', 'impact']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a financial news AI for a crypto trading simulator game. Your role is to create volatility. Generate a fictional, impactful news event about one of the following cryptocurrencies: ${coinList}. The event can be a technological breakthrough, a major partnership, a security flaw, a celebrity endorsement, or a regulatory challenge. Ensure the impact is an integer between 5 and 25.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 1,
            },
        });

        const jsonText = response.text.trim();
        const parsed: AiNewsResponse = JSON.parse(jsonText);
        
        if (parsed && coins.some(c => c.id === parsed.coinId) && parsed.impact >= 5 && parsed.impact <= 25) {
             return parsed;
        }
        console.error("AI response failed validation:", parsed);
        return null;
    } catch (error) {
        console.error('Error calling Gemini API for news:', error);
        throw error;
    }
};

export const generateProAdvice = async (
    coinHistories: {id: string, name: string, history: {date: string, price: number}[] }[]
): Promise<AiProAdvice> => {
    if (!checkApiKey()) throw new Error("API Key not configured.");
    // No cooldown for this one as it's a paid action

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const schema = {
        type: Type.OBJECT,
        properties: {
            buy: {
                type: Type.OBJECT,
                properties: {
                    coinId: { type: Type.STRING, description: 'The ID of the coin to recommend buying.' },
                    reason: { type: Type.STRING, description: 'A short, plausible reason for buying.' }
                },
                required: ['coinId', 'reason']
            },
            sell: {
                type: Type.OBJECT,
                properties: {
                    coinId: { type: Type.STRING, description: 'The ID of the coin to recommend selling or avoiding.' },
                    reason: { type: Type.STRING, description: 'A short, plausible reason for selling.' }
                },
                required: ['coinId', 'reason']
            }
        },
        required: ['buy', 'sell']
    };

    const prompt = `You are an expert crypto trading analyst for a simulator game. Analyze the recent price history of the following coins. Based ONLY on the provided data, identify one coin that shows strong upward momentum (a "buy" signal) and one coin that shows strong downward momentum or stagnation (a "sell" or "avoid" signal). The "buy" and "sell" coins must be different. Provide a short, plausible reason for each choice.

Available coin data:
${JSON.stringify(coinHistories)}

Respond with your analysis.`;

    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const parsed: AiProAdvice = JSON.parse(jsonText);
        
        if(parsed.buy.coinId === parsed.sell.coinId) {
            throw new Error("AI recommended buying and selling the same coin.");
        }

        return parsed;

    } catch (error) {
        console.error('Error calling Gemini API for pro advice:', error);
        throw error;
    }
};
