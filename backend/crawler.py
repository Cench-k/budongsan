import os
import time
import requests
from bs4 import BeautifulSoup
import logging
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# [Phase 2] 환경변수 등에서 API 키를 관리하는 구조
KAKAO_REST_API_KEY = os.environ.get("KAKAO_REST_API_KEY", "")
MOLIT_OPEN_API_KEY = os.environ.get("MOLIT_OPEN_API_KEY", "")

def geocode_address(address: str):
    """
    카카오 로컬 API를 사용하여 지번/도로명 주소를 위도/경도로 변환합니다.
    """
    if not KAKAO_REST_API_KEY or KAKAO_REST_API_KEY.startswith("YOUR_"):
        logger.warning("카카오 REST API 키가 설정되지 않아 임의의 위경도를 반환합니다.")
        return {"lat": 37.5042, "lng": 127.0373}

    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"}
    params = {"query": address}
    try:
        res = requests.get(url, headers=headers, params=params, timeout=5)
        if res.status_code == 200:
            docs = res.json().get("documents", [])
            if docs:
                return {"lat": float(docs[0]["y"]), "lng": float(docs[0]["x"])}
    except Exception as e:
        logger.error(f"Geocoding 오류: {e}")
    return {"lat": 37.5042, "lng": 127.0373} # Fallback

def fetch_real_transaction_data(lawd_cd: str, deal_ymd: str):
    """
    국토교통부 아파트매매 실거래 상세 자료 API를 호출합니다.
    lawd_cd: 지역코드(법정동), deal_ymd: 계약월(YYYYMM)
    """
    if not MOLIT_OPEN_API_KEY or MOLIT_OPEN_API_KEY.startswith("YOUR_"):
        logger.warning("국토교통부 API 키가 설정되지 않아 더미 시세를 반환합니다.")
        # Fallback dummy data
        return None

    url = "http://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev"
    params = {
        "serviceKey": MOLIT_OPEN_API_KEY,
        "LAWD_CD": lawd_cd,
        "DEAL_YMD": deal_ymd,
        "numOfRows": "10",
        "pageNo": "1"
    }
    try:
        res = requests.get(url, params=params, timeout=5)
        xml_text = res.text
        
        # 403 Forbidden 등 에러 발생 시 가짜 XML로 테스트 진행 (키 활성화 대기용)
        if res.status_code != 200 or "Forbidden" in xml_text or "SERVICE ERROR" in xml_text:
            logger.warning("API 인증 에러 또는 오류 응답 발생. 테스트용 Mock XML을 반환합니다.")
            xml_text = """<response><body><items>
                <item><거래금액> 260,000</거래금액><년>2022</년><월>1</월></item>
                <item><거래금액> 255,000</거래금액><년>2022</년><월>7</월></item>
                <item><거래금액> 230,000</거래금액><년>2023</년><월>1</월></item>
                <item><거래금액> 235,000</거래금액><년>2023</년><월>7</월></item>
                <item><거래금액> 240,000</거래금액><년>2024</년><월>1</월></item>
            </items></body></response>"""
        
        # BeautifulSoup을 이용한 XML 파싱
        soup = BeautifulSoup(xml_text, 'lxml-xml') # lxml-xml 파서 권장. 안될경우 html.parser 사용
        if not soup.find('item'):
            soup = BeautifulSoup(xml_text, 'html.parser')
            
        items = soup.find_all('item')
        market_trend = []
        for item in items:
            price_str = item.find('거래금액').text.strip().replace(',', '')
            year = item.find('년').text.strip()
            month = item.find('월').text.strip().zfill(2)
            
            # 거래금액 단위 변환 (만원 -> 원)
            price = int(price_str) * 10000
            date_str = f"{year}-{month}"
            market_trend.append({"date": date_str, "price": price})
            
        # 프론트엔드 차트는 날짜 오름차순을 기대하므로 정렬
        market_trend.sort(key=lambda x: x['date'])
        return market_trend
        
    except Exception as e:
        logger.error(f"실거래가 API 파싱/통신 오류: {e}")
        return []

def get_selenium_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    options.add_argument('--disable-blink-features=AutomationControlled')
    # 브라우저 자동화 탐지 방지
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    # Javascript navigator.webdriver 우회
    driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
        "source": """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            })
        """
    })
    return driver

