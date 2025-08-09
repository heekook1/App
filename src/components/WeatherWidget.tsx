import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Thermometer, CloudDrizzle } from 'lucide-react';

interface WeatherData {
  temperature: string;
  maxTemp?: string;
  minTemp?: string;
  skyStatus: string;
  humidity: string;
  windSpeed: string;
  windDirection: string;
  precipitation: string;
  precipitationType: string;
  precipitationProbability?: string;
  visibility?: string;
  updateTime?: string;
  forecast?: Array<{
    time: string;
    temperature: string;
    skyStatus: string;
    precipitationType: string;
    precipitationProbability: string;
  }>;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 서울시 격자 좌표 (공식 기상청 API에서 널리 사용되는 좌표)
  const nx = 55;
  const ny = 127;

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 날씨 아이콘 결정
  const getWeatherIcon = (skyStatus: string, precipitationType: string) => {
    // 강수형태 우선 체크
    switch (precipitationType) {
      case '1': // 비
        return <CloudRain className="w-16 h-16 text-blue-500" />;
      case '2': // 비/눈
        return <CloudDrizzle className="w-16 h-16 text-blue-400" />;
      case '3': // 눈
        return <CloudSnow className="w-16 h-16 text-blue-300" />;
      case '4': // 소나기
        return <CloudDrizzle className="w-16 h-16 text-blue-600" />;
      case '5': // 빗방울
        return <CloudRain className="w-16 h-16 text-blue-400" />;
      case '6': // 빗방울/눈날림
        return <CloudDrizzle className="w-16 h-16 text-blue-300" />;
      case '7': // 눈날림
        return <CloudSnow className="w-16 h-16 text-gray-400" />;
      default: // 강수 없음
        switch (skyStatus) {
          case '1': // 맑음
            return <Sun className="w-16 h-16 text-yellow-500" />;
          case '3': // 구름많음
            return <Cloud className="w-16 h-16 text-gray-400" />;
          case '4': // 흐림
            return <Cloud className="w-16 h-16 text-gray-600" />;
          default:
            return <Sun className="w-16 h-16 text-yellow-500" />;
        }
    }
  };

  // 하늘 상태 텍스트
  const getSkyStatusText = (code: string) => {
    const statusMap: { [key: string]: string } = {
      '1': '맑음',
      '3': '구름많음',
      '4': '흐림'
    };
    return statusMap[code] || '맑음';
  };

  // 강수형태 텍스트
  const getPrecipitationTypeText = (code: string) => {
    const typeMap: { [key: string]: string } = {
      '0': '없음',
      '1': '비',
      '2': '비/눈',
      '3': '눈',
      '4': '소나기',
      '5': '빗방울',
      '6': '빗방울/눈날림',
      '7': '눈날림'
    };
    return typeMap[code] || '없음';
  };

  // 풍향 텍스트 변환
  const getWindDirectionText = (deg: string) => {
    const degree = parseInt(deg);
    const directions = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
    const index = Math.round((degree % 360) / 22.5);
    return directions[index] || '북';
  };

