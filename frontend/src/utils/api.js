const BASE_URL = '${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'API Request Failed');
  }

  return response.json();
};