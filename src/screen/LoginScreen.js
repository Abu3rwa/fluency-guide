import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../frebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./login.css";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";

const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isAdmin] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User logged in:", user);
      navigate("/"); // Navigate to dashboard or another page after login
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to log in. Please check your credentials and try again.");
    }
  };
  const createUserInFirestore = async (email, name, password, isAdmin) => {
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");
    const db = getFirestore();
    try {
      await setDoc(doc(db, "users", email), {
        email,
        name,
        password,
        isAdmin,
      });
      console.log("User created in Firestore");
    } catch (error) {
      console.error("Error creating user in Firestore:", error);
    }
  };
  const handleGoogleLogin = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;

        console.log("Google sign in successful:", user);
      })
      .catch((error) => {
        console.error("Error during Google sign in:", error);
      });
  };

  return (
    <div className="login mainbg">
      {/* <h1 className="text-main">English Fluency Hub</h1> */}
      <form className="secondarybg">
        <img
          onClick={handleGoogleLogin}
          src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
          alt="Google logo"
        />
        <span>Sign in with Google</span>
        <hr />
        {/* <label>
          Email
          <input
            placeholder="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Signup</button> */}
      </form>
    </div>
  );
};

export default SignupScreen;
