import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, clearAccessToken } from '../services/apiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const initAuth = useCallback(async () => {
        try {
            const data = await api.auth.refresh();
            setAccessToken(data.accessToken);
            setUser(data.user);
            setIsAuthenticated(true);
        } catch (error) {
            clearAccessToken();
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setIsAuthenticated(false);
            clearAccessToken();
        };

        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    const login = async (email, password) => {
        const data = await api.auth.login({ email, password });
        setAccessToken(data.accessToken);
        setUser(data.user);
        setIsAuthenticated(true);
        return data;
    };

    const register = async (name, email, password) => {
        const data = await api.auth.register({ name, email, password });
        return data;
    };

    const logout = async () => {
        try {
            await api.auth.logout();
        } catch (error) {
            // Ignore logout errors
        } finally {
            clearAccessToken();
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
