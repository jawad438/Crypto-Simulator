
import React from 'react';
import { Newspaper, Bot } from 'lucide-react';

interface NewsPanelProps {
    news: {
        headline: string;
        content: string;
        isAiNews: boolean;
    };
}

const NewsPanel: React.FC<NewsPanelProps> = ({ news }) => {
    const isAi = news.isAiNews;

    return (
        <div className={`bg-black/20 p-4 rounded-lg border ${isAi ? 'border-purple-500/50' : 'border-brand-secondary/20'}`}>
            <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                {isAi ? (
                    <Bot size={22} className="text-purple-400" />
                ) : (
                    <Newspaper size={22} className="text-brand-primary" />
                )}
                Today's Headlines
            </h2>
            <div className="space-y-2">
                <h3 className={`font-semibold ${isAi ? 'text-purple-400' : 'text-brand-primary'}`}>{news.headline}</h3>
                <p className="text-sm text-gray-300">{news.content}</p>
            </div>
        </div>
    );
};

export default NewsPanel;
