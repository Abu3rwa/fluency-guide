import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
const USERS_COLLECTION = "users";

const userService = {
  async createOrUpdateUser(user) {
    if (!user || !user.uid) {
      throw new Error("Invalid user data");
    }

    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user with default values
      const newUser = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || user.email?.split("@")[0] || "User",
        name:
          user.name || user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL || "",
        profileImage: user.photoURL || "",
        isAdmin: user.isAdmin ?? false,
        isStudent: user.isStudent ?? true,
        isInstructor: user.isInstructor ?? false,
        emailVerified: user.emailVerified || false,
        bio: user.bio || "",
        phoneNumber: user.phoneNumber || "",
        instructorProfile: user.instructorProfile || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastStudyDate: serverTimestamp(),
        lastActiveCourse: "",
        enrolledCourses: [],
        completedLessons: [],
        pendingEnrollments: [],
        achievements: [],
        preferences: user.preferences || {
          preferredLanguage: "en",
        },
        progress: user.progress || {
          currentStreak: 0,
          totalPoints: 0,
          completedCourses: 0,
          totalStudyTime: 0,
        },
      };

      await setDoc(userRef, newUser);
      return newUser;
    }

    // Update existing user
    const userData = userDoc.data();
    const updatedUser = {
      ...userData,
      email: user.email || userData.email,
      displayName:
        user.displayName ||
        userData.displayName ||
        user.email?.split("@")[0] ||
        "User",
      name:
        user.name ||
        user.displayName ||
        userData.name ||
        user.email?.split("@")[0] ||
        "User",
      photoURL: user.photoURL || userData.photoURL || "",
      profileImage: user.photoURL || userData.profileImage || "",
      isAdmin: user.isAdmin ?? userData.isAdmin ?? false,
      isStudent: user.isStudent ?? userData.isStudent ?? true,
      isInstructor: user.isInstructor ?? userData.isInstructor ?? false,
      emailVerified:
        user.emailVerified !== undefined
          ? user.emailVerified
          : userData.emailVerified,
      bio: user.bio ?? userData.bio ?? "",
      phoneNumber: user.phoneNumber ?? userData.phoneNumber ?? "",
      instructorProfile: user.instructorProfile ?? userData.instructorProfile ?? null,
      preferences: user.preferences ?? userData.preferences ?? { preferredLanguage: "en" },
      progress: user.progress ?? userData.progress ?? {
        currentStreak: 0,
        totalPoints: 0,
        completedCourses: 0,
        totalStudyTime: 0,
      },
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Remove any undefined values
    Object.keys(updatedUser).forEach((key) => {
      if (updatedUser[key] === undefined) {
        delete updatedUser[key];
      }
    });

    await updateDoc(userRef, updatedUser);
    return updatedUser;
  },

  async updateUserProfile(userId, profileData) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    // Remove any undefined values from profileData
    const cleanProfileData = Object.entries(profileData).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    const updatedData = {
      ...cleanProfileData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updatedData);
    return { ...userDoc.data(), ...updatedData };
  },

  async updateUserRole(userId, { isAdmin, isStudent, isInstructor }) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const updatedData = {
      isAdmin: isAdmin ?? false,
      isStudent: isStudent ?? true,
      isInstructor: isInstructor ?? false,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updatedData);
    return { ...userDoc.data(), ...updatedData };
  },

  async getAllUsers() {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(usersRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async getUsersByRole(role) {
    if (!role) {
      throw new Error("Role is required");
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where(role, "==", true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  async getUserById(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  },

  async signUpWithEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  async signInWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  },

  async signOutUser() {
    return signOut(auth);
  },

  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },
};

export default userService;

// Update user profile with instructor fields
export const updateInstructorProfile = async (userId, instructorData) => {
  
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      'instructorProfile.bio': instructorData.bio || '',
      'instructorProfile.qualifications': instructorData.qualifications || [],
      'instructorProfile.hourlyRate': instructorData.hourlyRate || 0,
      'instructorProfile.currency': instructorData.currency || 'USD',
      'instructorProfile.languages': instructorData.languages || [],
      'instructorProfile.specialties': instructorData.specialties || [],
      updatedAt: new Date()
    });
  } catch (error) {
    console.error(`Error updating instructor profile for user ${userId}:`, error);
    throw error;
  }
};

// Update user availability
export const updateInstructorAvailability = async (userId, availabilityData) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      'availability.timeZone': availabilityData.timeZone || 'Africa/Tripoli',
      'availability.slots': availabilityData.slots || [],
      updatedAt: new Date()
    });
  } catch (error) {
    console.error(`Error updating availability for user ${userId}:`, error);
    throw error;
  }
};

// Get instructors
export const getInstructors = async () => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('isInstructor', '==', true)
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Client-side sort to avoid Firestore composite index requirement
    return list.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
  } catch (error) {
    console.error('Error fetching instructors:', error);
    throw error;
  }
};

// Get instructor by ID
export const getInstructorById = async (instructorId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, instructorId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists() || !docSnap.data().isInstructor) {
      throw new Error(`Instructor with ID ${instructorId} not found`);
    }
    
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error(`Error fetching instructor ${instructorId}:`, error);
    throw error;
  }
};
