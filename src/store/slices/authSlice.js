/**
 * Auth Slice - Manages authentication state
 * 
 * 🎓 LEARNING NOTES:
 * 
 * A "slice" has 3 main parts:
 * 1. initialState - The starting data
 * 2. reducers - Sync actions (instant changes)
 * 3. extraReducers - Async actions (API calls, Firebase, etc.)
 * 
 * This slice will manage:
 * - user: The logged-in user object
 * - userProfile: Extra user data from Firestore
 * - loading: Are we waiting for something?
 * - error: Any error messages
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth, db } from '../../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Update User Profile
 */
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (updates, { rejectWithValue, getState }) => {
        try {
            const { user, userProfile } = getState().auth;
            if (!user) throw new Error('No user logged in');

            // Update in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { ...updates, updatedAt: new Date() }, { merge: true });

            // Return updated profile
            return { ...userProfile, ...updates };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// ============================================
// INITIAL STATE
// ============================================
// This is what the state looks like when the app starts
const initialState = {
    user: null,           // Firebase auth user
    userProfile: null,    // Extra profile data from Firestore
    loading: false,       // Loading indicator
    error: null,          // Error message
};

export const loginUser = createAsyncThunk(
    'auth/loginUser',  // Action name (appears in Redux DevTools)
    async ({ email, password }, { rejectWithValue, getState }) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const authUser = result.user;
            const userDocRef = doc(db, 'users', authUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            return {
                user: {
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: authUser.displayName,
                },
                userProfile: userDocSnap.exists()
                    ? { uid: authUser.uid, ...userDocSnap.data() }
                    : null,
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Register User
 */
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ email, password, displayName, role = 'student' }, { rejectWithValue }) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const authUser = result.user;
            await updateProfile(authUser, { displayName });
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
            return {
                user: {
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: displayName,
                },
                userProfile,
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

/**
 * Logout User
 */
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await signOut(auth);
            console.log('User logged out successfully');
            return null;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,

    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setUserProfile: (state, action) => {
            state.userProfile = action.payload;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.userProfile = action.payload.userProfile;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.userProfile = action.payload.userProfile;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // -------- LOGOUT --------
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.userProfile = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // -------- UPDATE PROFILE --------
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.userProfile = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Export sync actions
export const { clearError, setUser, setUserProfile, setLoading } = authSlice.actions;

// Export selectors (helper functions to get data)
// Usage: const user = useSelector(selectUser)
export const selectUser = (state) => state.auth.user;
export const selectUserProfile = (state) => state.auth.userProfile;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => !!state.auth.user;
export const selectIsAdmin = (state) => state.auth.userProfile?.isAdmin === true;
export const selectIsInstructor = (state) => state.auth.userProfile?.role === 'instructor';

// Export the reducer
export default authSlice.reducer;
