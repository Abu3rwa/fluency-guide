import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        
        if (currentUser) {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserProfile({ uid: currentUser.uid, ...userDocSnap.data() });
          } else {
            // Create default profile if doesn't exist
            const defaultProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || '',
              role: 'student',
              isAdmin: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await setDoc(userDocRef, defaultProfile);
            setUserProfile(defaultProfile);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const register = useCallback(async (email, password, displayName, role = 'student') => {
    setLoading(true);
    setError(null);
    try {
      // Create auth user
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const authUser = result.user;

      // Update display name
      await updateProfile(authUser, { displayName });

      // Create user profile in Firestore
      const userProfile = {
        uid: authUser.uid,
        email: authUser.email,
        name: displayName,
        role: role,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', authUser.uid), userProfile);
      setUserProfile(userProfile);
      
      return { user: authUser, profile: userProfile };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const authUser = result.user;

      // Fetch user profile
      const userDocRef = doc(db, 'users', authUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        setUserProfile({ uid: authUser.uid, ...userDocSnap.data() });
      }
      
      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { ...updates, updatedAt: new Date() }, { merge: true });
      
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);
      
      return updatedProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  const value = {
    user,
    userProfile,
    loading,
    error,
    register,
    login,
    logout,
    updateUserProfile,
    isAuthenticated: !!user,
    isInstructor: userProfile?.role === 'instructor',
    isStudent: userProfile?.role === 'student',
    isAdmin: userProfile?.isAdmin ===true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      userProfile: null,
      loading: false,
      error: null,
      register: async () => {},
      login: async () => {},
      logout: async () => {},
      updateUserProfile: async () => {},
      isAuthenticated: false,
      isInstructor: false,
      isStudent: false,
      isAdmin: false,
    };
  }
  return context;
}
