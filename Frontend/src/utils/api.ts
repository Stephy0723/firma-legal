/**
 * API Configuration
 * Centralizes the API base URL from environment variables
 * 
 * VITE_API_URL puede ser:
 * - Con /api: http://localhost:3001/api
 * - Sin /api: https://api.inversionesjrl.com
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const createApiUrl = (endpoint: string): string => {
  const trimmedBaseUrl = API_URL.replace(/\/+$/, '');
  const baseUrl = trimmedBaseUrl.endsWith('/api') ? trimmedBaseUrl : `${trimmedBaseUrl}/api`;
  const normalizedEndpoint = `/${endpoint}`
    .replace(/^\/+/, '/')
    .replace(/^\/api(?=\/|$)/, '');

  return normalizedEndpoint === '' ? baseUrl : `${baseUrl}${normalizedEndpoint}`;
};
