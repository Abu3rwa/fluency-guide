import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

const getStatusColor = (status) => {
  switch (status) {
    case "published":
      return "success";
    case "draft":
      return "warning";
    case "archived":
      return "error";
    default:
      return "default";
  }
};

const LessonList = ({ lessons, onMenuClick }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Mobile Card View
  if (isMobile) {
    return (
      <Box>
        {lessons.map((lesson) => (
          <Card
            key={lesson.id}
            sx={{
              mb: 2,
              bgcolor: theme.palette.background.paper,
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: theme.palette.text.primary }}
                >
                  {lesson.title}
                </Typography>
                <Tooltip title={t("lessonManagement.actions.more") || "More"}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Desktop-specific: prevent any layout shifts
                      if (window.innerWidth >= 960) {
                        e.stopPropagation();
                      }
                      onMenuClick(e, lesson);
                    }}
                    sx={{
                      // Desktop-specific: ensure stable positioning
                      "@media (min-width: 960px)": {
                        position: "relative",
                        zIndex: 1,
                      },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t("lessonManagement.fields.status") || "Status"}:
                  </Typography>
                  <Chip
                    label={
                      t(`lessonManagement.status.${lesson.status}`) ||
                      lesson.status
                    }
                    color={getStatusColor(lesson.status)}
                    size="small"
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t("lessonManagement.fields.duration") || "Duration"}:
                  </Typography>
                  <Chip
                    label={`${lesson.duration} min`}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {t("lessonManagement.fields.lastUpdated") || "Last Updated"}
                    :
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {lesson.updatedAt && lesson.updatedAt.toDate
                      ? lesson.updatedAt.toDate().toLocaleDateString()
                      : ""}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Desktop Table View
  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: { xs: "auto", md: 600 },
        overflowX: { xs: "auto", md: "visible" },
        position: "relative",
      }}
    >
      <Table
        size="small"
        aria-label="lessons table"
        sx={{ minWidth: { xs: 650, md: 800 } }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                whiteSpace: "nowrap",
                minWidth: { xs: 150, md: 200 },
              }}
            >
              {t("lessonManagement.fields.title") || "Title"}
            </TableCell>
            <TableCell
              sx={{
                whiteSpace: "nowrap",
                minWidth: { xs: 100, md: 120 },
              }}
            >
              {t("lessonManagement.fields.status") || "Status"}
            </TableCell>
            <TableCell
              sx={{
                whiteSpace: "nowrap",
                minWidth: { xs: 100, md: 120 },
              }}
            >
              {t("lessonManagement.fields.duration") || "Duration"}
            </TableCell>
            <TableCell
              sx={{
                whiteSpace: "nowrap",
                minWidth: { xs: 120, md: 150 },
              }}
            >
              {t("lessonManagement.fields.lastUpdated") || "Last Updated"}
            </TableCell>
            <TableCell
              align="right"
              sx={{
                width: { xs: 60, md: 80 },
              }}
            >
              {t("lessonManagement.fields.actions") || "Actions"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lessons.map((lesson) => (
            <TableRow key={lesson.id} hover>
              <TableCell
                sx={{
                  maxWidth: { xs: 150, md: 200 },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lesson.title}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={
                    t(`lessonManagement.status.${lesson.status}`) ||
                    lesson.status
                  }
                  color={getStatusColor(lesson.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={`${lesson.duration} min`}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell
                sx={{
                  maxWidth: { xs: 120, md: 150 },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {lesson.updatedAt && lesson.updatedAt.toDate
                    ? lesson.updatedAt.toDate().toLocaleDateString()
                    : ""}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ width: { xs: 60, md: 80 } }}>
                <Tooltip title={t("lessonManagement.actions.more") || "More"}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Desktop-specific: prevent any layout shifts
                      if (window.innerWidth >= 960) {
                        e.stopPropagation();
                      }
                      onMenuClick(e, lesson);
                    }}
                    sx={{
                      // Desktop-specific: ensure stable positioning
                      "@media (min-width: 960px)": {
                        position: "relative",
                        zIndex: 1,
                      },
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LessonList;
