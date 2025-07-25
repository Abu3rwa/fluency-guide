import React, { createContext, useContext } from "react";
import * as studentVocabularyUploadService from "../services/student-services/studentVocabularyUploadService";

const StudentVocabularyUploadContext = createContext();

export const StudentVocabularyUploadProvider = ({ children }) => {
  const value = { ...studentVocabularyUploadService };
  return (
    <StudentVocabularyUploadContext.Provider value={value}>
      {children}
    </StudentVocabularyUploadContext.Provider>
  );
};

export const useStudentVocabularyUpload = () =>
  useContext(StudentVocabularyUploadContext);
