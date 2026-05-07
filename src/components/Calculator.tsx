import React, { useState } from 'react';
import type { AuctionData } from '../data/mockData';
import './Calculator.css';

interface CalculatorProps {
  data: AuctionData;
}

export const Calculator: React.FC<CalculatorProps> = ({ data }) => {
  const [bidPrice, setBidPrice] = useState<number>(data.minimumPrice);
  const [isExpanded, setIsExpanded] = useState(true);

  // 가정치
  const LTV = 0.7; // 대출 70%
  const TAX_RATE = 0.011; // 취등록세 1.1%
  const REPAIR_COST = 30000000; // 명도 및 수리비 3천만원
  const MARKET_PRICE = data.marketTrend[data.marketTrend.length - 1].price; // 최신 시세

  // 파생 상태 계산
  const loanAmount = bidPrice * LTV;
  const tax = bidPrice * TAX_RATE;
  const totalCost = bidPrice + tax + REPAIR_COST;
  const requiredEquity = totalCost - loanAmount; // 실투자금
  const profit = MARKET_PRICE - totalCost; // 시세차익
  const yieldRate = (profit / requiredEquity) * 100; // 기대 수익률

  const formatUnit = (value: number) => {
    return (value / 100000000).toFixed(1) + '억';
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBidPrice(Number(e.target.value));
  };

  return (
    <div className={`calculator-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="toggle-handle" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="handle-bar"></div>
      </button>

      <div className="calculator-content glass">
        <div className="calc-header">
          <h3>수익률 시뮬레이터</h3>
          <span className="market-price-ref">기준 시세: {formatUnit(MARKET_PRICE)}</span>
        </div>

        <div className="slider-container">
          <div className="slider-labels">
            <span>최저가</span>
            <span className="current-bid">입찰가: {formatUnit(bidPrice)}</span>
            <span>감정가</span>
          </div>
          <input 
            type="range" 
            min={data.minimumPrice} 
            max={data.appraisalPrice} 
            step={10000000} // 1000만원 단위
            value={bidPrice} 
            onChange={handleSliderChange}
            className="bid-slider"
          />
        </div>

        {isExpanded && (
          <div className="calc-results">
            <div className="result-row">
              <span className="label">대출 예상액 (LTV 70%)</span>
              <span className="value">{formatUnit(loanAmount)}</span>
            </div>
            <div className="result-row">
              <span className="label">취등록세 (1.1%) 외</span>
              <span className="value">{(tax / 10000000).toFixed(1)}천 + 3천(명도/수리)</span>
            </div>
            <div className="divider"></div>
            <div className="result-row highlight-equity">
              <span className="label">필요 실투자금</span>
              <span className="value">{formatUnit(requiredEquity)}</span>
            </div>
            <div className="result-row highlight-yield">
              <span className="label">기대 수익률</span>
              <div className="yield-value">
                <span className="profit">+{formatUnit(profit)}</span>
                <span className="rate">{yieldRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
