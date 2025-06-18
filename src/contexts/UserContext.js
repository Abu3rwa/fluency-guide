import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import userService from "../services/userService";
import { doc, getDoc } from "firebase/firestore";

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
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", authUser.uid));
          if (userDoc.exists()) {
            setUser({
              ...authUser,
              ...userDoc.data(),
            });
          } else {
            setUser(authUser);
          }
        } else {
          setUser(null);
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

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // Sign up with email and password
  const signup = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return result.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
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
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData({ id: userDoc.id, ...userDoc.data() });
      }
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
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    updateUserRole,
    setUser,
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserContext;
