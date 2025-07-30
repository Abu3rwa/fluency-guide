export const playSound = (type) => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.play().catch(console.error);
};

export const playCorrectSound = () => playSound("correct");
export const playIncorrectSound = () => playSound("incorrect");
