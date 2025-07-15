import React from "react";
import "./courseCard.css";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  return (
    <Link
      key={course.id}
      className="card secondarybg"
      to={`/courses/${course.id}`}
    >
      <div className="image-container">
        <img src={course.image} alt={course.title} />
        <div>
          <h6 className="text-light">{course.title}</h6>
          <p>Price: {course.price} LD</p>
        </div>
      </div>
      <div>
        <p className="text-light">Instructor: {course.instructorName}</p>
        <p className="text-light">{course.description}</p>
      </div>
    </Link>
  );
};

export default CourseCard;
