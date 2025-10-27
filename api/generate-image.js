// 파일 경로: /api/generate-image.js

export default async function handler(request, response) {
  // 1. POST 요청인지 확인
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. 요청 본문(body)에서 'prompt' 가져오기 (수정된 부분!)
  const { prompt } = request.body; 

  if (!prompt) {
    return response.status(400).json({ error: 'Prompt is required in the request body' });
  }

  // 3. Vercel 환경 변수에서 API 키 가져오기
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
     console.error('API key not configured in Vercel environment variables.');
     return response.status(500).json({ error: 'API key not configured' });
  }

  // 4. Google API URL (기존 코드와 동일)
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const payload = {
    instances: [{ "prompt": prompt }],
    parameters: { "sampleCount": 1 }
  };

  try {
    // 5. Vercel 서버가 Google API에 대신 요청 보내기
    const googleResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Google API 응답 데이터 읽기
    const data = await googleResponse.json();

    // Google API 응답 상태 그대로 프론트엔드로 전달
    response.status(googleResponse.status).json(data);

  } catch (error) {
    // 네트워크 오류 등 서버 자체 오류
    console.error('Error calling Google API:', error);
    response.status(500).json({ error: 'Failed to call Google API: ' + error.message });
  }
}
