import React from "react";
import { Skeleton, Box } from "@mui/material";

const SkeletonLoader = ({ variant = "rectangular", ...props }) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Skeleton variant={variant} {...props} />
    </Box>
  );
};

export default SkeletonLoader;
