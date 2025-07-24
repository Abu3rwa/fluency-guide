import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import userService from "../services/userService";

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser);
          await fetchUserData(authUser.uid);
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sign out
  const logout = async () => {
    try {
      await userService.signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      if (!user) throw new Error("No user logged in");
      const updatedUserData = await userService.updateUserProfile(
        user.uid,
        profileData
      );
      setUserData(updatedUserData);
      return updatedUserData;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Update user role
  const updateUserRole = async (userId, { isAdmin, isStudent }) => {
    try {
      if (!userData?.isAdmin) {
        throw new Error("Only admins can update user roles");
      }
      return await userService.updateUserRole(userId, { isAdmin, isStudent });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  const fetchUserData = async (uid) => {
    try {
      const user = await userService.getUserById(uid);
      setUserData(user);
      return user;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const value = {
    user,
    userData,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: userData?.isAdmin || false,
    isStudent: userData?.isStudent || false,
    logout,
    updateProfile,
    updateUserRole,
    setUser,
    fetchUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserContext;
