import { doc, updateDoc } from "firebase/firestore";
import Accordion from "react-bootstrap/Accordion";
import { db } from "../firebase";
import { useParams } from "react-router-dom";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import { useState } from "react";
function LessonScript({ title, script }) {
  const [text, setText] = useState(script);
  const [isEditing, setIsEditing] = useState(false);
  const { id } = useParams();
  const updateText = async (text) => {
    const lessonRef = doc(db, "english_lessons", id);
    await updateDoc(lessonRef, { text });
    setIsEditing(false);
  };

  return (
    <div className="app-accordion">
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
            defaultValue={script}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="ul-header">
            <button
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
            <button className="update-btn" onClick={() => updateText(text)}>
              Update
            </button>
          </div>
        </div>
      ) : (
        <Accordion defaultActiveKey="0" className="app-accordion">
          <Accordion.Item eventKey="0">
            <Accordion.Header> {title}</Accordion.Header>
            <Accordion.Body>{script}</Accordion.Body>
          </Accordion.Item>
        </Accordion>
      )}
    </div>
  );
}

export default LessonScript;
