import React, { createContext, useContext } from "react";
import * as studentModuleService from "../services/student-services/studentModuleService";

const StudentModuleContext = createContext();

export const StudentModuleProvider = ({ children }) => {
  const value = { ...studentModuleService };
  return (
    <StudentModuleContext.Provider value={value}>
      {children}
    </StudentModuleContext.Provider>
  );
};

export const useStudentModule = () => useContext(StudentModuleContext);
