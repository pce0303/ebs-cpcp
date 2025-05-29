import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './recommendations.css';

const Recommendations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subject, category, difficulty, selectedFullDate } = location.state || {};

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

    if (!selectedFullDate) {
      alert('계획 날짜가 없습니다.');
      return;
    }

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 세션 쿠키 전달
        body: JSON.stringify({
          courses_ids: selectedCourses.map((c) => c.id),
          planned_date: selectedFullDate,
        }),
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.error || '추가 실패';
        } catch (err) {
          console.error('JSON 파싱 실패 응답 : ', err)
          errorText = '서버 오류 (HTML 또는 비정상 응답)';
        }
        alert(errorText);
        return;
      }

      alert('투두리스트에 추가되었습니다.');
      navigate(`/plan?date=${selectedFullDate}`);
    } catch (error) {
      console.error('투두 추가 실패', error);
      alert('서버 연결 실패');
    }
  };

  // platform에 따라 로고 경로 반환
  const getPlatformLogo = (logo) => {
    if (!logo) return '/default-logo.png';
    return `/${logo}.png`;
  };

  return (
    <div className="recommendations-container">
      <div className="name">{subject} ❯ {category} ❯ {difficulty}</div>
      <div className="course-list">
      {availableCourses.length > 0 ? (
        availableCourses.map((course) => (
          <div className="course-item" key={course.id}>
            <img src={getPlatformLogo(course.logo)} alt={`${course.logo} 로고`} className="course-logo" />
            <div className="course-info">
              <div
                className="course-name"
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                onClick={() => window.open(course.link, '_blank')}
              >
                {course.name}
              </div>
              <div className="course-teacher">{course.teacher}</div>
            </div>
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
