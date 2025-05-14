import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './lecture.css';

const Recommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subject, category, difficulty, plannedDate } = location.state || {};
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams({ subject, category, difficulty });
        const response = await fetch(`/api/plans/course?${params}`);
        const data = await response.json();
        setAvailableCourses(data);
        setSelectedCourses([]);
      } catch (error) {
        console.error('추천 강좌 불러오기 실패', error);
      }
    };

    if (subject && category && difficulty) {
      fetchRecommendations();
    }
  }, [subject, category, difficulty]);

  const handleCheckboxChange = (course) => {
    setSelectedCourses(prev =>
      prev.find(c => c.id === course.id)
        ? prev.filter(c => c.id !== course.id)
        : [...prev, course]
    );
  };

  const handleConfirmClick = async () => {
    if (selectedCourses.length === 0) {
      alert('강좌를 선택하세요.');
      return;
    }

    if (!plannedDate) {
      alert('계획 날짜가 없습니다.');
      return;
    }

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courses_ids: selectedCourses.map(c => c.id),
          planned_date: plannedDate,
        }),
      });

      if (response.ok) {
        alert('투두리스트에 추가되었습니다.');
        navigate('/plan');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '추가 실패');
      }
    } catch (error) {
      console.error('투두 추가 실패', error);
    }
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
