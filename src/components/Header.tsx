import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import './Header.css';

const COURT_LIST = [
  '서울중앙지방법원', '서울동부지방법원', '서울서부지방법원', '서울남부지방법원', '서울북부지방법원',
  '의정부지방법원', '인천지방법원', '수원지방법원', '춘천지방법원', '대전지방법원', 
  '청주지방법원', '대구지방법원', '부산지방법원', '울산지방법원', '창원지방법원', 
  '광주지방법원', '전주지방법원', '제주지방법원'
];
  onSearch: (courtName: string, caseNumber: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [court, setCourt] = useState('서울중앙지방법원');
  const [year, setYear] = useState('2023');
  const [caseNum, setCaseNum] = useState('12345');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (year.trim() && caseNum.trim() && court.trim()) {
      onSearch(court.trim(), `${year.trim()}타경${caseNum.trim()}`);
    }
  };

  return (
    <header className="app-header glass">
      <div className="header-top">
        <h1 className="logo">AuctionFlow</h1>
        <ThemeToggle />
      </div>
      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-inputs">
          <select 
            value={court}
            onChange={(e) => setCourt(e.target.value)}
            className="input-court"
          >
            {COURT_LIST.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input 
            type="number" 
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="년도"
            className="input-year"
          />
          <span className="search-label">타경</span>
          <input 
            type="number" 
            value={caseNum}
            onChange={(e) => setCaseNum(e.target.value)}
            placeholder="사건번호"
            className="input-case"
          />
        </div>
        <button type="submit">검색</button>
      </form>
    </header>
  );
};
