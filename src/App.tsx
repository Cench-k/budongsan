import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Summary } from './components/Summary';
import { Timeline } from './components/Timeline';
import { MapView } from './components/MapView';
import { Calculator } from './components/Calculator';
import type { AuctionData } from './data/mockData';
import './App.css';

function App() {
  const [data, setData] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctionData = async (caseNumber: string) => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8080';
      const response = await fetch(`${API_URL}/api/auction/${caseNumber}`);
      if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드 (더미 사건번호)
  useEffect(() => {
    fetchAuctionData('2023타경12345');
  }, []);

  return (
    <div className="app-container">
      <Header onSearch={fetchAuctionData} />
      
      <main className="main-content">
        {loading && <div className="status-message loading glass">데이터를 분석 중입니다...</div>}
        {error && <div className="status-message error">{error}</div>}
        
        {data && !loading && (
          <>
            <div className="desktop-grid">
              <div className="grid-left">
                <Summary data={data} />
                <div className="section-divider" />
                <MapView data={data} />
              </div>
              <div className="grid-right">
                <Timeline data={data} />
              </div>
            </div>
            <div className="spacer-for-calculator" />
          </>
        )}
      </main>

      {data && !loading && <Calculator data={data} />}
    </div>
  );
}

export default App;
