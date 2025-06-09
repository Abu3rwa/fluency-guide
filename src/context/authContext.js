// import { createContext, useState } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   const login = (userCredentials) => {
//     setUser(userCredentials);
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   const googleLogin = () => {
//     const auth = getAuth();
//     const provider = new GoogleAuthProvider();

//     signInWithPopup(auth, provider)
//       .then((result) => {
//         const user = result.user;
//         setUser(user);

//         console.log("Google sign in successful:", user);
//       })
//       .catch((error) => {
//         console.error("Error during Google sign in:", error);
//       });
//   };
//   return (
//     <AuthContext.Provider value={{ user, login, logout, googleLogin }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
