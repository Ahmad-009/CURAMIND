const API_BASE_URL = 'http://localhost:8000'; 

export const authService = {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Authentication failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Service Layer Error [login]:', error);
      throw error; 
    }
  },

  async signup(name, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          username: name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''), 
          email, 
          password,
          role: "doctor" 
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Service Layer Error [signup]:', error);
      throw error; 
    }
  },

  async forgotPassword(email, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, new_password: newPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Reset failed');
      }
      return await response.json();
    } catch (error) {
      console.error('Service Layer Error [reset]:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
  }
};