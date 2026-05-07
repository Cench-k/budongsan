import React from 'react';
import type { AuctionData } from '../data/mockData';
import './Summary.css';

interface SummaryProps {
  data: AuctionData;
}

export const Summary: React.FC<SummaryProps> = ({ data }) => {
  const calculateDday = (targetDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDay = new Date(targetDate);
    const diff = dDay.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `D-${days}`;
    if (days === 0) return 'D-Day';
    return `D+${Math.abs(days)}`;
  };

  const formatPrice = (price: number) => {
    return (price / 100000000).toFixed(1) + '억';
  };

  const discountRate = Math.round((1 - data.minimumPrice / data.appraisalPrice) * 100);

  return (
    <section className="summary-section">
      <div className="image-container">
        <img src={data.imageUrl} alt="물건 전경" />
        <div className="d-day-badge">{calculateDday(data.auctionDate)}</div>
      </div>
      
      <div className="info-container">
        <div className="tags">
          <span className="badge badge-neutral">{data.type}</span>
          <span className="badge badge-neutral">{data.area}</span>
        </div>
        
        <h2 className="address">{data.address}</h2>
        
        <div className="price-info">
          <div className="price-row">
            <span className="label">감정가</span>
            <span className="value strike">{formatPrice(data.appraisalPrice)}</span>
          </div>
          <div className="price-row highlight">
            <span className="label">최저가</span>
            <div className="value-group">
              <span className="discount">{discountRate}%▼</span>
              <span className="value">{formatPrice(data.minimumPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
