import { useState, useEffect } from 'react';
import config, { apiClient } from '../config/api';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        localStorage.setItem('authToken', token);
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const tokenResponse = await apiClient.get(`${config.API_ENDPOINTS.AUTH.TOKEN}/${storedToken}`);
          if (tokenResponse.data.authenticated) {
            setUser(tokenResponse.data.user);
            setLoading(false);
            return;
          }
        } catch (tokenError) {
          localStorage.removeItem('authToken');
        }
      }

      const authResponse = await apiClient.get(config.API_ENDPOINTS.AUTH.CHECK);
      if (authResponse.data.authenticated) {
        setUser(authResponse.data.user);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return { user, setUser, loading };
};
