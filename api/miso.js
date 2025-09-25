// Vercel Serverless Function for MISO API proxy
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 환경변수에서 MISO API 정보 가져오기
  const apiKey = process.env.MISO_API_KEY || 'app-SBhX94qR47stkIA9fhd11j6a';
  const apiEndpoint = process.env.MISO_API_ENDPOINT || 'https://api.holdings.miso.gs/ext/v1';

  if (!apiKey) {
    return res.status(500).json({ error: 'MISO API key not configured' });
  }

  try {
    console.log('Calling MISO API:', {
      endpoint: `${apiEndpoint}/chat`,
      hasApiKey: !!apiKey,
      body: req.body
    });

    const response = await fetch(`${apiEndpoint}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MISO API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: data,
        requestBody: req.body,
        endpoint: `${apiEndpoint}/chat`,
        hasApiKey: !!apiKey,
        apiKeyUsed: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
      });

      // 더 자세한 에러 메시지 반환
      return res.status(response.status).json({
        error: data.error || data.message || 'MISO API request failed',
        details: data,
        status: response.status,
        message: data.message || 'Unknown error'
      });
    }

    // MISO API 응답 처리
    // blocking 모드에서는 answer 필드에 응답이 있음
    console.log('MISO API Success:', {
      hasAnswer: !!data.answer,
      hasMessage: !!data.message,
      conversationId: data.conversation_id
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}