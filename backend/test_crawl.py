import requests
from bs4 import BeautifulSoup

url = "https://www.courtauction.go.kr/RetrieveRealEstDetailList.laf" # 상세 검색 라우트 임의지정
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.courtauction.go.kr/'
}

try:
    session = requests.Session()
    session.get("https://www.courtauction.go.kr/", headers=headers, timeout=5)
    
    # 검색용 파라미터 (단순 테스트용)
    data = {
        "srnID": "PNO101001",
        "jiwonNm": "서울중앙지방법원",
        "saYear": "2023",
        "saSer": "100"
    }
    res = session.post("https://www.courtauction.go.kr/RetrieveRealEstCarHvyMachineSearchList.laf", headers=headers, data=data, timeout=5)
    res.encoding = 'euc-kr'
    
    soup = BeautifulSoup(res.text, 'html.parser')
    with open("crawl_result.html", "w", encoding="utf-8") as f:
        f.write(soup.title.string + "\n" if soup.title else "No title\n")
        
        if "자동입력방지" in res.text or "보안문자" in res.text or "captcha" in res.text.lower():
            f.write("Captcha Detected!\n")
        else:
            f.write("No Captcha detected on first attempt.\n")
            
        f.write(res.text)
        
except Exception as e:
    print(f"Error: {e}")
