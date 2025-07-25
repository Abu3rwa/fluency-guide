import React, { createContext, useContext } from "react";
import * as studentPronunciationProgressService from "../services/student-services/studentPronunciationProgressService";

const StudentPronunciationProgressContext = createContext();

export const StudentPronunciationProgressProvider = ({ children }) => {
  const value = { ...studentPronunciationProgressService };
  return (
    <StudentPronunciationProgressContext.Provider value={value}>
      {children}
    </StudentPronunciationProgressContext.Provider>
  );
};

export const useStudentPronunciationProgress = () =>
  useContext(StudentPronunciationProgressContext);
