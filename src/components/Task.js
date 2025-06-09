import { useState } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../frebase";
import Accordion from "react-bootstrap/Accordion";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import DeleteIcon from "@mui/icons-material/Delete";

function Task({ task }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [instructions, setInstructions] = useState(task.instructions);
  const [type, setType] = useState(task.type);

  const deleteTask = async () => {
    try {
      await deleteDoc(doc(db, "tasks", task.id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTask = async () => {
    try {
      const taskRef = doc(db, "tasks", task.id);
      await updateDoc(taskRef, {
        title,
        instructions,
        type,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="app-accordion p-2 shadow-sm m-2 rounded-3">
      <div className="ul-header">
        <h5>{task.title}</h5>
        <div>
          <BorderColorOutlinedIcon
            onClick={() => setIsEditing(true)}
            className="edit-btn me-2"
          />
          <DeleteIcon onClick={deleteTask} className="delete-btn" />
        </div>
      </div>

      {isEditing ? (
        <div className="edit-container">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="form-control"
            >
              <option value="true_false">True/False</option>
              <option value="fill_in_the_blank">Fill in the Blank</option>
              <option value="matching">Matching</option>
              <option value="short_answer">Short Answer</option>
              <option value="choose_the_best_answer">
                Choose the Best Answer
              </option>
            </select>
          </div>

          <div className="ul-header mt-3">
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className="update-btn" onClick={updateTask}>
              Update
            </button>
          </div>
        </div>
      ) : (
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Task Details</Accordion.Header>
            <Accordion.Body>
              <p>
                <strong>Type:</strong> {task.type}
              </p>
              <p>
                <strong>Instructions:</strong> {task.instructions}
              </p>
              {task.questions && (
                <div>
                  <strong>Questions:</strong>
                  {task.questions.map((question, index) => (
                    <div key={index} className="ms-3 mt-2">
                      <p>
                        Question {index + 1}: {question.text}
                      </p>
                      <p>Correct Answer: {question.correctAnswer}</p>
                      <p>Options:</p>
                      <ul>
                        {question.answers.map((answer, i) => (
                          <li key={i}>{answer}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  );
}

export default Task;
