import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './plan.css';

const Plan = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getQueryDate = () => {
    const params = new URLSearchParams(location.search);
    return params.get('date');
  };

  const selectedFullDate = getQueryDate();

  const [coursesWithCompletion, setCoursesWithCompletion] = useState([]);
  const [planFullDate, setPlanFullDate] = useState(null);

  const localStorageKey = `completedCourses_${selectedFullDate}`;

  const formatDateForDB = (isoDate) => {
    if (!isoDate) return null;
    return isoDate.replace(/-/g, '.');
  };

  const loadCompletedStatus = () => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
      return {};
    } catch (e) {
      console.error('localStorage parsing error:', e);
      return {};
    }
  };

  const saveCompletedStatus = (statusObj) => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(statusObj));
      console.log('localStorage saved:', statusObj);
    } catch (e) {
      console.error('localStorage save error:', e);
    }
  };

  useEffect(() => {
    if (selectedFullDate) {
      const formattedDate = formatDateForDB(selectedFullDate);
      setPlanFullDate(formattedDate);

      const fetchCourses = async () => {
        try {
          const response = await fetch(`/api/plans?date=${selectedFullDate}`);
          const data = await response.json();

          if (Array.isArray(data)) {
            const completedStatus = loadCompletedStatus();

            const updatedCourses = data.map(course => ({
              ...course,
              isCompleted: !!completedStatus[course.id]
            }));

            setCoursesWithCompletion(updatedCourses);
          } else {
            setCoursesWithCompletion([]);
          }
        } catch (error) {
          console.error("계획 불러오기 실패:", error);
          setCoursesWithCompletion([]);
        }
      };

      fetchCourses();
    } else {
      setCoursesWithCompletion([]);
    }
  }, [selectedFullDate, localStorageKey]);

  const handleCheckboxChange = (courseId) => {
    setCoursesWithCompletion(prevCourses => {
      const updatedCourses = prevCourses.map(course =>
        course.id === courseId ? { ...course, isCompleted: !course.isCompleted } : course
      );

      const statusObj = {};
      updatedCourses.forEach(c => {
        if (c.isCompleted) statusObj[c.id] = true;
      });

      saveCompletedStatus(statusObj);

      return updatedCourses;
    });
  };

  const planTitle = planFullDate ? `${planFullDate} 계획` : '나의 학습 계획';

  const handleGoHomeClick = () => {
    navigate('/');
  };

  const getPlatformLogo = (logo) => {
    if (!logo) return '/default-logo.png';
    return `/${logo}.png`;
  };

  return (
    <div className="plan-container">
      <div className="name">{planTitle}</div> 
      {coursesWithCompletion.length > 0 ? (
        <ul className="selected-course-list">
          {coursesWithCompletion.map((course) => (
            <li key={course.id} className={`selected-course-item ${course.isCompleted ? 'completed' : ''}`}>
              <img
                src={getPlatformLogo(course.logo)}
                alt={`${course.title} 로고`}
                className="course-logo"
              />
              <a href={course.link} target="_blank" rel="noopener noreferrer">
                <label htmlFor={`course-completion-${course.id}`} className="course-title">
                  {course.title}
                </label>
              </a>
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
