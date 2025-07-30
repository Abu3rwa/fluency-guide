// Get color for difficulty level
export const getDifficultyColor = (level) => {
  switch (level.toUpperCase()) {
    case "A1":
      return "#4CAF50"; // Green
    case "A2":
      return "#8BC34A"; // Light Green
    case "B1":
      return "#FF9800"; // Orange
    case "B2":
      return "#FF5722"; // Deep Orange
    case "C1":
      return "#F44336"; // Red
    case "C2":
      return "#9C27B0"; // Purple
    default:
      return "#9E9E9E"; // Grey
  }
};

// Get description for frequency
export const getFrequencyDescription = (frequency) => {
  switch (frequency.toLowerCase()) {
    case "very_high":
      return "Very commonly used in everyday English";
    case "high":
      return "Frequently used in English";
    case "medium":
      return "Moderately used in English";
    case "low":
      return "Occasionally used in English";
    case "very_low":
      return "Rarely used in English";
    default:
      return frequency;
  }
};

// Get motivational messages
export const getRandomMotivationalMessage = () => {
  const messages = [
    "Great job! Keep up the good work!",
    "You're making excellent progress!",
    "Your vocabulary is growing every day!",
    "Consistency is key to language learning!",
    "You're on your way to fluency!",
    "Every word you learn brings you closer to mastery!",
    "Learning vocabulary is like building a bridge to a new culture!",
    "Your dedication is impressive!",
    "You're developing a rich vocabulary!",
    "Keep going! You're doing great!",
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

// Calculate progress percentage
export const calculateProgressPercentage = (current, target) => {
  if (!target || target <= 0) return 0;
  const percentage = current / target;
  return Math.min(1, Math.max(0, percentage)); // Clamp between 0 and 1
};

// Check if goal is completed
export const isGoalCompleted = (current, target) => {
  return current >= target;
};
