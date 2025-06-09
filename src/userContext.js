import React, { useState, useEffect, createContext } from "react";
import { auth } from "./frebase";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  }, [user]);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
