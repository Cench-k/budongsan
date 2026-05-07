import React, { useState } from 'react';
import type { AuctionData } from '../data/mockData';
import './Timeline.css';

interface TimelineProps {
  data: AuctionData;
}

export const Timeline: React.FC<TimelineProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 종합 상태 판단 (인수 권리나 대항력 있는 임차인이 있으면 danger)
  const hasDangerRegistry = data.registries.some(r => r.status === 'danger');
  const hasDangerTenant = data.tenant?.hasOpposingPower;
  const overallStatus = hasDangerRegistry || hasDangerTenant ? 'danger' : 'safe';

  return (
    <section className="timeline-section">
      <div className="section-header">
        <h2>권리 분석 요약</h2>
        <div className={`status-indicator status-${overallStatus}`}>
          <div className="status-dot"></div>
          {overallStatus === 'safe' ? '안전 (인수사항 없음)' : '위험 (인수사항 주의)'}
        </div>
      </div>

      {data.tenant && (
        <div className="tenant-card">
          <h3>임차인 현황</h3>
          <div className="tenant-info">
            <div className="tenant-row">
              <span>{data.tenant.name}</span>
              <span>전입일: {data.tenant.moveInDate}</span>
            </div>
            <div className="tenant-row">
              <span>보증금: {(data.tenant.deposit / 100000000).toFixed(1)}억</span>
              {data.tenant.hasOpposingPower ? (
                <span className="badge badge-danger">대항력 있음 (인수 주의)</span>
              ) : (
                <span className="badge badge-safe">대항력 없음</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="registry-timeline">
        <div className="timeline-header" onClick={() => setIsExpanded(!isExpanded)}>
          <h3>등기부 현황</h3>
          <button className="expand-btn">
            {isExpanded ? '접기 ▲' : '자세히 보기 ▼'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="timeline-content">
            {data.registries.map((reg, index) => (
              <div key={reg.id} className={`timeline-item ${reg.isMalsoGijun ? 'malso-gijun' : ''}`}>
                <div className="timeline-line">
                  <div className={`timeline-dot ${reg.status}`}></div>
                  {index !== data.registries.length - 1 && <div className="timeline-connector"></div>}
                </div>
                <div className="timeline-details">
                  <div className="timeline-row">
                    <span className="reg-date">{reg.date}</span>
                    <span className="reg-type">{reg.type}</span>
                  </div>
                  <div className="timeline-row">
                    <span className="reg-creditor">{reg.creditor}</span>
                    {reg.amount && <span className="reg-amount">{(reg.amount / 100000000).toFixed(1)}억</span>}
                  </div>
                  <div className="timeline-badges">
                    {reg.isMalsoGijun && <span className="badge badge-danger malso-badge">말소기준권리</span>}
                    {reg.status === 'safe' && <span className="badge badge-safe">소멸</span>}
                    {reg.status === 'danger' && <span className="badge badge-danger">인수</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
