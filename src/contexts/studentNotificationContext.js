import React, { createContext, useContext } from "react";
import * as studentNotificationService from "../services/student-services/studentNotificationService";

const StudentNotificationContext = createContext();

export const StudentNotificationProvider = ({ children }) => {
  const value = { ...studentNotificationService };
  return (
    <StudentNotificationContext.Provider value={value}>
      {children}
    </StudentNotificationContext.Provider>
  );
};

export const useStudentNotification = () =>
  useContext(StudentNotificationContext);
