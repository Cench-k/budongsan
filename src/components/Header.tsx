import React, { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import './Header.css';

interface HeaderProps {
  onSearch: (caseNumber: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [year, setYear] = useState('2023');
  const [caseNum, setCaseNum] = useState('12345');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (year.trim() && caseNum.trim()) {
      onSearch(`${year.trim()}타경${caseNum.trim()}`);
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
