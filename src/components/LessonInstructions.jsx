import { doc, updateDoc } from "firebase/firestore";
import Accordion from "react-bootstrap/Accordion";
import { db } from "../firebase";
import { useParams } from "react-router-dom";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

function LessonInstructions({ title, body }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const { id } = useParams();
  const updateText = async (text) => {
    const lessonRef = doc(db, "english_lessons", id);
    await updateDoc(lessonRef, { instructions: text });
    setIsEditing(false);
  };
  useEffect(() => {
    setContent(body);
  }, [body]);
  // console.log(description, "description");
  return (
    <div className="app-accordion p-2 shadow-sm m-2 rounded-3">
      <div className="ul-header">
        <h5>{title}</h5>
        {!isEditing && (
          <BorderColorOutlinedIcon
            onClick={() => {
              setIsEditing(true);
            }}
            className="edit-btn"
          />
        )}
      </div>
      {isEditing ? (
        <div className="edit-container">
          <textarea
            className="textarea"
            defaultValue={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="ul-header">
            <button
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setContent("");
              }}
            >
              Cancel
            </button>
            <button className="update-btn" onClick={() => updateText(content)}>
              Update
            </button>
          </div>
        </div>
      ) : (
        <Accordion defaultActiveKey="0" className="app-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header> {title}</Accordion.Header>
            <Accordion.Body>
              {content || "No instructions available"}
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  );
}

export default LessonInstructions;
