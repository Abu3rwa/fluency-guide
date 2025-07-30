import React from "react";
import { Box, Container, Paper, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import StudentTaskHeader from "./StudentTaskHeader";
import StudentTaskProgressBar from "./StudentTaskProgressBar";
import StudentTaskTimer from "./StudentTaskTimer";
import StudentTaskNavigation from "./StudentTaskNavigation";

const StudentTaskLayout = ({
  task,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  onTimeUp,
  onNext,
  onPrevious,
  onSubmit,
  isAnswered,
  isLastQuestion,
  onPause,
  isPaused,
  children,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      maxWidth="md"
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 },
        // Ensure proper mobile layout
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: { xs: 1, sm: 2 },
          overflow: "hidden",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          // Mobile-specific improvements
          "@media (max-width: 600px)": {
            margin: 0,
            borderRadius: 0,
            minHeight: "100vh",
          },
        }}
      >
        <StudentTaskHeader
          title={task?.title || "Task"}
          difficulty={task?.difficulty}
          onPause={onPause}
          isPaused={isPaused}
          showPauseButton={timeRemaining > 0}
        />
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            flex: 1,
            display: "flex",
            flexDirection: "column",
            // Ensure content doesn't overflow on mobile
            overflow: "hidden",
          }}
        >
          {timeRemaining > 0 && (
            <StudentTaskTimer seconds={timeRemaining} onTimeUp={onTimeUp} />
          )}
          <StudentTaskProgressBar
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
          />
          <Box
            sx={{
              my: { xs: 2, sm: 3 },
              flex: 1,
              overflow: "auto",
              // Ensure proper spacing on mobile
              "& > *": {
                width: "100%",
              },
            }}
          >
            {children}
          </Box>
          <StudentTaskNavigation
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            onNext={onNext}
            onPrevious={onPrevious}
            onSubmit={onSubmit}
            isAnswered={isAnswered}
            isLastQuestion={isLastQuestion}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default StudentTaskLayout;
