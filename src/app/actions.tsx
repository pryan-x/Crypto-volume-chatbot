'use server';

import { createStreamableUI, getMutableAIState } from '@ai-sdk/rsc';
import { google } from '@ai-sdk/google';
import { ReactNode } from 'react';
import { generateId, streamText } from 'ai';

export interface ServerMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClientMessage {
  id: string;
  role: 'user' | 'assistant';
  display: ReactNode;
}

// Includes check for binance volume
export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  'use server';

  const history = getMutableAIState();

  const reply = createStreamableUI(
    <section className="flex items-center gap-2">
      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" role="status" aria-label="Loading"></div>
      <span>Thinking...</span>
    </section>
  );

  (async () => {
    try {
      // Check if user is asking about Binance volume
      if (input.toLowerCase().includes('volume') || input.toLowerCase().includes('binance')) {
        const symbol = extractSymbol(input);
        if (symbol) {
          await fetchBinanceVolume(symbol, reply, history, input);
          reply.done();
          return;
        }
      }

      // Default: stream text response
      const result = streamText({
        model: google('gemini-2.5-flash'),
        messages: [...history.get(), { role: 'user', content: input }],
        temperature: 0.7,
      });

      let fullText = '';

      for await (const delta of result.textStream) {
        fullText += delta;
        reply.update(<p className="text-gray-800">{fullText}</p>);
      }

      const finalText = await result.text;
      
      history.done([
        ...history.get(),
        { role: 'user', content: input },
        { role: 'assistant', content: finalText },
      ]);

      reply.done();
    } catch (error) {
      console.error('Error in continueConversation:', error);
      reply.done(<p className="text-red-600">Error occurred</p>);
    }
  })();

  return {
    id: generateId(),
    role: 'assistant',
    display: reply.value,
  };
}

// Helper function to extract crypto symbol from user input
function extractSymbol(input: string): string | null {
  const lowerInput = input.toLowerCase();
  
  // Common crypto mappings
  const cryptoMap: { [key: string]: string } = {
    'bitcoin': 'BTCUSDT',
    'btc': 'BTCUSDT',
    'ethereum': 'ETHUSDT',
    'eth': 'ETHUSDT',
    'bnb': 'BNBUSDT',
    'binance coin': 'BNBUSDT',
    'cardano': 'ADAUSDT',
    'ada': 'ADAUSDT',
    'solana': 'SOLUSDT',
    'sol': 'SOLUSDT',
    'xrp': 'XRPUSDT',
    'ripple': 'XRPUSDT',
    'dogecoin': 'DOGEUSDT',
    'doge': 'DOGEUSDT',
  };
  
  // Check for common names
  for (const [key, symbol] of Object.entries(cryptoMap)) {
    if (lowerInput.includes(key)) {
      return symbol;
    }
  }
  
  // Check for direct symbol format (e.g., BTCUSDT)
  const symbolMatch = input.match(/([A-Z]{3,10}USDT)/i);
  if (symbolMatch) {
    return symbolMatch[1].toUpperCase();
  }
  
  return null;
}

// Function to fetch Binance volume with streaming UI
async function fetchBinanceVolume(symbol: string, reply: any, history: any, input: string) {
  // Show loading spinner
  reply.update(
    <article className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" role="status" aria-label="Fetching data"></div>
        <span>Fetching {symbol} data from Binance...</span>
      </div>
    </article>
  );
  
  try {
    // Fetch data from Binance API
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/tradingDay?symbol=${symbol}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Display the volume result
    const volume = parseFloat(data.volume);
    const quoteVolume = parseFloat(data.quoteVolume);
    const priceChange = parseFloat(data.priceChange);
    const priceChangePercent = parseFloat(data.priceChangePercent);
    const lastPrice = parseFloat(data.lastPrice);
    
    reply.update(
      <article className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">{symbol}</h3>
          <p className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {priceChange >= 0 ? '↑' : '↓'} {priceChangePercent.toFixed(2)}%
          </p>
        </header>
        
        <section className="space-y-3">
          <div>
            <p className="text-sm opacity-80">Current Price</p>
            <p className="text-3xl font-bold">${lastPrice.toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white bg-opacity-20 p-3 rounded">
              <p className="text-xs text-black opacity-80">24h Volume</p>
              <p className="text-lg text-black font-bold">{volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-black opacity-80">{symbol.replace('USDT', '')}</p>
            </div>
            
            <div className="bg-white bg-opacity-20 p-3 rounded">
              <p className="text-xs text-black opacity-80">24h Volume (USDT)</p>
              <p className="text-lg text-black font-bold">${quoteVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </section>
        
        <footer className="text-xs opacity-70 mt-4">
          Data from Binance • Last updated: {new Date().toLocaleTimeString()}
        </footer>
      </article>
    );
    
    history.done([
      ...history.get(),
      { role: 'user', content: input },
      { role: 'assistant', content: `Fetched volume for ${symbol}` },
    ]);
    
  } catch (error) {
    console.error('Error fetching Binance data:', error);
    reply.update(
      <article className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-800">
          <strong>Error:</strong> Failed to fetch data for {symbol}. 
          Make sure the symbol is valid (e.g., BTCUSDT, ETHUSDT).
        </p>
      </article>
    );
    
    history.done([
      ...history.get(),
      { role: 'user', content: input },
      { role: 'assistant', content: `Failed to fetch volume for ${symbol}` },
    ]);
  }
}