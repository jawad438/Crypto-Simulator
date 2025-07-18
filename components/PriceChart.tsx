
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
    data: { date: string; price: number }[];
    coinSymbol: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, coinSymbol }) => {
    const formatYAxis = (tick: number) => {
        if (tick >= 1e6) return `${(tick / 1e6).toFixed(1)}M`;
        if (tick >= 1e3) return `${(tick / 1e3).toFixed(1)}K`;
        if (tick < 1 && tick > 0) return tick.toFixed(3);
        return tick.toFixed(0);
    };

    const formatXAxis = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTooltipLabel = (label: string) => {
        const date = new Date(label);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                <XAxis 
                    dataKey="date" 
                    stroke="#A0AEC0" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatXAxis}
                />
                <YAxis 
                    stroke="#A0AEC0" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={formatYAxis}
                    domain={['dataMin', 'dataMax']}
                    allowDataOverflow={true}
                    scale="log"
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#2D3748',
                        border: '1px solid #4A5568',
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                    formatter={(value: number) => [`$${value.toFixed(4)}`, 'Price']}
                    labelFormatter={formatTooltipLabel}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line 
                    type="linear" 
                    dataKey="price" 
                    name={`${coinSymbol} Price`}
                    stroke="#4299E1" 
                    strokeWidth={2} 
                    dot={false} 
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PriceChart;
