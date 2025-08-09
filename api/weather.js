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

  // API 키는 Vercel 환경변수에서 가져옴 (기상청 허브 - 승인된 키)
  const API_KEY = process.env.KMA_API_KEY || '2yP9tO3qQ4yj_bTt6mOMpg';
  
  console.log('Environment check:', {
    hasEnvKey: !!process.env.KMA_API_KEY,
    keyLength: API_KEY.length,
    keyStart: API_KEY.substring(0, 3),
    keyEnd: API_KEY.substring(API_KEY.length - 3)
  });
  
  try {
    // 파라미터 검증
    const { base_date, base_time, nx, ny } = params;
    
    console.log('Request parameters:', {
      endpoint,
      base_date,
      base_time,
      nx,
      ny,
      allParams: params
    });
    
    // 파라미터 유효성 검사
    if (!base_date || !base_time || !nx || !ny) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['base_date', 'base_time', 'nx', 'ny'],
        received: { base_date, base_time, nx, ny }
      });
    }
    
    // 날짜 형식 검증 (YYYYMMDD)
    if (!/^\d{8}$/.test(base_date)) {
      return res.status(400).json({
        error: 'Invalid base_date format. Expected YYYYMMDD',
        received: base_date
      });
    }
    
    // 시간 형식 검증 (HHMM)
    if (!/^\d{4}$/.test(base_time)) {
      return res.status(400).json({
        error: 'Invalid base_time format. Expected HHMM',
        received: base_time
      });
    }
    
    // 기상청 API 허브 URL 구성
    const baseUrl = 'https://apihub.kma.go.kr/api/typ02';
    
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
    
    // 기상청 허브는 authKey 사용 (예시 URL 확인 결과)
    const queryParams = new URLSearchParams(params);
    queryParams.set('dataType', 'JSON');
    
    const url = `${baseUrl}${apiPath}?authKey=${API_KEY}&${queryParams}`;
    
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