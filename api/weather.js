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
    
    // serviceKey를 별도로 처리 (인코딩 문제 방지)
    const serviceKey = encodeURIComponent(API_KEY);
    const queryParams = new URLSearchParams(params);
    queryParams.set('dataType', 'JSON');
    
    const url = `${baseUrl}/${endpoint}?serviceKey=${serviceKey}&${queryParams}`;
    
    console.log('Weather API Request URL:', url);
    
    // 기상청 API 호출
    const response = await fetch(url);
    const text = await response.text();
    
    console.log('Weather API Response Status:', response.status);
    console.log('Weather API Response:', text.substring(0, 200) + '...');
    
    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response Text:', text);
      return res.status(500).json({ 
        error: 'Invalid JSON response from weather API',
        details: text.substring(0, 200)
      });
    }
    
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