  // 날씨 데이터 가져오기
  const fetchWeather = async () => {
    try {
      // 한국 시간 기준으로 현재 시간 계산 (UTC+9)
      const now = new Date();
      const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const baseDate = koreaTime.toISOString().slice(0, 10).replace(/-/g, '');
      
      console.log('현재 한국 시간:', koreaTime);
      console.log('baseDate:', baseDate);
      
      // 초단기실황은 매시 40분 이후 발표, 10분마다 업데이트 (한국 시간 기준)
      const currentMinutes = koreaTime.getUTCMinutes();
      const currentHour = koreaTime.getUTCHours();
      let ncstBaseTime: string;
      let ncstBaseDate = baseDate;
      
      // 초단기실황 base_time 계산: 매시 40분 이후에 해당 시간 데이터 제공
      if (currentMinutes >= 40) {
        // 40분 이후라면 현재 시간 사용
        ncstBaseTime = currentHour.toString().padStart(2, '0') + '00';
      } else {
        // 40분 이전이라면 1시간 전 데이터 사용
        let prevHour = currentHour - 1;
        if (prevHour < 0) {
          prevHour = 23;
          // 날짜가 바뀐 경우 baseDate도 조정
          const prevDay = new Date(koreaTime.getTime() - (24 * 60 * 60 * 1000));
          ncstBaseDate = prevDay.toISOString().slice(0, 10).replace(/-/g, '');
        }
        ncstBaseTime = prevHour.toString().padStart(2, '0') + '00';
      }
      
      console.log('ncstBaseTime:', ncstBaseTime);
      console.log('ncstBaseDate:', ncstBaseDate);
      
      // 단기예보 base_time 계산 (한국 시간 기준)
      const vilageResult = getVilageBaseTime(koreaTime);
      const vilageBaseTime = vilageResult.baseTime;
      const vilageBaseDate = vilageResult.baseDate;
      
      console.log('vilageBaseTime:', vilageBaseTime);
      console.log('vilageBaseDate:', vilageBaseDate);
      
      // 초단기실황 (현재 날씨) - 서울 좌표 사용
      const ncstUrl = `/api/weather?endpoint=getUltraSrtNcst&numOfRows=10&pageNo=1&base_date=${ncstBaseDate}&base_time=${ncstBaseTime}&nx=${nx}&ny=${ny}`;
      
      // 단기예보 (최고/최저 기온 및 시간별 예보) - 서울 좌표 사용
      const vilageUrl = `/api/weather?endpoint=getVilageFcst&numOfRows=300&pageNo=1&base_date=${vilageBaseDate}&base_time=${vilageBaseTime}&nx=${nx}&ny=${ny}`;

      console.log('API 요청 URL:', { ncstUrl, vilageUrl });
      console.log('요청 파라미터:', { baseDate, ncstBaseTime, vilageBaseTime, nx, ny });

      // 두 API 동시 호출
      const [ncstResponse, vilageResponse] = await Promise.all([
        fetch(ncstUrl),
        fetch(vilageUrl)
      ]);

      const ncstData = await ncstResponse.json();
      const vilageData = await vilageResponse.json();

      console.log('초단기실황 응답:', JSON.stringify(ncstData, null, 2));
      console.log('단기예보 응답:', JSON.stringify(vilageData, null, 2));

      // 에러 응답 체크
      if (ncstData.error || vilageData.error) {
        throw new Error(ncstData.error || vilageData.error || 'API 오류');
      }

      if (ncstData.response?.header?.resultCode === '00' && vilageData.response?.header?.resultCode === '00') {
        const ncstItems = ncstData.response.body.items.item;
        const vilageItems = vilageData.response.body.items.item;
        
        const weatherData: Partial<WeatherData> = {
          updateTime: ncstBaseTime.slice(0, 2) + ':' + ncstBaseTime.slice(2),
          precipitation: '0',
          precipitationType: '0',
          skyStatus: '1'
        };

        // 초단기실황 데이터 파싱 (실시간 현재 날씨)
        ncstItems.forEach((item: any) => {
          switch (item.category) {
            case 'T1H': // 기온
              weatherData.temperature = item.obsrValue;
              break;
            case 'RN1': // 1시간 강수량
              weatherData.precipitation = item.obsrValue === '강수없음' ? '0' : item.obsrValue;
              break;
            case 'REH': // 습도
              weatherData.humidity = item.obsrValue;
              break;
            case 'PTY': // 강수형태
              weatherData.precipitationType = item.obsrValue;
              break;
            case 'VEC': // 풍향
              weatherData.windDirection = item.obsrValue;
              break;
            case 'WSD': // 풍속
              weatherData.windSpeed = item.obsrValue;
              break;
          }
        });

        // 단기예보에서 하늘상태와 최고/최저 기온 가져오기
        const todayItems = vilageItems.filter((item: any) => item.fcstDate === baseDate || item.fcstDate === vilageBaseDate);
        
        // 현재 시간과 가장 가까운 하늘상태 가져오기
        const currentHour = koreaTime.getUTCHours();
        const currentTimeStr = currentHour.toString().padStart(2, '0') + '00';
        let skyItem = todayItems.find((item: any) => item.category === 'SKY' && item.fcstTime === currentTimeStr);
        
        // 정확한 시간의 데이터가 없으면 가장 가까운 시간의 데이터 사용
        if (!skyItem) {
          skyItem = todayItems.find((item: any) => item.category === 'SKY');
        }
        
        if (skyItem) {
          weatherData.skyStatus = skyItem.fcstValue;
        }
        
        // 최고/최저 기온 가져오기
        todayItems.forEach((item: any) => {
          if (item.category === 'TMX') {
            weatherData.maxTemp = item.fcstValue;
          } else if (item.category === 'TMN') {
            weatherData.minTemp = item.fcstValue;
          }
        });

        // 시간별 예보 (향후 6시간)
        const forecast: any[] = [];
        const forecastHours = [1, 2, 3, 4, 5, 6];
        
        forecastHours.forEach(hour => {
          const fcstTime = new Date(now);
          fcstTime.setHours(fcstTime.getHours() + hour);
          const fcstTimeStr = fcstTime.getHours().toString().padStart(2, '0') + '00';
          const fcstDateStr = fcstTime.toISOString().slice(0, 10).replace(/-/g, '');
          
          const hourData: any = {
            time: fcstTime.getHours().toString().padStart(2, '0') + ':00'
          };
          
          vilageItems.forEach((item: any) => {
            if (item.fcstDate === fcstDateStr && item.fcstTime === fcstTimeStr) {
              switch (item.category) {
                case 'TMP':
                  hourData.temperature = item.fcstValue;
                  break;
                case 'SKY':
                  hourData.skyStatus = item.fcstValue;
                  break;
                case 'PTY':
                  hourData.precipitationType = item.fcstValue;
                  break;
                case 'POP':
                  hourData.precipitationProbability = item.fcstValue;
                  break;
              }
            }
          });
          
          if (hourData.temperature) {
            forecast.push(hourData);
          }
        });

        weatherData.forecast = forecast;
        setWeather(weatherData as WeatherData);
      } else {
        console.error('API 응답 오류:', {
          ncstResult: ncstData.response?.header?.resultCode,
          ncstMsg: ncstData.response?.header?.resultMsg,
          vilageResult: vilageData.response?.header?.resultCode,
          vilageMsg: vilageData.response?.header?.resultMsg
        });
        setError(`날씨 데이터를 가져올 수 없습니다: ${ncstData.response?.header?.resultMsg || vilageData.response?.header?.resultMsg || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('날씨 데이터 가져오기 실패:', err);
      setError('날씨 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 단기예보 base_time 계산
  const getVilageBaseTime = (date: Date) => {
    const hour = date.getUTCHours(); // UTC 시간 사용 (이미 한국 시간으로 조정된 date)
    const minute = date.getUTCMinutes();
    
    // 단기예보는 02, 05, 08, 11, 14, 17, 20, 23시에 발표 (각 기준시간 + 10분 후)
    const baseTimes = ['0200', '0500', '0800', '1100', '1400', '1700', '2000', '2300'];
    const currentTime = hour * 100 + minute;
    
    let selectedBaseTime = '2300'; // 기본값: 전날 23시
    let baseDate = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 발표 시간은 기준 시간 + 10분 후부터 사용 가능
    for (let i = baseTimes.length - 1; i >= 0; i--) {
      const baseTimeNum = parseInt(baseTimes[i]);
      if (currentTime >= baseTimeNum + 10) {
        selectedBaseTime = baseTimes[i];
        break;
      }
    }
    
    // 새벽 시간대(02:10 이전)는 전날 23시 데이터 사용
    if (selectedBaseTime === '2300' && currentTime < 210) {
      const prevDay = new Date(date.getTime() - (24 * 60 * 60 * 1000));
      baseDate = prevDay.toISOString().slice(0, 10).replace(/-/g, '');
    }
    
    return {
      baseTime: selectedBaseTime,
      baseDate: baseDate
    };
  };

  useEffect(() => {
    fetchWeather();
    // 30분마다 날씨 정보 업데이트
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${weekDay})`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-blue-200 rounded w-32 mb-4"></div>
          <div className="h-16 bg-blue-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-blue-200 rounded w-24"></div>
            <div className="h-4 bg-blue-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">날씨 정보</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">서울특별시</h3>
        <p className="text-sm text-gray-600">{formatDate(currentTime)}</p>
        <p className="text-lg font-semibold text-gray-800">{formatTime(currentTime)}</p>
      </div>

      {weather && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {getWeatherIcon(weather.skyStatus, weather.precipitationType)}
              <div>
                <p className="text-4xl font-bold text-gray-900">{weather.temperature}°C</p>
                <p className="text-lg text-gray-700">
                  {getSkyStatusText(weather.skyStatus)}
                  {weather.precipitationType !== '0' && ` · ${getPrecipitationTypeText(weather.precipitationType)}`}
                </p>
                {weather.maxTemp && weather.minTemp && (
                  <p className="text-sm text-gray-600 mt-1">
                    최고 {weather.maxTemp}° / 최저 {weather.minTemp}°
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">바람</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {getWindDirectionText(weather.windDirection)} {weather.windSpeed}m/s
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">습도</p>
                  <p className="text-sm font-semibold text-gray-800">{weather.humidity}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CloudRain className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">강수량</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {weather.precipitation === '강수없음' ? '0' : weather.precipitation}mm
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">체감온도</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {(parseFloat(weather.temperature) - parseFloat(weather.windSpeed) * 0.7).toFixed(1)}°C
                  </p>
                </div>
              </div>
            </div>
          </div>

          {weather.forecast && weather.forecast.length > 0 && (
            <div className="border-t border-blue-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">시간별 예보</h4>
              <div className="flex space-x-2 overflow-x-auto">
                {weather.forecast.slice(0, 6).map((item, index) => (
                  <div key={index} className="flex-shrink-0 text-center bg-white bg-opacity-60 rounded-lg p-2 min-w-[60px]">
                    <p className="text-xs text-gray-600">{item.time}</p>
                    <div className="my-1">
                      {getWeatherIcon(item.skyStatus, item.precipitationType).type({
                        className: "w-8 h-8 mx-auto " + getWeatherIcon(item.skyStatus, item.precipitationType).props.className.replace(/w-16 h-16/, '')
                      })}
                    </div>
                    <p className="text-sm font-semibold">{item.temperature}°</p>
                    {item.precipitationProbability && (
                      <p className="text-xs text-blue-600">{item.precipitationProbability}%</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {weather.updateTime && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-gray-500">
                마지막 업데이트: {weather.updateTime}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;