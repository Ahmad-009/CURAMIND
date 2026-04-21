import { apiRequest } from "../utils/api";

export const sessionService = {
  async getAllSessions() {
    return await apiRequest('/sessions/all');
  },

  async getSessionDetail(sessionId) {
    return await apiRequest(`/sessions/${sessionId}`);
  }
};