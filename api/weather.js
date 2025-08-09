export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { endpoint, ...params } = req.query;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  // API 키는 Vercel 환경변수에서 가져옴
  const API_KEY = process.env.KMA_API_KEY || 'J_CGQdC8TpywhkHQvP6cQg';
  
  try {
    // 기상청 API URL 구성 - 승인된 엔드포인트 사용
    const baseUrl = 'https://apis.data.go.kr/1360000';
    
    // 승인된 엔드포인트로 매핑
    let apiPath;
    switch(endpoint) {
      case 'getUltraSrtNcst':
        // 초단기실황
        apiPath = '/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst';
        break;
      case 'getUltraSrtFcst':
        // 초단기예보
        apiPath = '/openApi/VilageFcstInfoService_2.0/getUltraSrtFcst';
        break;
      case 'getVilageFcst':
        // 단기예보
        apiPath = '/openApi/VilageFcstInfoService_2.0/getVilageFcst';
        break;
      default:
        apiPath = `/${endpoint}`;
    }
    
    // serviceKey를 인코딩하지 않고 직접 사용
    const queryParams = new URLSearchParams(params);
    queryParams.set('dataType', 'JSON');
    
    const url = `${baseUrl}${apiPath}?serviceKey=${API_KEY}&${queryParams}`;
    
    console.log('Weather API Request URL:', url.replace(API_KEY, 'API_KEY_HIDDEN'));
    
    // 기상청 API 호출
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log('Weather API Response Status:', response.status);
    console.log('Weather API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Weather API Response Length:', text.length);
    console.log('Weather API Response Sample:', text.substring(0, 500));
    
    if (!response.ok) {
      console.error('HTTP Error:', response.status, response.statusText);
      return res.status(500).json({
        error: `Weather API returned ${response.status}: ${response.statusText}`,
        details: text.substring(0, 200),
        url: url.replace(API_KEY, 'API_KEY_HIDDEN')
      });
    }
    
    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response Text Sample:', text.substring(0, 500));
      return res.status(500).json({ 
        error: 'Invalid JSON response from weather API',
        details: text.substring(0, 200),
        parseError: parseError.message
      });
    }
    
    console.log('Parsed Data Result Code:', data?.response?.header?.resultCode);
    console.log('Parsed Data Result Message:', data?.response?.header?.resultMsg);
    
    // 응답 반환
    res.status(200).json(data);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      details: error.message 
    });
  }
}