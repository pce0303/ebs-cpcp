import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './plan.css';

const DEFAULT_LOGO = '/default-logo.png';

const Plan = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 쿼리에서 date 추출
  const getQueryDate = () => new URLSearchParams(location.search).get('date');

  const selectedFullDate = getQueryDate();

  // 날짜 포맷 변환 함수 (ISO yyyy-mm-dd → yyyy.mm.dd)
  const formatDateForDisplay = (isoDate) => (isoDate ? isoDate.replace(/-/g, '.') : '');

  const localStorageKey = `completedCourses_${selectedFullDate}`;

  // localStorage에서 완료 상태 불러오기 (memoized)
  const loadCompletedStatus = useCallback(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error('localStorage parsing error:', e);
      return {};
    }
  }, [localStorageKey]);

  // localStorage에 완료 상태 저장
  const saveCompletedStatus = useCallback((statusObj) => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(statusObj));
    } catch (e) {
      console.error('localStorage save error:', e);
    }
  }, [localStorageKey]);

  const [coursesWithCompletion, setCoursesWithCompletion] = useState([]);


  useEffect(() => {
    if (!selectedFullDate) {
      setCoursesWithCompletion([]);
      return;
    }
    const fetchCourses = async () => {
      try {
        const response = await fetch(`/api/plans?date=${selectedFullDate}`);
        const data = await response.json();
        if (!Array.isArray(data)) {
          setCoursesWithCompletion([]);
          return;
        }
        const completedStatus = loadCompletedStatus();
        const updatedCourses = data.map(course => ({
          ...course,
          isCompleted: !!completedStatus[course.id],
        }));
        setCoursesWithCompletion(updatedCourses);
      } catch (error) {
        console.error("계획 불러오기 실패:", error);
        setCoursesWithCompletion([]);
      }
    };
    fetchCourses();
  }, [selectedFullDate, loadCompletedStatus]);

  // 체크박스 상태 변경 핸들러
  const handleCheckboxChange = (courseId) => {
    setCoursesWithCompletion(prevCourses => {
      const updatedCourses = prevCourses.map(course =>
        course.id === courseId ? { ...course, isCompleted: !course.isCompleted } : course
      );

      const statusObj = updatedCourses.reduce((acc, c) => {
        if (c.isCompleted) acc[c.id] = true;
        return acc;
      }, {});

      saveCompletedStatus(statusObj);

      return updatedCourses;
    });
  };

  const planTitle = selectedFullDate ? `${formatDateForDisplay(selectedFullDate)} 계획` : '나의 학습 계획';

  const handleGoHomeClick = () => {
    navigate('/');
  };

  const getPlatformLogo = (logo) => (logo ? `/${logo}.png` : DEFAULT_LOGO);

  const handleDeleteCourse = async (courseId) => {
    try {
      const response = await fetch('/api/plans', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          date: selectedFullDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('서버 삭제 실패:', errorData.error);
        return;
      }

      // 삭제 성공 시 상태에서도 제거
      setCoursesWithCompletion((prevCourses) => {
        const updatedCourses = prevCourses.filter(course => course.id !== courseId);

        const completedStatus = loadCompletedStatus();
        if (completedStatus[courseId]) {
          delete completedStatus[courseId];
          saveCompletedStatus(completedStatus);
        }

        return updatedCourses;
      });

    } catch (error) {
      console.error('삭제 요청 실패:', error);
    }
  };

  return (
    <div className="plan-container">
      <div className="name">{planTitle}</div>
      {coursesWithCompletion.length > 0 ? (
        <ul className="selected-course-list">
          {coursesWithCompletion.map(({ id, logo, title, link, isCompleted }) => (
            <li key={id} className={`selected-course-item ${isCompleted ? 'completed' : ''}`}>
              <img src={getPlatformLogo(logo)} alt={`${title} 로고`} className="course-logo" />
              <a href={link} target="_blank" rel="noopener noreferrer" className="course-title">
                {title}
              </a>
              <input
                type="checkbox"
                id={`course-completion-${id}`}
                checked={isCompleted}
                onChange={() => handleCheckboxChange(id)}
              />
              <button
                className="delete-button"
                onClick={() => handleDeleteCourse(id)}
                aria-label={`Delete course ${title}`}
              >
                삭제
              </button>
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
