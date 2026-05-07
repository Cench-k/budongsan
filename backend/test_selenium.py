import sys
import os

# 현재 폴더를 시스템 패스에 추가
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from crawler import crawl_auction_case

if __name__ == "__main__":
    result = crawl_auction_case("2023타경1234")
    print("크롤링 결과 타입:", type(result))
    print("사건 번호:", result.get("caseNumber"))
    print("감정가:", result.get("appraisalPrice"))
