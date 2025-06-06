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
    if (!(subject && category && difficulty)) return;

    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams({ subject, category, difficulty });
        const res = await fetch(`/api/plans/course?${params}`);
        if (!res.ok) throw new Error('추천 강좌 불러오기 실패');
        const data = await res.json();
        setAvailableCourses(data);
        setSelectedCourses([]);
      } catch (error) {
        console.error(error);
        setAvailableCourses([]);
      }
    };

    fetchRecommendations();
  }, [subject, category, difficulty]);

  const handleCheckboxChange = (course) => {
    setSelectedCourses(prev => 
      prev.some(c => c.id === course.id)
        ? prev.filter(c => c.id !== course.id)
        : [...prev, course]
    );
  };

  const handleConfirmClick = async () => {
    if (selectedCourses.length === 0) return alert('강좌를 선택하세요.');
    if (!selectedFullDate) return alert('계획 날짜가 없습니다.');

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courses_ids: selectedCourses.map(c => c.id),
          planned_date: selectedFullDate,
        }),
      });

      if (!res.ok) {
        let errorText = '추가 실패';
        try {
          const errorData = await res.json();
          errorText = errorData.error || errorText;
        } catch {
          errorText = '서버 오류 (비정상 응답)';
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

  const getPlatformLogo = (logo) => logo ? `/${logo}.png` : '/default-logo.png';

  return (
    <div className="recommendations-container">
      <div className="name">{`${subject} ❯ ${category} ❯ ${difficulty}`}</div>
      <div className="course-list">
        {availableCourses.length ? (
          availableCourses.map(course => (
            <div className="course-item" key={course.id}>
              <img src={getPlatformLogo(course.logo)} alt={`${course.logo} 로고`} className="course-logo" />
              <div className="course-info">
                <div
                  className="course-name clickable"
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
