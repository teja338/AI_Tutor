import React, { createContext, useState, useEffect } from "react";
import { saveToken, getToken, removeToken } from "../utils/authStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreToken = async () => {
      const storedToken = await getToken();
      if (storedToken) {
        setToken(storedToken);
      }
      setLoading(false);
    };

    restoreToken();
  }, []);

  const login = async (newToken) => {
    await saveToken(newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await removeToken();
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
