import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
          // Create or update user in Firestore (only set defaults for new users)
          const userData = await userService.createOrUpdateUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split("@")[0],
            photoURL: user.photoURL || null,
            // Don't override existing admin/student flags for existing users
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

    // Handle redirect result for Google sign-in
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log("Google sign-in redirect successful:", result.user.email);
          // User data will be handled by onAuthStateChanged above
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      }
    };

    handleRedirectResult();
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
      console.log("Starting Google sign-in process...");
      console.log("Current domain:", window.location.hostname);
      console.log("Current origin:", window.location.origin);
      console.log("Auth domain:", auth.app.options.authDomain);
      console.log("Environment auth domain:", process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
      
      // Check domain configuration
      const currentDomain = window.location.hostname;
      const configuredAuthDomain = auth.app.options.authDomain;
      
      if (currentDomain !== 'localhost' && currentDomain !== '127.0.0.1' && 
          !configuredAuthDomain.includes(currentDomain) && 
          configuredAuthDomain !== 'mr-abdulhafeez.firebaseapp.com') {
        console.warn(
          `Domain mismatch detected: Current domain (${currentDomain}) differs from configured auth domain (${configuredAuthDomain}). ` +
          'This may cause authentication issues if the domain is not authorized in Firebase.'
        );
      }
      
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configure provider settings
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Determine authentication method based on domain
      const isCustomDomain = window.location.hostname === 'sudanglish.com' || window.location.hostname === 'www.sudanglish.com';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isCustomDomain) {
        console.log("Attempting authentication for custom domain...");
        console.log("If authentication fails, the domain may not be authorized yet");
        
        try {
          // Try popup first as it's more reliable for custom domains
          console.log("Trying popup authentication for custom domain...");
          const result = await signInWithPopup(auth, provider);
          console.log("Google sign-in successful via popup:", result.user.email);
          
          // Create or update user profile with Google data
          const userData = await userService.createOrUpdateUser({
            uid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            emailVerified: result.user.emailVerified,
          });
          
          console.log("User data created/updated successfully");
          return result.user;
        } catch (popupError) {
          console.log("Popup failed, trying redirect method...", popupError.code);
          
          // If popup fails due to domain issues, try redirect as fallback
          if (popupError.code === 'auth/unauthorized-domain' || 
              popupError.code === 'auth/popup-blocked') {
            console.log("Using redirect authentication as fallback...");
            await signInWithRedirect(auth, provider);
            return; // Redirect will reload the page
          }
          
          // Re-throw other popup errors
          throw popupError;
        }
      } else {
        console.log("Provider configured, attempting popup authentication...");
        const result = await signInWithPopup(auth, provider);
        console.log("Google sign-in successful:", result.user.email);

        // Create or update user profile with Google data (only set defaults for new users)
        const userData = await userService.createOrUpdateUser({
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          emailVerified: result.user.emailVerified,
          // Don't override existing admin/student flags for existing users
        });
        
        console.log("User data created/updated successfully");
        return result.user;
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Another sign-in popup is already open.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else if (error.code === 'auth/internal-error') {
        throw new Error('Internal authentication error. Please try again later.');
      } else if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        const isCustomDomain = currentDomain === 'sudanglish.com' || currentDomain === 'www.sudanglish.com';
        
        if (isCustomDomain) {
          throw new Error(
            'Authentication is being set up for sudanglish.com. Please try again in a few minutes, or contact support if the issue persists.'
          );
        } else {
          throw new Error(
            `Domain ${currentDomain} is not authorized for authentication. Please contact support.`
          );
        }
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in is disabled. Please contact support.');
      } else if (error.code === 'auth/invalid-api-key') {
        throw new Error('Invalid Firebase configuration. Please contact support.');
      }
      
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

      // Create user profile with name (new users get default roles)
      const userData = await userService.createOrUpdateUser({
        uid: result.user.uid,
        email: result.user.email,
        name: name,
        displayName: name,
        photoURL: result.user.photoURL || "",
        emailVerified: result.user.emailVerified,
        // New users get default roles - this is correct
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
      {children}
    </AuthContext.Provider>
  );
}
