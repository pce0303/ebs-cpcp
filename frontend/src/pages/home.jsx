import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const SUBJECT_CATEGORIES = {
  수학: ['확률과 통계', '미적분', '기하', '수학 I', '수학 II'],
  영어: ['듣기', '문법', '독해'],
  국어: ['독서', '문학', '언어와 매체', '화법과 작문'],
};

const DIFFICULTIES = ['개념', '심화'];

const getFormattedDate = (year, month, day) =>
  `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`;

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const Home = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState(() => localStorage.getItem('userName'));
  const [selectedDate, setSelectedDate] = useState(null); // { year, month, day } or null
  const [categories, setCategories] = useState([]);
  const [calendar, setCalendar] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('세부과목');
  const [activeDifficulty, setActiveDifficulty] = useState('난이도');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/auth/info', { credentials: 'include' });
        if (!res.ok) throw new Error('Not logged in');
        const data = await res.json();
        if (data?.name) {
          setUserName(data.name);
          localStorage.setItem('userName', data.name);
        } else {
          setUserName(null);
          localStorage.removeItem('userName');
        }
      } catch {
        setUserName(null);
        localStorage.removeItem('userName');
      }
    })();
  }, []);

  const handleLoginOrLogout = async () => {
    if (userName) {
      try {
        const res = await fetch('/auth/logout', { credentials: 'include' });
        if (res.ok) {
          alert('로그아웃 되었습니다.');
          setUserName(null);
          localStorage.removeItem('userName');
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      window.location.href = '/auth';
    }
  };

  const handleDateClick = (day) => {
    setSelectedDate({ year: calendar.year, month: calendar.month, day });
  };

  const handleSubjectClick = (subject) => {
    setActiveSubject(subject);
    setActiveCategory('세부과목');
    setActiveDifficulty('난이도');
    setCategories(SUBJECT_CATEGORIES[subject] || []);
  };

  const handleSelectClick = () => {
    if (!userName) return alert('로그인이 필요합니다.');
    if (!activeSubject || activeCategory === '세부과목' || activeDifficulty === '난이도') {
      return alert('과목, 세부과목, 난이도를 모두 선택해주세요.');
    }
    if (!selectedDate) return alert('날짜를 선택해주세요.');

    const fullDateString = getFormattedDate(selectedDate.year, selectedDate.month, selectedDate.day);

    navigate('/recommendations', {
      state: {
        subject: activeSubject,
        category: activeCategory,
        difficulty: activeDifficulty,
        selectedFullDate: fullDateString,
      },
    });
  };

  const handleViewPlanClick = (e) => {
    e.preventDefault();
    if (!selectedDate) return alert('날짜를 먼저 선택해주세요.');
    const fullDateString = getFormattedDate(selectedDate.year, selectedDate.month, selectedDate.day);
    navigate(`/plan?date=${fullDateString}`);
  };

  const nextMonth = () => {
    setCalendar(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 };
      return { year, month: month + 1 };
    });
    setSelectedDate(null);
  };

  const prevMonth = () => {
    setCalendar(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 };
      return { year, month: month - 1 };
    });
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(calendar.year, calendar.month);

  return (
    <div className="main-container">
      <div className="container1">
        <h1 className="title">학습 계획표</h1>
        <div className="calendar">
          <div className="calendar-header">
            <button className="nav-button" onClick={prevMonth}>◀</button>
            <span className="month">
              {calendar.year}. {String(calendar.month + 1).padStart(2, '0')}
            </span>
            <button className="nav-button" onClick={nextMonth}>▶</button>
          </div>
          <div className="days">
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDate?.day === day &&
                selectedDate?.month === calendar.month &&
                selectedDate?.year === calendar.year;

              return (
                <span
                  key={day}
                  className={`day ${isSelected ? 'selected' : ''}`}
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
          {Object.keys(SUBJECT_CATEGORIES).map(subject => (
            <button
              key={subject}
              className={`subject-button ${activeSubject === subject ? 'active' : ''}`}
              onClick={() => handleSubjectClick(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
        <div className="subject-box">
          <select
            className="custom-select"
            onChange={e => setActiveCategory(e.target.value)}
            value={activeCategory}
          >
            <option value="세부과목" disabled>세부과목</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="subject-box">
          <select
            className="custom-select"
            onChange={e => setActiveDifficulty(e.target.value)}
            value={activeDifficulty}
          >
            <option value="난이도" disabled>난이도</option>
            {DIFFICULTIES.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="button-container">
        <div className="link">
          <button className="view-plan-link1" onClick={handleLoginOrLogout}>
            <img src={`/google-logo.png`} className="google_logo" alt="Google Logo" />
            {userName || '구글 로그인'}
          </button>
          <button className="view-plan-link2" onClick={handleViewPlanClick}>
            내 계획 확인하러 가기 ≫
          </button>
        </div>
        <button className="select-button" onClick={handleSelectClick}>
          선택
        </button>
      </div>
    </div>
  );
};

export default Home;