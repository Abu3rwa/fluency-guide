import React, { createContext, useContext } from "react";
import * as studentCourseService from "../services/student-services/studentCourseService";

const StudentCourseContext = createContext();

export const StudentCourseProvider = ({ children }) => {
  // Expose all service methods
  const value = { ...studentCourseService };
  return (
    <StudentCourseContext.Provider value={value}>
      {children}
    </StudentCourseContext.Provider>
  );
};

export const useStudentCourse = () => useContext(StudentCourseContext);
