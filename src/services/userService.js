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
        isAdmin: false,
        isStudent: true,
        emailVerified: user.emailVerified || false,
        bio: "",
        phoneNumber: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        lastStudyDate: serverTimestamp(),
        lastActiveCourse: "",
        enrolledCourses: [],
        completedLessons: [],
        pendingEnrollments: [],
        achievements: [],
        preferences: {
          preferredLanguage: "en",
        },
        progress: {
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
      emailVerified:
        user.emailVerified !== undefined
          ? user.emailVerified
          : userData.emailVerified,
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

  async updateUserRole(userId, { isAdmin, isStudent }) {
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
