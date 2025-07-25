import React, { createContext, useContext } from "react";
import * as studentSpeechRecognitionService from "../services/student-services/studentSpeechRecognitionService";

const StudentSpeechRecognitionContext = createContext();

export const StudentSpeechRecognitionProvider = ({ children }) => {
  const value = { ...studentSpeechRecognitionService };
  return (
    <StudentSpeechRecognitionContext.Provider value={value}>
      {children}
    </StudentSpeechRecognitionContext.Provider>
  );
};

export const useStudentSpeechRecognition = () =>
  useContext(StudentSpeechRecognitionContext);
