import React, { createContext, useContext } from "react";
import * as studentVocabularyProgressService from "../services/student-services/studentVocabularyProgressService";

const StudentVocabularyProgressContext = createContext();

export const StudentVocabularyProgressProvider = ({ children }) => {
  const value = { ...studentVocabularyProgressService };
  return (
    <StudentVocabularyProgressContext.Provider value={value}>
      {children}
    </StudentVocabularyProgressContext.Provider>
  );
};

export const useStudentVocabularyProgress = () =>
  useContext(StudentVocabularyProgressContext);
