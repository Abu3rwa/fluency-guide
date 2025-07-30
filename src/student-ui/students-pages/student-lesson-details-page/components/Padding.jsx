import { Box } from "@mui/material";

export default function Padding({ children }) {
  return <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>;
}
