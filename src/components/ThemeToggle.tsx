import React, { useEffect, useState } from 'react';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 초기 로드 시 다크모드 선호도 확인
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="테마 변경">
      {isDark ? '☀️ 라이트 모드' : '🌙 다크 모드'}
    </button>
  );
};
