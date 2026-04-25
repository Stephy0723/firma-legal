/**
 * API Configuration
 * Centralizes the API base URL from environment variables
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const createApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};
