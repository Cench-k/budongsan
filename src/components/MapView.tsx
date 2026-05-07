import React, { useEffect, useRef, useState } from 'react';
import type { AuctionData } from '../data/mockData';
import './MapView.css';

declare global {
  interface Window {
    kakao: any;
  }
}

interface MapViewProps {
  data: AuctionData;
}

export const MapView: React.FC<MapViewProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let retryCount = 0;
    
    const initMap = () => {
      if (!mapRef.current) return;
      
      // 카카오 스크립트 동적 로드 (환경변수 이용)
      if (!window.kakao || !window.kakao.maps) {
        const scriptId = 'kakao-map-script';
        if (!document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.id = scriptId;
          const apiKey = '5fedabdd83da79958bd023d954af1f28';
          console.log("Kakao Map API Key being used:", apiKey);
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
          document.head.appendChild(script);
        }
        
        if (retryCount < 20) {
          retryCount++;
          setTimeout(initMap, 300); // 300ms 후 재시도
          return;
        }
        setMapError("카카오맵 로드 실패: 카카오 디벨로퍼스(Web 플랫폼)에 localhost:5173 주소가 등록되었는지, 또는 광고 차단기가 켜져 있는지 확인해주세요.");
        return;
      }

    // 카카오맵 로드 완료 후 실행
    window.kakao.maps.load(() => {
      try {
        const options = {
          center: new window.kakao.maps.LatLng(data.lat, data.lng),
          level: 3,
        };
        const map = new window.kakao.maps.Map(mapRef.current, options);
        
        const markerPosition = new window.kakao.maps.LatLng(data.lat, data.lng);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);
        setMapError(null);
      } catch (e) {
        setMapError("지도 초기화 중 오류가 발생했습니다.");
      }
    });
    }; // initMap 함수 종료
    
    initMap();
  }, [data.lat, data.lng]);

  return (
    <section className="map-section">
      <div className="section-header">
        <h2>위치 및 시세</h2>
      </div>
      
      <div className="map-container" ref={mapRef}>
        {mapError && (
          <div className="dummy-map">
            <div className="dummy-map-content">
              <span className="map-icon">🗺️</span>
              <p>{mapError}</p>
              <p className="map-coords">좌표: ({data.lat}, {data.lng})</p>
            </div>
          </div>
        )}
      </div>

      {/* 시세 차트는 당분간 숨김 처리 (사용자 요청) */}
      {/* 
      <div className="market-trend">
        <h3>최근 3년 실거래가 추이</h3>
        ...
      </div>
      */}
    </section>
  );
};
