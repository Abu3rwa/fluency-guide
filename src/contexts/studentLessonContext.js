import React, { createContext, useContext } from "react";
import * as studentLessonService from "../services/student-services/studentLessonService";

const StudentLessonContext = createContext();

export const StudentLessonProvider = ({ children }) => {
  const value = { ...studentLessonService };
  return (
    <StudentLessonContext.Provider value={value}>
      {children}
    </StudentLessonContext.Provider>
  );
};

export const useStudentLesson = () => useContext(StudentLessonContext);
