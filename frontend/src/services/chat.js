import { apiRequest } from "../utils/api";

export const chatService = {
  async ask(payload) {
    return await apiRequest('/chat/ask', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};