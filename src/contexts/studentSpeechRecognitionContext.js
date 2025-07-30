import React, { createContext, useContext } from "react";
import studentSpeechRecognitionService from "../services/student-services/studentSpeechRecognitionService";

const StudentSpeechRecognitionContext = createContext();

export const StudentSpeechRecognitionProvider = ({ children }) => {
  const value = {
    // Service methods
    isSupported: studentSpeechRecognitionService.isSupported.bind(
      studentSpeechRecognitionService
    ),
    requestMicrophonePermission:
      studentSpeechRecognitionService.requestMicrophonePermission.bind(
        studentSpeechRecognitionService
      ),
    startListening: studentSpeechRecognitionService.startListening.bind(
      studentSpeechRecognitionService
    ),
    stopListening: studentSpeechRecognitionService.stopListening.bind(
      studentSpeechRecognitionService
    ),
    practicePronunciation:
      studentSpeechRecognitionService.practicePronunciation.bind(
        studentSpeechRecognitionService
      ),
    analyzePronunciation:
      studentSpeechRecognitionService.analyzePronunciation.bind(
        studentSpeechRecognitionService
      ),
    comparePronunciation:
      studentSpeechRecognitionService.comparePronunciation.bind(
        studentSpeechRecognitionService
      ),
    calculateAccuracy: studentSpeechRecognitionService.calculateAccuracy.bind(
      studentSpeechRecognitionService
    ),
    getPronunciationFeedback:
      studentSpeechRecognitionService.getPronunciationFeedback.bind(
        studentSpeechRecognitionService
      ),

    // Service instance for direct access
    service: studentSpeechRecognitionService,
  };

  return (
    <StudentSpeechRecognitionContext.Provider value={value}>
      {children}
    </StudentSpeechRecognitionContext.Provider>
  );
};

export const useStudentSpeechRecognition = () => {
  const context = useContext(StudentSpeechRecognitionContext);
  if (!context) {
    throw new Error(
      "useStudentSpeechRecognition must be used within a StudentSpeechRecognitionProvider"
    );
  }
  return context;
};
