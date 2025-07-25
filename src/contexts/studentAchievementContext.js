import React, { createContext, useContext } from "react";
import * as studentAchievementService from "../services/student-services/studentAchievementService";

const StudentAchievementContext = createContext();

export const StudentAchievementProvider = ({ children }) => {
  const value = { ...studentAchievementService };
  return (
    <StudentAchievementContext.Provider value={value}>
      {children}
    </StudentAchievementContext.Provider>
  );
};

export const useStudentAchievement = () =>
  useContext(StudentAchievementContext);
