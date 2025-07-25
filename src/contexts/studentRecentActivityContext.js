import React, { createContext, useContext } from "react";
import * as studentRecentActivityService from "../services/student-services/studentRecentActivityService";

const StudentRecentActivityContext = createContext();

export const StudentRecentActivityProvider = ({ children }) => {
  const value = { ...studentRecentActivityService };
  return (
    <StudentRecentActivityContext.Provider value={value}>
      {children}
    </StudentRecentActivityContext.Provider>
  );
};

export const useStudentRecentActivity = () =>
  useContext(StudentRecentActivityContext);
