import React, { createContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile as updateUserProfileThunk,
  setUser,
  setUserProfile,
  setLoading,
  selectUser,
  selectUserProfile,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsInstructor,
  selectIsStudent
} from '../store/slices/authSlice';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Start initial loading
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Update Redux state with basic user info
          dispatch(setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          }));

          // Fetch user profile from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            dispatch(setUserProfile({ uid: currentUser.uid, ...userDocSnap.data() }));
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
            dispatch(setUserProfile(defaultProfile));
          }
        } else {
          // No user logged in
          dispatch(setUser(null));
          dispatch(setUserProfile(null));
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        // We could dispatch an error here if needed
      } finally {
        dispatch(setLoading(false));
      }
    });

    return unsubscribe;
  }, [dispatch]);

  // We don't need to provide a value context anymore since useAuth uses Redux
  // But we keep the Provider to not break app structure where it expects <AuthProvider>
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const dispatch = useDispatch();

  // Read from Redux Store
  const user = useSelector(selectUser);
  const userProfile = useSelector(selectUserProfile);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const isInstructor = useSelector(selectIsInstructor);
  // We need to add selectIsStudent if it exists or derive it
  const isStudent = userProfile?.role === 'student';

  // Wrap Thunks to match original API (return Promise)
  const register = useCallback(async (email, password, displayName, role = 'student', phoneNumber = '') => {
    const resultAction = await dispatch(registerUser({ email, password, displayName, role, phoneNumber }));
    if (registerUser.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      throw new Error(resultAction.payload || 'Registration failed');
    }
  }, [dispatch]);

  const login = useCallback(async (email, password) => {
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      return resultAction.payload.user;
    } else {
      throw new Error(resultAction.payload || 'Login failed');
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    const resultAction = await dispatch(logoutUser());
    if (logoutUser.rejected.match(resultAction)) {
      console.error("Logout error", resultAction.payload);
    }
  }, [dispatch]);

  const updateUserProfile = useCallback(async (updates) => {
    const resultAction = await dispatch(updateUserProfileThunk(updates));
    if (updateUserProfileThunk.fulfilled.match(resultAction)) {
      return resultAction.payload;
    } else {
      throw new Error(resultAction.payload || 'Update profile failed');
    }
  }, [dispatch]);

  return {
    user,
    userProfile,
    loading,
    error,
    register,
    login,
    logout,
    updateUserProfile,
    isAuthenticated,
    isInstructor,
    isStudent,
    isAdmin,
  };
}
