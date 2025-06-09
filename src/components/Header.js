import { useState, useEffect } from "react";

import "./header.css";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Button, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function Header() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);
  console.log(user);
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User signed out");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <div className="header">
      <div className="logo">
        <Link to="/">
          {" "}
          <h1 className="text-light">Dashboard</h1>
        </Link>
        <h4 className="text-light">Reap English</h4>
      </div>

      <ul>
        {user ? (
          <>
            <li>
              <span></span>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  Options
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Button variant="danger" onClick={handleLogout}>
                    <i className="fa fa-sign-out"></i>
                    logout
                  </Button>
                  <small>{user.displayName}</small>
                </Dropdown.Menu>
              </Dropdown>
            </li>
          </>
        ) : (
          <>
            <li>
              <a href="/login" className="btn btn-primary">
                Login
              </a>
            </li>
          </>
        )}
      </ul>
    </div>
  );
}
