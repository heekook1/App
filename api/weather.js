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
    // 기상청 API URL 구성
    const baseUrl = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
    const queryParams = new URLSearchParams({
      serviceKey: API_KEY,
      ...params,
      dataType: 'JSON'
    });
    
    const url = `${baseUrl}/${endpoint}?${queryParams}`;
    
    // 기상청 API 호출
    const response = await fetch(url);
    const data = await response.json();
    
    // 응답 반환
    res.status(200).json(data);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}