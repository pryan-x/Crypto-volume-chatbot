# Crypto Volume Chatbot

AI-powered chatbot that streams real-time cryptocurrency trading volume data from Binance using Next.js 15, React Server Components, and Google Gemini.

## Features

- **Conversational AI**: Chat with Google Gemini AI
- **Real-time Crypto Data**: Fetch live 24h trading volumes from Binance
- **Streaming UI**: Progressive rendering with React Server Components
- **Supported Cryptocurrencies**: Bitcoin, Ethereum, Solana, XRP, Cardano, Dogecoin, and more

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React Server Components (RSC)** - Server-side streaming components
- **Google Gemini AI** - LLM for conversational responses
- **Binance API** - Real-time cryptocurrency data
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Prerequisites

- Node.js 18+ 
- Google Gemini API key (free tier available)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/pryan-x/Crypto-volume-chatbot.git
cd Crypto-volume-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in the root directory:
```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

**Query crypto volumes:**
- "What's the volume of Bitcoin?"
- "Show me Ethereum volume"
- "Get SOL volume"

**General chat:**
- Ask any question and get AI-powered responses

## How It Works

### LLM Integration

The project uses **React Server Components (RSC)** for streaming AI responses:

1. **User Input**: Message sent to server action (`continueConversation`)
2. **Pattern Detection**: Checks for "volume" or "binance" keywords
3. **Route Decision**:
   - **Crypto query** → Calls Binance API, streams custom UI components
   - **General chat** → Streams text from Google Gemini AI

4. **Streaming Response**: Uses `streamText()` from Vercel AI SDK to stream responses token-by-token
5. **Progressive UI**: `createStreamableUI()` updates the interface in real-time as data arrives

```typescript
// Server action that streams responses
const result = streamText({
  model: google('gemini-2.5-flash'),
  messages: [...history.get(), { role: 'user', content: input }],
});

// Stream each token as it arrives
for await (const delta of result.textStream) {
  fullText += delta;
  reply.update(<p>{fullText}</p>);
}
```

### Architecture

- **`src/app/page.tsx`**: Client component for UI and user interaction
- **`src/app/actions.tsx`**: Server actions for AI and API calls
- **`src/app/ai.tsx`**: AI provider configuration with state management
- **`src/app/layout.tsx`**: Root layout with AI context wrapper


## Dependencies

```json
{
  "ai": "^5.0.59",
  "@ai-sdk/google": "^2.0.42",
  "@ai-sdk/rsc": "^1.0.59",
  "next": "15.5.4",
  "react": "19.1.0",
  "zod": "^4.1.11"
}
```

## API Keys

- **Binance API**: Public endpoints, no key required for market data
- **Google Gemini**: Free tier available at [aistudio.google.com](https://aistudio.google.com/)

## License

MIT
