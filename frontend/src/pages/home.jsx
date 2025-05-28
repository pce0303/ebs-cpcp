import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';
import GoogleLogo from '../google-logo.png';

const Home = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState(localStorage.getItem('userName') || null);
  const [selectedFullDate, setSelectedFullDate] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [categories, setCategories] = useState(['세부과목']);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('세부과목');
  const [activeDifficulty, setActiveDifficulty] = useState('난이도');

  // ✅ 로그인 상태 확인
  useEffect(() => {
    fetch('/auth/info', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.name) {
          setUserName(data.name);
          localStorage.setItem('userName', data.name);
        }
      })
      .catch(() => {
        setUserName(null);
        localStorage.removeItem('userName');
      });
  }, []);

  const handleLoginOrLogout = () => {
    if (userName) {
      // ✅ 로그아웃 처리
      fetch('/auth/logout', { credentials: 'include' })
        .then(res => {
          if (res.ok) {
            alert('로그아웃 되었습니다.');
            setUserName(null);
            localStorage.removeItem('userName');
          }
        });
    } else {
      // ✅ 로그인 요청
      window.location.href = '/auth';
    }
  };

  const handleDateClick = (day) => {
    setSelectedDay(day);
    const fullDateString = `${currentYear}.${String(currentMonth + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
    setSelectedFullDate(fullDateString);
  };

  const handleSubjectClick = (subject) => {
    setActiveSubject(subject);
    setActiveCategory('세부과목');
    setActiveDifficulty('난이도');
    setCategories(
      subject === '수학' ? ['확통', '미적', '기하', '수1', '수2'] :
      subject === '영어' ? ['듣기', '문법', '독해'] :
      ['독서', '문학', '언어와 매체']
    );
  };

  const handleSelectClick = () => {
    if (!userName) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (!activeSubject || activeCategory === '세부과목' || activeDifficulty === '난이도') {
      alert('과목, 세부과목, 난이도를 모두 선택해주세요.');
      return;
    }
    if (!selectedFullDate) {
      alert('날짜를 선택해주세요.');
      return;
    }
    navigate('/recommendations', {
      state: { subject: activeSubject, category: activeCategory, difficulty: activeDifficulty, selectedFullDate }
    });
  };

  const handleViewPlanClick = (e) => {
    e.preventDefault();
    navigate('/plan', { state: { selectedFullDate } });
  };

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const nextMonth = () => {
    setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear(prev => prev + 1);
    setSelectedDay(null);
    setSelectedFullDate(null);
  };
  const prevMonth = () => {
    setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear(prev => prev - 1);
    setSelectedDay(null);
    setSelectedFullDate(null);
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
                  className={`day ${day === selectedDay ? 'selected' : ''}`}
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
          {['국어', '수학', '영어'].map(subject => (
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
          <select className="custom-select" onChange={e => setActiveCategory(e.target.value)} value={activeCategory}>
            <option value="세부과목" disabled>세부과목</option>
            {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="subject-box">
          <select className="custom-select" onChange={e => setActiveDifficulty(e.target.value)} value={activeDifficulty}>
            <option value="난이도" disabled>난이도</option>
            <option value="개념">개념</option>
            <option value="심화">심화</option>
          </select>
        </div>
      </div>

      <div className="button-container">
        <div className="link">
          <button className="view-plan-link1" onClick={handleLoginOrLogout}>
            <img src={GoogleLogo} className="google_logo" alt="Google Logo" />
            {userName ? `${userName}` : '구글 로그인'}
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
