import React, { createContext, useContext } from "react";
import * as studentMessageService from "../services/student-services/studentMessageService";

const StudentMessageContext = createContext();

export const StudentMessageProvider = ({ children }) => {
  const value = { ...studentMessageService };
  return (
    <StudentMessageContext.Provider value={value}>
      {children}
    </StudentMessageContext.Provider>
  );
};

export const useStudentMessage = () => useContext(StudentMessageContext);
