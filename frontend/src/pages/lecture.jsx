import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './lecture.css';
import EBS from '../ebsi.png'; 
import MEGA from '../megastudy.jpg'; 

const Recommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subject, category, difficulty } = location.state || {};
  const [availableCourses, setAvailableCourses] = useState([]); 
  const [selectedCourses, setSelectedCourses] = useState([]);


  const allCourses = [
    { id: 1, title: '[2023 수능특강] 윤혜정의 독서', logo: EBS, subject: '국어', category: '독서', difficulty: '개념' },
    { id: 2, title: '[2023 수능특강] 강민철의 독서', logo: MEGA, subject: '국어', category: '독서', difficulty: '개념' },
    { id: 3, title: '[2023 수능특강] 윤혜정의 독서', logo: EBS, subject: '국어', category: '독서', difficulty: '심화' },
    { id: 4, title: '[2023 수능특강] 윤혜정의 문학', logo: EBS, subject: '국어', category: '문학', difficulty: '개념' },
    { id: 5, title: '[2023 수능특강] 윤혜정의문학', logo: EBS, subject: '국어', category: '문학', difficulty: '심화' },
    { id: 6, title: '[2023 수능특강] 정승제의 수1',  logo: EBS, subject: '수학', category: '수1', difficulty: '개념' },
    { id: 7, title: '[2023 수능특강] 정승제의 미적분', logo: EBS, subject: '수학', category: '미적분', difficulty: '개념' },
    { id: 8, title: '[2023 수능특강] 조정식의 문법', logo: MEGA, subject: '영어', category: '문법', difficulty: '심화' },
  ];

  useEffect(() => {
    const filteredCourses = allCourses.filter(course =>
      course.subject === subject &&
      course.category === category &&
      course.difficulty === difficulty
    );
    setAvailableCourses(filteredCourses); 
    setSelectedCourses([]); 
  }, [subject, category, difficulty]);

  const handleCheckboxChange = (course) => {
    setSelectedCourses(prevSelectedCourses => {
      const isSelected = prevSelectedCourses.find(c => c.id === course.id);

      if (isSelected) {
        return prevSelectedCourses.filter(c => c.id !== course.id);
      } else {
        return [...prevSelectedCourses, course];
      }
    });
  };

  const handleConfirmClick = () => {
    navigate('/plan', { state: { selectedCourses: selectedCourses } });
  };

  return (
    <div className="recommendations-container">
      <div className="name">{subject} ❯ {category} ❯ {difficulty}</div>
      <div className="course-list">
        {availableCourses.length > 0 ? (
          availableCourses.map((course) => (
            <div className="course-item" key={course.id}>
              <img src={course.logo} alt="로고" className="course-logo" />
              <label htmlFor={`course-${course.id}`}>{course.title}</label>
              <input
                type="checkbox"
                id={`course-${course.id}`}
                checked={selectedCourses.some(c => c.id === course.id)}
                onChange={() => handleCheckboxChange(course)}
              />
            </div>
          ))
        ) : (
          <p>추천 강좌가 없습니다.</p>
        )}
      </div>
      <button className="confirm-button" onClick={handleConfirmClick}>선택</button>
    </div>
  );
};

export default Recommendations;
