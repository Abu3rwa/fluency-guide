import React, { useState } from "react";
import { db } from "../frebase";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";

const CreateQuizForm = ({ lessonId }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const lessonRef = doc(
        db,
        "courses",
        "Ui9e7V2wgtKZLawHBQSu",
        "lessons",
        lessonId
      );
      await updateDoc(lessonRef, {
        quiz: {
          questions: arrayUnion({
            question,
            answer,
            options: [option1, option2, option3, option4],
          }),
        },
      });
      alert("Quiz added successfully!");
      // Reset form fields
      setQuestion("");
      setAnswer("");
      setOption1("");
      setOption2("");
      setOption3("");
      setOption4("");
    } catch (error) {
      console.error("Error adding quiz: ", error);
      alert("Failed to add quiz. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-quiz">
      <div className="group">
        <label>Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>
      <div className="group">
        <label>Answer</label>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
        />
      </div>
      <div className="group">
        <label>Option 1</label>
        <input
          type="text"
          value={option1}
          onChange={(e) => setOption1(e.target.value)}
          required
        />
      </div>
      <div className="group">
        <label>Option 2</label>
        <input
          type="text"
          value={option2}
          onChange={(e) => setOption2(e.target.value)}
          required
        />
      </div>
      <div className="group">
        <label>Option 3</label>
        <input
          type="text"
          value={option3}
          onChange={(e) => setOption3(e.target.value)}
          required
        />
      </div>
      <div className="group">
        <label>Option 4</label>
        <input
          type="text"
          value={option4}
          onChange={(e) => setOption4(e.target.value)}
          required
        />
      </div>
      <button type="submit">Add Quiz</button>
    </form>
  );
};

export default CreateQuizForm;
