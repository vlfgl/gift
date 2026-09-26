from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # 1. 프론트엔드(JS)에서 보낸 데이터 읽기
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            recipient = data.get('recipient', '')
            budget = data.get('budget', '')
            interests = data.get('interests', '')

            # 2. OpenAI API 키 설정 (환경변수에서 가져옴 - 보안!)
            api_key = os.environ.get('OPENAI_API_KEY')
            if not api_key:
                raise Exception("API 키가 설정되지 않았습니다.")
            
            client = OpenAI(api_key=api_key)

            # 3. AI에게 내릴 명령(프롬프트) 작성
            prompt = f"""
            너는 센스 있는 선물 추천 전문가야.
            받는 사람: {recipient}
            예산: {budget}
            관심사 및 특징: {interests}
            
            위 정보를 바탕으로 센스 있는 선물 3가지를 추천해줘.
            각 선물마다 추천하는 이유를 1~2줄로 친절하게 설명해줘.
            HTML 형식으로 답변해줘. (예: <ul><li><strong>선물명</strong>: 이유</li></ul>)
            """

            # 4. OpenAI API 호출
            response = client.chat.completions.create(
                model="gpt-3.5-turbo", # 또는 gpt-4o-mini
                messages=[
                    {"role": "system", "content": "당신은 유용한 선물 추천 어시스턴트입니다."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            result_text = response.choices[0].message.content

            # 5. 성공적으로 결과를 프론트엔드로 반환
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"result": result_text}).encode('utf-8'))

        except Exception as e:
            # 에러 발생 시 처리 (API 오류 등)
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))