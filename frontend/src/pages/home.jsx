import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './home.css';

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [categories, setCategories] = useState(['세부과목']);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeSubject, setActiveSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSubSubject, setSelectedSubSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [userName, setUserName] = useState(null); // 사용자 이름 상태 추가

  // 로그인된 사용자의 이름을 백엔드에서 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/info');
        setUserName(response.data.name); // 백엔드에서 받아온 사용자 이름을 설정
      } catch (error) {
        console.error('로그인 정보 가져오기 실패', error);
        setUserName(null); // 로그인되지 않은 경우
      }
    };

    fetchUserInfo();
  }, []);

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

  const handleSubjectClick = (subject) => {
    setActiveSubject(subject);
    setSelectedSubject(subject); // 추가
    if (subject === '수학') {
      setCategories(['확통', '미적', '기하', '수1', '수2']);
    } else if (subject === '영어') {
      setCategories(['듣기', '문법', '독해']);
    } else {
      setCategories(['독서', '문학', '언어와 매체']);
    }
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

  const handleSelect = async () => {
    const userEmail = 'user@example.com';

    const planData = {
      date: selectedDate,
      subject: selectedSubject,
      subSubject: selectedSubSubject,
      type: selectedDifficulty,
      email: userEmail,
    };

    try {
      const response = await axios.post('http://localhost:3000/api/plans', planData);
      console.log('Plan saved:', response.data);
      alert('계획이 등록되었습니다!');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('계획 등록에 실패하였습니다!');
    }
  };

  // 로그인 페이지로 이동
  const handleLoginRedirect = () => {
    window.location.href = 'http://localhost:3000/auth'; // 로그인 페이지로 이동
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:3000/auth/logout'); // 로그아웃 API 호출
      setUserName(null); // 사용자 이름 초기화
      alert('로그아웃 되었습니다.');
    } catch (error) {
      console.error('로그아웃 실패', error);
    }
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
          <select className="custom-select" onChange={(e) => setSelectedSubSubject(e.target.value)}>
            <option>세부과목</option>
            {categories.map((category, index) => (
              <option key={index}>{category}</option>
            ))}
          </select>
        </div>
        <div className="subject-box">
          <select className="custom-select" onChange={(e) => setSelectedDifficulty(e.target.value)}>
            <option>난이도</option>
            <option>개념</option>
            <option>심화</option>
          </select>
        </div>
      </div>

      <div className="button-container">
        <div className="link">
          <a href="/plan">내 계획 확인하러 가기 ≫</a>
        </div>
        <button className="select-button" onClick={handleSelect}>선택</button>
      </div>

      {/* 로그인된 상태에서 사용자 이름 표시 */}
      <div className="user-info">
        {userName ? (
          <>
            <p>{userName}님</p>
            <button className='auth-button' onClick={handleLogout}>로그아웃</button>
          </>
        ) : (
          <button className='auth-button' onClick={handleLoginRedirect}>로그인</button>
        )}
      </div>
    </div>
  );
};

export default Home;
