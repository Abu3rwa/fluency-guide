import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../frebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import CustomAccordion from "../components/LessonDescription";
import VideoPlayer from "../components/VideoPlayer";
import LessonDescription from "../components/LessonDescription";
import LessonScript from "../components/LessonScript";
import CreateTaskForm from "../components/CreateTaskForm";
import LessonInstructions from "../components/LessonInstructions";
import Task from "../components/Task";

function LessonDetailsScreen() {
  const theme = useTheme();
  const [showAudioEditor, setShowAudioEditor] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);
  const [showAudioPreview, setShowAudioPreview] = useState(false);
  const [video, setVideo] = useState("");
  const [audio, setAudio] = useState("");
  const id = useParams().id || window.location.pathname.split("/").pop();
  const [tasks, setTasks] = useState([]);
  const [lesson, setLesson] = useState({
    title: "",
    text: "",
    audio: "",
    video: "",
    instructions: "",
    description: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const tasksRef = collection(db, "tasks");
      const q = query(tasksRef, where("lessonId", "==", id));
      const querySnapshot = await getDocs(q);
      const taskData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    const getLesson = async () => {
      const lessonRef = doc(db, "english_lessons", id);
      const lessonSnap = await getDoc(lessonRef);
      if (lessonSnap.exists()) {
        setLesson(lessonSnap.data());
        setVideo(lessonSnap.data().video || "");
        setAudio(lessonSnap.data().audio || "");
      }
    };
    getLesson();
  }, [id]);

  const updateVideo = async (video) => {
    try {
      const lessonRef = doc(db, "english_lessons", id);
      await updateDoc(lessonRef, { video });
      setLesson((prev) => ({ ...prev, video }));
      setShowVideoEditor(false);
    } catch (error) {
      console.error("Error updating video:", error);
    }
  };

  const updateAudio = async (audio) => {
    try {
      const lessonRef = doc(db, "english_lessons", id);
      await updateDoc(lessonRef, { audio });
      setLesson((prev) => ({ ...prev, audio }));
      setShowAudioEditor(false);
    } catch (error) {
      console.error("Error updating audio:", error);
    }
  };

  const handleDeleteLesson = async () => {
    // Implement delete functionality
    setDeleteDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            {lesson.title}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Lesson
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowTaskEditor(true)}
            >
              Add Task
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* Media Section */}
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lesson Media
                </Typography>
                <Stack spacing={2}>
                  {/* Video Section */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">Video</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => setShowVideoPreview(!showVideoPreview)}
                        >
                          {showVideoPreview ? "Hide" : "Preview"}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => setShowVideoEditor(true)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                    {showVideoEditor ? (
                      <Box sx={{ mt: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={video}
                          onChange={(e) => setVideo(e.target.value)}
                          placeholder="Enter video URL"
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => updateVideo(video)}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={() => setShowVideoEditor(false)}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {lesson.video || "No video URL provided"}
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  {/* Audio Section */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle1">Audio</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => setShowAudioPreview(!showAudioPreview)}
                        >
                          {showAudioPreview ? "Hide" : "Preview"}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={() => setShowAudioEditor(true)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Stack>
                    </Box>
                    {showAudioEditor ? (
                      <Box sx={{ mt: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={audio}
                          onChange={(e) => setAudio(e.target.value)}
                          placeholder="Enter audio URL"
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => updateAudio(audio)}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={() => setShowAudioEditor(false)}
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {lesson.audio || "No audio URL provided"}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Video Preview */}
            {showVideoPreview && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <VideoPlayer video={lesson.video} height="390" width="100%" />
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Content Section */}
          <Grid item xs={12} md={6}>
            {showTaskEditor ? (
              <Card>
                <CardContent>
                  <CreateTaskForm onClose={() => setShowTaskEditor(false)} />
                </CardContent>
              </Card>
            ) : (
              <Stack spacing={3}>
                <LessonInstructions
                  title="Lesson Instructions"
                  body={lesson.instructions}
                />
                <LessonDescription
                  title="Lesson Description"
                  description={lesson.description}
                />
                <LessonScript title="Lesson Script" script={lesson.text} />
                {tasks.map((task) => (
                  <Task key={task.id} task={task} />
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Lesson</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this lesson? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteLesson}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LessonDetailsScreen;
