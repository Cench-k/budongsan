export interface AuctionRegistry {
  id: string;
  date: string;
  type: string;
  creditor: string;
  amount?: number;
  isMalsoGijun: boolean;
  status: 'safe' | 'danger' | 'neutral';
}

export interface AuctionTenant {
  name: string;
  moveInDate: string;
  deposit: number;
  hasOpposingPower: boolean;
}

export interface MarketData {
  date: string;
  price: number;
}

export interface AuctionData {
  caseNumber: string;
  address: string;
  type: string;
  area: string;
  appraisalPrice: number;
  minimumPrice: number;
  auctionDate: string;
  imageUrl: string;
  registries: AuctionRegistry[];
  tenant?: AuctionTenant;
  marketTrend: MarketData[];
  lat: number;
  lng: number;
}

// 더미 데이터 생성
export const mockAuctionData: AuctionData = {
  caseNumber: '2023타경12345',
  address: '서울특별시 강남구 대치동 은마아파트 101동 1502호',
  type: '아파트',
  area: '전용 84.43㎡',
  appraisalPrice: 2400000000, // 24억
  minimumPrice: 1920000000,   // 19.2억 (1회 유찰, 80%)
  auctionDate: '2026-06-15',
  imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
  lat: 37.4988,
  lng: 127.0652,
  
  tenant: {
    name: '김**',
    moveInDate: '2020-05-12',
    deposit: 800000000,
    hasOpposingPower: true, // 대항력 있음 (말소기준권리보다 앞섬)
  },

  registries: [
    {
      id: '1',
      date: '2019-03-15',
      type: '소유권이전',
      creditor: '이**',
      isMalsoGijun: false,
      status: 'neutral',
    },
    {
      id: '2',
      date: '2021-08-20',
      type: '근저당권',
      creditor: '국민은행',
      amount: 500000000,
      isMalsoGijun: true, // 말소기준권리
      status: 'safe', // 소멸
    },
    {
      id: '3',
      date: '2022-11-05',
      type: '가압류',
      creditor: '삼성카드',
      amount: 15000000,
      isMalsoGijun: false,
      status: 'safe', // 소멸
    },
    {
      id: '4',
      date: '2023-01-10',
      type: '임의경매기입등기',
      creditor: '국민은행',
      isMalsoGijun: false,
      status: 'safe', // 소멸
    }
  ],

  marketTrend: [
    { date: '2022-01', price: 2600000000 },
    { date: '2022-07', price: 2550000000 },
    { date: '2023-01', price: 2300000000 },
    { date: '2023-07', price: 2350000000 },
    { date: '2024-01', price: 2400000000 },
  ]
};
