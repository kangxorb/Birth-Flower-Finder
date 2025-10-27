// 파일 경로: /api/generate-image.js
// Vertex AI Imagen API 엔드포인트 사용 버전

export default async function handler(request, response) {
  // 1. POST 요청인지 확인
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. 요청 본문(body)에서 'prompt' 가져오기
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

  // --- 수정된 부분: Vertex AI Imagen API 정보 ---
  const projectId = 'gen-lang-client-0886483793'; // 님의 Google Cloud 프로젝트 ID
  const region = 'us-central1'; // Vertex AI 리전 (변경 필요할 수 있음)
  const modelId = 'imagen-3.0-generate-002'; // 사용하려는 모델 ID

  const vertexApiUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${modelId}:predict`;

  const payload = {
    instances: [{ "prompt": prompt }],
    // Vertex AI Imagen 파라미터 구조는 다를 수 있습니다. 우선 기본값으로 시도합니다.
    parameters: { 
      "sampleCount": 1 
      // 필요시 추가 파라미터: "aspectRatio": "9:16", "negativePrompt": "...", etc.
    } 
  };
  // --- 여기까지 수정 ---


  try {
    // 5. Vercel 서버가 Vertex AI API에 대신 요청 보내기
    // Vertex AI는 API 키 대신 Access Token을 사용하는 것이 일반적이나,
    // API 키로도 가능한 경우가 있습니다. 우선 API 키로 시도합니다.
    const vertexResponse = await fetch(vertexApiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Vertex AI는 보통 'Authorization: Bearer <ACCESS_TOKEN>'을 요구하지만,
        // API 키 헤더도 시도해볼 수 있습니다 (작동 안 할 수도 있음).
        // 우선 헤더 없이 API 키를 URL 파라미터로만 전달해봅니다. (위 URL에 ?key= 가 있음)
        // 만약 인증 오류가 나면, Access Token 방식으로 바꿔야 합니다.
        // Google Cloud 문서를 참고하여 API 키 인증 방식을 확인해야 합니다.
         'X-Goog-Api-Key': apiKey // API 키를 헤더로 전달 시도 (선택적)
      },
      body: JSON.stringify(payload)
    });

    // Vertex AI API 응답 데이터 읽기
    const data = await vertexResponse.json();

    // Vertex AI 응답 상태 그대로 프론트엔드로 전달
    response.status(vertexResponse.status).json(data);

  } catch (error) {
    // 네트워크 오류 등 서버 자체 오류
    console.error('Error calling Vertex AI API:', error);
    response.status(500).json({ error: 'Failed to call Vertex AI API: ' + error.message });
  }
}
