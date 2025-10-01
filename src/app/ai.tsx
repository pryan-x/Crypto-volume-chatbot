import { createAI } from '@ai-sdk/rsc';
import { ServerMessage, ClientMessage, continueConversation } from './actions';

export type AIState = ServerMessage[];
export type UIState = ClientMessage[];

export const AI = createAI<AIState, UIState>({
  actions: {
    continueConversation: continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});