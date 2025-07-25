import { useCustomTheme } from "../../../contexts/ThemeContext";

export const useStudentCourseDetailsPageStyles = () => {
  const { theme } = useCustomTheme();

  const mainContainer = {
    width: "100%",
    maxWidth: 1200,
    mx: "auto",
    p: { xs: 1, md: 3 },
    backgroundColor: theme.palette.background.default,
  };

  const loadingContainer = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    backgroundColor: theme.palette.background.paper,
  };

  const contentGrid = {
    mt: 4,
  };

  const mainContent = {
    pr: { md: 4 },
  };

  const sidebar = {
    pl: { md: 4 },
  };

  const button = {
    mb: 2,
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
  };

  return { mainContainer, loadingContainer, contentGrid, mainContent, sidebar, button };
};