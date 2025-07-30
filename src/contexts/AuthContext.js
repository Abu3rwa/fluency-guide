import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import userService from "../services/userService";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  // Handle user authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Create or update user in Firestore with default values
          const userData = await userService.createOrUpdateUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split("@")[0],
            photoURL: user.photoURL || null,
            isAdmin: false,
            isStudent: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setCurrentUser(user);
          setUserData(userData);
        } catch (error) {
          console.error("Error handling auth state change:", error);
          setCurrentUser(null);
          setUserData(null);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

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

      // Create or update user profile with Google data
      const userData = await userService.createOrUpdateUser({
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
        isAdmin: false,
        isStudent: true,
      });

      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // Sign up with email and password
  const signup = async (email, password, name) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create user profile with name
      const userData = await userService.createOrUpdateUser({
        uid: result.user.uid,
        email: result.user.email,
        name: name,
        displayName: name,
        photoURL: result.user.photoURL || "",
        emailVerified: result.user.emailVerified,
        isAdmin: false,
        isStudent: true,
      });

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
      if (!currentUser) throw new Error("No user logged in");
      const updatedUserData = await userService.updateUserProfile(
        currentUser.uid,
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
      if (!currentUser?.userData?.isAdmin) {
        throw new Error("Only admins can update user roles");
      }
      return await userService.updateUserRole(userId, { isAdmin, isStudent });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    updateUserRole,
    loading,
    isAdmin: userData?.isAdmin || false,
    isStudent: userData?.isStudent || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
