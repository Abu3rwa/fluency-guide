import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

const FeatureCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2, 1.5, 2, 1.5),
  borderRadius: "16px",
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(1),
  textAlign: "center",
  transition: "all 0.3s ease-in-out",
  height: "100%", // Ensure all cards have the same height
  fontSize: "1rem",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2, 1, 2, 1),
    gap: theme.spacing(0.5),
    fontSize: "0.95rem",
  },
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[4],
  },
}));

export default FeatureCard;
