from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from crawler import crawl_auction_case
import uvicorn

app = FastAPI(title="AuctionFlow Crawler API")

# 프론트엔드 연동을 위한 CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 배포 환경을 위해 모든 오리진 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/auction/{court_name}/{case_number}")
async def get_auction_data(court_name: str, case_number: str):
    """
    프론트엔드에서 관할법원과 사건번호를 넘기면,
    크롤러를 통해 파싱된 데이터를 반환합니다.
    """
    data = crawl_auction_case(court_name, case_number)
    return data

if __name__ == "__main__":
    uvicorn.run("api:app", host="127.0.0.1", port=8080, reload=True)
