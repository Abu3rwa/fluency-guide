import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../frebase";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

function CreateTaskForm() {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskType, setTaskType] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [lessons, setLessons] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState([""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all lessons for the dropdown
    const fetchLessons = async () => {
      try {
        const snapshot = await getDocs(collection(db, "english_lessons"));
        setLessons(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Failed to fetch lessons");
      }
    };
    fetchLessons();
  }, []);

  // Question/Answer Handlers
  const handleAnswerChange = (idx, value) => {
    setAnswers(answers.map((a, i) => (i === idx ? value : a)));
  };
  const addAnswerField = () => setAnswers([...answers, ""]);
  const removeAnswerField = (idx) =>
    setAnswers(answers.filter((_, i) => i !== idx));

  const resetQuestionFields = () => {
    setQuestionText("");
    setAnswers([""]);
    setCorrectAnswer("");
    setEditingIndex(null);
  };

  const handleAddOrUpdateQuestion = (e) => {
    e.preventDefault();
    if (
      !questionText.trim() ||
      answers.some((a) => !a.trim()) ||
      !correctAnswer.trim()
    ) {
      setError("Please fill in the question, all answers, and correct answer.");
      return;
    }
    const question = {
      text: questionText,
      answers: answers,
      correctAnswer: correctAnswer,
    };
    if (editingIndex !== null) {
      setQuestions(
        questions.map((q, i) => (i === editingIndex ? question : q))
      );
    } else {
      setQuestions([...questions, question]);
    }
    resetQuestionFields();
    setError("");
  };

  const handleEditQuestion = (idx) => {
    const q = questions[idx];
    setQuestionText(q.text);
    setAnswers(q.answers);
    setCorrectAnswer(q.correctAnswer);
    setEditingIndex(idx);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
    if (editingIndex === idx) resetQuestionFields();
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!taskTitle.trim() || !taskType || !lessonId || questions.length === 0) {
      setError(
        "Please fill in all required fields and add at least one question."
      );
      return;
    }
    try {
      await addDoc(collection(db, "tasks"), {
        title: taskTitle,
        instructions: taskInstructions,
        type: taskType,
        lessonId,
        questions,
      });
      setSuccess("Task created successfully!");
      setTaskTitle("");
      setTaskInstructions("");
      setTaskType("");
      setLessonId("");
      setQuestions([]);
      resetQuestionFields();
      setTimeout(() => {
        setSuccess("");
        navigate("/tasks");
      }, 1200);
    } catch (err) {
      setError("Failed to create task. Please try again.");
    }
  };

  return (
    <div className="create-task-form">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <h2 className="form-title">Create Task</h2>
        </div>
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}
        <div className="form-group">
          <label className="form-label">Task Title *</label>
          <input
            className="form-input"
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Task Instructions</label>
          <input
            className="form-input"
            type="text"
            value={taskInstructions}
            onChange={(e) => setTaskInstructions(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Task Type *</label>
          <select
            className="form-select"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            required
          >
            <option value="">Select task type</option>
            <option value="true_false">True/False</option>
            <option value="fill_in_the_blank">Fill in the Blank</option>
            <option value="matching">Matching</option>
            <option value="short_answer">Short Answer</option>
            <option value="choose_the_best_answer">
              Choose the Best Answer
            </option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Lesson *</label>
          <select
            className="form-select"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            required
          >
            <option value="">Select lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Add Question</label>
          <input
            className="form-input"
            type="text"
            placeholder="Question text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
          <div style={{ marginTop: 8 }}>
            {answers.map((ans, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <input
                  className="form-input"
                  type="text"
                  placeholder={`Answer ${idx + 1}`}
                  value={ans}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  style={{ flex: 1 }}
                />
                {answers.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ marginLeft: 4 }}
                    onClick={() => removeAnswerField(idx)}
                  >
                    -
                  </button>
                )}
                {idx === answers.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ marginLeft: 4 }}
                    onClick={addAnswerField}
                  >
                    +
                  </button>
                )}
              </div>
            ))}
          </div>
          <input
            className="form-input"
            type="text"
            placeholder="Correct answer"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            style={{ marginTop: 8 }}
          />
          <div style={{ marginTop: 8 }}>
            <button className="add-btn" onClick={handleAddOrUpdateQuestion}>
              {editingIndex !== null ? "Update Question" : "Add Question"}
            </button>
            {editingIndex !== null && (
              <button
                type="button"
                className="cancel-btn"
                onClick={resetQuestionFields}
                style={{ marginLeft: 8 }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
        {questions.length > 0 && (
          <div className="form-group">
            <label className="form-label">Questions Added</label>
            <ul style={{ paddingLeft: 16 }}>
              {questions.map((q, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  <b>Q{idx + 1}:</b> {q.text}
                  <ul>
                    {q.answers.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                  <span style={{ color: "green" }}>
                    Correct: {q.correctAnswer}
                  </span>
                  <div style={{ marginTop: 4 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleEditQuestion(idx)}
                      style={{ marginRight: 4 }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveQuestion(idx)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="form-actions">
          <button className="form-button button-primary" type="submit">
            Create Task
          </button>
          <button
            className="form-button button-secondary"
            type="button"
            onClick={() => {
              setTaskTitle("");
              setTaskInstructions("");
              setTaskType("");
              setLessonId("");
              setQuestions([]);
              resetQuestionFields();
              setError("");
              setSuccess("");
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTaskForm;
