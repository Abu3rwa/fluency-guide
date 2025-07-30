import React from "react";
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  ExitToApp as ExitToAppIcon,
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  VideoLibrary as VideoLibraryIcon,
  LibraryBooks as LibraryBooksIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next"; // <-- Add this import
import { ROUTES } from "../../routes/constants";


// Wrap the menu items in a function to use the translation hook
export const getMenuItems = (user, userData, t) => {
  if (userData?.isAdmin) {
    return [
      {
        text: t("menu.dashboard", "Dashboard"),
        icon: <DashboardIcon />,
        path: "/dashboard",
        description: t("menu.overviewAnalytics", "Overview & Analytics"),
      },
      {
        text: t("menu.courses", "Courses"),
        icon: <BookIcon />,
        path: "/management",
        description: t("menu.createManageCourses", "Create & Manage Courses"),
      },
      {
        text: t("menu.students", "Students"),
        icon: <PeopleIcon />,
        path: ROUTES.STUDENT_STATISTICS,
        description: t("menu.studentManagement", "Student Management"),
      },
      {
        text: t("menu.enrollments", "Enrollments"),
        icon: <GroupIcon />,
        path: "/enrollments",
        description: t("menu.manageEnrollments", "Manage Course Enrollments"),
      },
      {
        text: t("menu.payments", "Payments"),
        icon: <PaymentIcon />,
        path: "/payments",
        description: t("menu.paymentManagement", "Payment Management"),
      },
      {
        text: t("menu.analytics", "Analytics"),
        icon: <AnalyticsIcon />,
        path: "/analytics",
        description: t("menu.performanceReports", "Performance Reports"),
      },
      {
        text: t("menu.settings", "Settings"),
        icon: <SettingsIcon />,
        path: "/settings",
        description: t("menu.platformSettings", "Platform Settings"),
      },
      {
        text: t("menu.helpSupport", "Help & Support"),
        icon: <HelpIcon />,
        path: "/support",
        description: t("menu.helpCenterSupport", "Help Center & Support"),
      },
    ];
  } else if (user) {
    return [
      {
        text: t("menu.dashboard", "Dashboard"),
        icon: <DashboardIcon />,
        path: "/dashboard",
        description: t("menu.overviewProgress", "Overview & Progress"),
      },
      {
        text: t("menu.myCourses", "My Courses"),
        icon: <SchoolIcon />,
        path: "/courses",
        description: t("menu.enrolledCourses", "Enrolled Courses"),
      },
      {
        text: t("menu.vocabulary", "Vocabulary"),
        icon: <LibraryBooksIcon />,
        path: "/student/vocabulary",
        description: t("menu.vocabularyBuilding", "Vocabulary Building"),
      },
      {
        text: t("menu.assignments", "Assignments"),
        icon: <AssignmentIcon />,
        path: "/assignments",
        description: t("menu.myAssignments", "My Tasks & Assignments"),
      },
      {
        text: t("menu.progress", "Progress"),
        icon: <AssessmentIcon />,
        path: "/progress",
        description: t("menu.learningProgress", "Learning Progress"),
      },
      {
        text: t("menu.achievements", "Achievements"),
        icon: <AnalyticsIcon />,
        path: "/achievements",
        description: t("menu.myAchievements", "My Achievements"),
      },
      {
        text: t("menu.messages", "Messages"),
        icon: <EmailIcon />,
        path: "/messages",
        description: t("menu.instructorMessages", "Instructor Messages"),
      },
      {
        text: t("menu.notifications", "Notifications"),
        icon: <NotificationsIcon />,
        path: "/notifications",
        description: t("menu.systemNotifications", "System Notifications"),
      },
      {
        text: t("menu.profile", "Profile"),
        icon: <PersonIcon />,
        path: "/profile",
        description: t("menu.userProfile", "User Profile"),
      },
      {
        text: t("menu.settings", "Settings"),
        icon: <SettingsIcon />,
        path: "/settings",
        description: t("menu.accountSettings", "Account Settings"),
      },
      {
        text: t("menu.helpSupport", "Help & Support"),
        icon: <HelpIcon />,
        path: "/support",
        description: t("menu.getHelp", "Get Help"),
      },
    ];
  } else {
    return [
      {
        text: t("menu.courses", "Courses"),
        icon: <SchoolIcon />,
        path: "/courses",
        description: t("menu.exploreCourses", "Explore Courses"),
      },
      {
        text: t("menu.about", "About"),
        icon: <InfoIcon />,
        path: "/about",
        description: t("menu.aboutUs", "About Us"),
      },
      {
        text: t("menu.contact", "Contact"),
        icon: <EmailIcon />,
        path: "/contact",
        description: t("menu.contactUs", "Contact Us"),
      },
      {
        text: t("menu.help", "Help"),
        icon: <HelpIcon />,
        path: "/help",
        description: t("menu.helpCenter", "Help Center"),
      },
    ];
  }
};
