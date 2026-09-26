// HTML에서 요소들 가져오기
const form = document.getElementById('gift-form');
const statusMessage = document.getElementById('status-message');
const resultArea = document.getElementById('result-area');
const resultContent = document.getElementById('result-content');
const submitBtn = document.getElementById('submit-btn');

// 폼 제출 이벤트(버튼 클릭) 감지
form.addEventListener('submit', async function(event) {
    event.preventDefault(); // 페이지가 새로고침 되는 기본 기능 막기

    // 1. 사용자 입력값 가져오기
    const recipient = document.getElementById('recipient').value;
    const budget = document.getElementById('budget').value;
    const interests = document.getElementById('interests').value;

    // 2. 로딩 상태 표시 (과제 요구사항: 지연/타임아웃 처리)
    statusMessage.classList.remove('hidden');
    resultArea.classList.add('hidden');
    submitBtn.disabled = true; // 버튼 연타 방지
    submitBtn.textContent = "추천 중...";

    try {
        // 3. 백엔드(Python)로 데이터 보내기 (fetch API 사용)
        const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient: recipient,
                budget: budget,
                interests: interests
            })
        });

        const data = await response.json();

        // 4. 결과 처리 (과제 요구사항: API 오류 처리)
        if (response.ok) {
            // 성공 시 화면에 결과 출력
            resultContent.innerHTML = data.result;
            resultArea.classList.remove('hidden');
        } else {
            // 서버 에러 발생 시
            resultContent.innerHTML = `<p style="color:red;">앗! 오류가 발생했어요. 잠시 후 다시 시도해주세요.<br>(상세: ${data.error})</p>`;
            resultArea.classList.remove('hidden');
        }

    } catch (error) {
        // 네트워크 오류 등 발생 시
        resultContent.innerHTML = `<p style="color:red;">네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.</p>`;
        resultArea.classList.remove('hidden');
    } finally {
        // 5. 로딩 상태 종료 및 버튼 원상복구
        statusMessage.classList.add('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = "선물 추천받기";
    }
});