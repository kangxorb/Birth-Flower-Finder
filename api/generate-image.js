// 파일 경로: /api/generate-image.js

export default async function handler(request, response) {
  // 1. 프론트엔드에서 보낸 'prompt' 받기
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  let prompt;
  try {
    const body = await request.json();
    prompt = body.prompt;
    if (!prompt) {
      throw new Error('Prompt is required');
    }
  } catch (e) {
    return response.status(400).json({ error: 'Invalid request body: ' + e.message });
  }

  // 2. Vercel 환경 변수에서 API 키 안전하게 가져오기
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
     return response.status(500).json({ error: 'API key not configured' });
  }

  // 3. (주의!) 기존 코드의 API URL 사용 (작동 여부는 Google Cloud 설정에 따라 다름)
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const payload = {
    instances: [{ "prompt": prompt }],
    parameters: { "sampleCount": 1 }
  };

  try {
    // 4. Vercel 서버가 Google API에 대신 요청 보내기
    const googleResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Google API 응답 그대로 프론트엔드로 전달 (성공/오류 포함)
    const data = await googleResponse.json();
    response.status(googleResponse.status).json(data);

  } catch (error) {
    // 네트워크 오류 등 서버 자체 오류
    console.error('Error calling Google API:', error);
    response.status(500).json({ error: 'Failed to call Google API: ' + error.message });
  }
}
