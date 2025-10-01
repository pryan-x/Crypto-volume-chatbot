'use client';

import { useState, useEffect, useRef } from 'react';
import { ClientMessage } from './actions';
import { useActions, useUIState } from '@ai-sdk/rsc';
import { generateId } from 'ai';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = input;
    setInput('');

    // Add user message to conversation
    setConversation((currentConversation: ClientMessage[]) => [
      ...currentConversation,
      {
        id: generateId(),
        role: 'user',
        display: <p>{userMessage}</p>,
      },
    ]);

    // Get AI response
    try {
      const message = await continueConversation(userMessage);
      setConversation((currentConversation: ClientMessage[]) => [
        ...currentConversation,
        message,
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Chat with me or ask about the volume of common crypto currency
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Try: &quot;What&apos;s the volume of Bitcoin?&quot;
        </p>
      </header>

      <main ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* user and chatbot message interaction */}
        {conversation.map((message: ClientMessage) => (
          <article
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <section
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-black'
              }`}
            >
              <header className="text-xs font-semibold mb-1 uppercase opacity-70">
                {message.role}
              </header>
              <div>{message.display}</div>
            </section>
          </article>
        ))}
        
        {/* loading waiting for response indicator */}
        {isLoading && (
          <aside className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" role="status" aria-label="Loading"></div>
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          </aside>
        )}

        {/* Invisible div at the bottom for auto-scroll */}
        <div ref={messagesEndRef} />
      </main>

      {/* input send */}
      <footer className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <label htmlFor="message-input" className="sr-only">Type your message</label>
            <input
              id="message-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}