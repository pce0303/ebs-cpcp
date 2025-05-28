import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // useNavigate를 임포트합니다.
import './plan.css';

const Plan = () => {
  const location = useLocation();
  const navigate = useNavigate(); 

  const { selectedCourses: initialSelectedCourses = [], selectedDateFull } = location.state || {};

  const [coursesWithCompletion, setCoursesWithCompletion] = useState(
    initialSelectedCourses.map(course => ({ ...course, isCompleted: false }))
  );

  const [planFullDate, setPlanFullDate] = useState(null);

  useEffect(() => {
    if (selectedDateFull) {
      setPlanFullDate(selectedDateFull);
    } else {
      setPlanFullDate(null);
    }
  }, [selectedDateFull]); 


  const handleCheckboxChange = (courseId) => {
    setCoursesWithCompletion(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, isCompleted: !course.isCompleted } : course
      )
    );
  };

  const planTitle = planFullDate ? `${planFullDate} 계획` : '나의 학습 계획';

  const handleGoHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="plan-container">
      <div class="name">{planTitle}</div> 
      {coursesWithCompletion.length > 0 ? (
        <ul className="selected-course-list">
          {coursesWithCompletion.map((course) => (
            <li key={course.id} className={`selected-course-item ${course.isCompleted ? 'completed' : ''}`}>
              <img src={course.logo} alt="로고" className="course-logo" />
              <label htmlFor={`course-completion-${course.id}`} className="course-title">
                {course.title}
              </label>
              <input
                type="checkbox"
                id={`course-completion-${course.id}`}
                checked={course.isCompleted}
                onChange={() => handleCheckboxChange(course.id)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>선택된 강좌가 없습니다.</p>
      )}

      <button onClick={handleGoHomeClick} className="go-home-button">
        다른 계획 세우러가기≫
      </button>
    </div>
  );
};
export default Plan;
