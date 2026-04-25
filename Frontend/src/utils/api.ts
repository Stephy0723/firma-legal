/**
 * API Configuration
 * Centralizes the API base URL from environment variables
 * 
 * VITE_API_URL debe incluir el path completo del API:
 * - Development: http://localhost:3001/api
 * - Production: https://test.inversionesjrl.com/api
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const createApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
};
