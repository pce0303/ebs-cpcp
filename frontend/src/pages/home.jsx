import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const Home = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [categories, setCategories] = useState(['세부과목']);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('세부과목');
  const [activeDifficulty, setActiveDifficulty] = useState('난이도');

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const handleSubjectClick = (subject) => {
    setActiveSubject(subject);
    setActiveCategory('세부과목');
    setActiveDifficulty('난이도');

    if (subject === '수학') {
      setCategories(['확통', '미적', '기하', '수1', '수2']);
    } else if (subject === '영어') {
      setCategories(['듣기', '문법', '독해']);
    } else {
      setCategories(['독서', '문학', '언어와 매체']);
    }
  };

  const handleCategoryChange = (event) => {
    setActiveCategory(event.target.value);
  };

  const handleDifficultyChange = (event) => {
    setActiveDifficulty(event.target.value);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  const handleSelectClick = () => {
    if (!activeSubject || activeCategory === '세부과목' || activeDifficulty === '난이도') {
      alert('과목, 세부과목, 난이도를 모두 선택해주세요.');
      return;
    }
    navigate('/course', {
      state: {
        subject: activeSubject,
        category: activeCategory,
        difficulty: activeDifficulty
      },
    });
  };

  const handleViewPlanClick = (e) => {
    e.preventDefault();
    navigate('/plan');
  };


  return (
    <div className="main-container">
      <div className="container1">
        <h1 className="title">학습 계획표</h1>
        <div className="calendar">
          <div className="calendar-header">
            <button className="nav-button" onClick={prevMonth}>◀</button>
            <span className="month">{currentYear}. {String(currentMonth + 1).padStart(2, '0')}</span>
            <button className="nav-button" onClick={nextMonth}>▶</button>
          </div>
          <div className="days">
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              return (
                <span
                  key={day}
                  className={`day ${day === selectedDate ? 'selected' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container2">
        <div className="subject-selection">
          <button
            className={`subject-button ${activeSubject === '국어' ? 'active' : ''}`}
            onClick={() => handleSubjectClick('국어')}
          >
            국어
          </button>
          <button
            className={`subject-button ${activeSubject === '수학' ? 'active' : ''}`}
            onClick={() => handleSubjectClick('수학')}
          >
            수학
          </button>
          <button
            className={`subject-button ${activeSubject === '영어' ? 'active' : ''}`}
            onClick={() => handleSubjectClick('영어')}
          >
            영어
          </button>
        </div>
        <div className="subject-box">
          <select className="custom-select" onChange={handleCategoryChange} value={activeCategory}>
            <option disabled>세부과목</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="subject-box">
          <select className="custom-select" onChange={handleDifficultyChange} value={activeDifficulty}>
            <option disabled>난이도</option>
            <option>개념</option>
            <option>심화</option>
          </select>
        </div>
      </div>

      <div className="button-container">
        <div className="link">
          <button className="view-plan-link" onClick={handleViewPlanClick}>
            내 계획 확인하러 가기 ≫
          </button>
        </div>
        <button className="select-button" onClick={handleSelectClick}>선택</button>
      </div>
    </div>
  );
};

export default Home;