def crawl_auction_case(case_number: str):
    """
    사건번호를 입력받아 대법원 경매정보를 크롤링하거나, 
    정제된 JSON 구조로 변환하여 반환하는 핵심 로직입니다.
    """
    logger.info(f"[{case_number}] Selenium 대법원 경매정보 크롤링 시도...")

    # Phase 3: 프론트엔드 연동 및 시뮬레이션용 동적 주소 매핑 (Fallback)
    address = "서울특별시 강남구 삼성동 1-1"
    lawd_cd = "11680" # 강남구
    
    if "2" in case_number:
        address = "서울특별시 서초구 서초동 1303-22"
        lawd_cd = "11650" # 서초구
    elif "3" in case_number:
        address = "서울특별시 송파구 잠실동 40"
        lawd_cd = "11710" # 송파구
        
    base_price = 1500000000
    if "아파트" in case_number or "2023" in case_number:
        base_price = 2400000000
    
    # 카카오 API를 통해 위경도 변환
    coords = geocode_address(address)
    
    # 국토부 API를 통해 실거래가 동향 획득 시도
    real_data = fetch_real_transaction_data(lawd_cd, "202401")
    
    if real_data and len(real_data) > 0:
        market_trend = real_data
    else:
        # API 및 파서 실패 시 Fallback
        market_trend = [
            { "date": "2022-01", "price": base_price + 200000000 },
            { "date": "2022-07", "price": base_price + 150000000 },
            { "date": "2023-01", "price": base_price - 100000000 },
            { "date": "2023-07", "price": base_price - 50000000 },
            { "date": "2024-01", "price": base_price },
        ]

    # 기본 응답 구조 (크롤링 실패 또는 캡차 시 반환할 Mock 데이터)
    auction_data = {
        "caseNumber": case_number,
        "address": address,
        "type": "아파트",
        "area": "전용 84.43㎡",
        "appraisalPrice": base_price,
        "minimumPrice": int(base_price * 0.8),
        "auctionDate": "2026-06-15",
        "imageUrl": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80",
        "lat": coords["lat"],
        "lng": coords["lng"],
        "tenant": {
            "name": "이임차",
            "moveInDate": "2021-01-10",
            "deposit": 500000000,
            "hasOpposingPower": True
        },
        "registries": [
            {
                "id": "1",
                "date": "2019-03-15",
                "type": "소유권이전",
                "creditor": "김소유",
                "isMalsoGijun": False,
                "status": "neutral"
            },
            {
                "id": "2",
                "date": "2022-08-20",
                "type": "근저당권",
                "creditor": "우리은행",
                "amount": 700000000,
                "isMalsoGijun": True, # 말소기준권리
                "status": "safe"
            },
            {
                "id": "3",
                "date": "2023-11-05",
                "type": "가압류",
                "creditor": "삼성카드",
                "amount": 25000000,
                "isMalsoGijun": False,
                "status": "safe"
            }
        ],
        "marketTrend": market_trend
    }

    driver = None
    try:
        # Selenium WebDriver 실행
        driver = get_selenium_driver()
        driver.get("https://www.courtauction.go.kr/")
        
        # 페이지 로딩 대기
        time.sleep(1.5)
        
        page_source = driver.page_source
        
        # 캡차 확인
        if "자동입력방지" in page_source or "captcha" in page_source.lower() or "시스템 오류 안내" in page_source:
            logger.warning("대법원 접속 중 캡차 또는 봇 차단 발생! Mock 데이터를 반환합니다.")
            return auction_data
            
        logger.info("대법원 사이트 접속 우회 성공!")
        # TODO: 실제 사이트 구조에 맞춰 indexFrame 진입 후 폼 검색, 결과 DOM 파싱을 구현.
        # driver.switch_to.frame("indexFrame")
        # search_btn = driver.find_element(By.XPATH, "...")
        # search_btn.click()
        # html = driver.page_source
        # soup = BeautifulSoup(html, 'lxml')
        # 추출한 데이터를 auction_data에 업데이트
        
    except Exception as e:
        logger.error(f"Selenium 크롤링 중 오류 발생: {e}")
    finally:
        if driver:
            driver.quit()
    
    return auction_data
