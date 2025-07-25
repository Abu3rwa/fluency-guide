import React, { createContext, useContext } from "react";
import * as studentElevenlabsService from "../services/student-services/studentElevenlabsService";

const StudentElevenlabsContext = createContext();

export const StudentElevenlabsProvider = ({ children }) => {
  const value = { ...studentElevenlabsService };
  return (
    <StudentElevenlabsContext.Provider value={value}>
      {children}
    </StudentElevenlabsContext.Provider>
  );
};

export const useStudentElevenlabs = () => useContext(StudentElevenlabsContext);
