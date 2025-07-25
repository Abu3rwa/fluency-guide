import React, { createContext, useContext } from "react";
import * as studentTaskService from "../services/student-services/studentTaskService";

const StudentTaskContext = createContext();

export const StudentTaskProvider = ({ children }) => {
  const value = { ...studentTaskService };
  return (
    <StudentTaskContext.Provider value={value}>
      {children}
    </StudentTaskContext.Provider>
  );
};

export const useStudentTask = () => useContext(StudentTaskContext);
