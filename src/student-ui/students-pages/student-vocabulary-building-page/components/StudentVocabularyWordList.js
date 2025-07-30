import React, { useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { FixedSizeList as List } from "react-window";
import StudentVocabularyWordCard from "./StudentVocabularyWordCard";

const StudentVocabularyWordList = ({
  words,
  onMarkAsLearned,
  onMarkAsDifficult,
  onToggleFavorite,
  onPronunciationClick,
  itemHeight = 400, // Adjust based on your word card height
}) => {
  // Memoized word item renderer
  const WordItem = useCallback(
    ({ index, style }) => {
      const word = words[index];

      if (!word) {
        return (
          <div style={style}>
            <Box sx={{ p: 2 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          </div>
        );
      }

      return (
        <div style={style}>
          <StudentVocabularyWordCard
            word={word}
            onMarkAsLearned={() => onMarkAsLearned(word.id)}
            onMarkAsDifficult={() => onMarkAsDifficult(word.id)}
            onToggleFavorite={() => onToggleFavorite(word.id)}
            onPronunciationClick={() => onPronunciationClick(word)}
          />
        </div>
      );
    },
    [
      words,
      onMarkAsLearned,
      onMarkAsDifficult,
      onToggleFavorite,
      onPronunciationClick,
    ]
  );

  // Memoized list props
  const listProps = useMemo(
    () => ({
      height: Math.min(600, words.length * itemHeight), // Max height of 600px
      itemCount: words.length,
      itemSize: itemHeight,
      width: "100%",
    }),
    [words.length, itemHeight]
  );

  if (words.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="h6" color="text.secondary">
          No vocabulary words available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <List {...listProps}>{WordItem}</List>
    </Box>
  );
};

export default React.memo(StudentVocabularyWordList);
