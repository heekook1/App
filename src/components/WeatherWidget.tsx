import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind, Droplets, Thermometer, CloudDrizzle } from 'lucide-react';
import { useWeather } from '../contexts/WeatherContext';

const WeatherWidget: React.FC = () => {
  const { weather, loading, error } = useWeather();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 날씨 아이콘 결정
  const getWeatherIcon = (skyStatus: string, precipitationType: string, size: string = "w-16 h-16") => {
    // 강수형태 우선 체크
    switch (precipitationType) {
      case '1': // 비
        return <CloudRain className={`${size} text-blue-500`} />;
      case '2': // 비/눈
        return <CloudDrizzle className={`${size} text-blue-400`} />;
      case '3': // 눈
        return <CloudSnow className={`${size} text-blue-300`} />;
      case '4': // 소나기
        return <CloudDrizzle className={`${size} text-blue-600`} />;
      case '5': // 빗방울
        return <CloudRain className={`${size} text-blue-400`} />;
      case '6': // 빗방울/눈날림
        return <CloudDrizzle className={`${size} text-blue-300`} />;
      case '7': // 눈날림
        return <CloudSnow className={`${size} text-gray-400`} />;
      default: // 강수 없음
        switch (skyStatus) {
          case '1': // 맑음
            return <Sun className={`${size} text-yellow-500`} />;
          case '3': // 구름많음
            return <Cloud className={`${size} text-gray-400`} />;
          case '4': // 흐림
            return <Cloud className={`${size} text-gray-600`} />;
          default:
            return <Sun className={`${size} text-yellow-500`} />;
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

  // 체감온도 계산 (Heat Index + Wind Chill 조합)
  const calculateFeelLikeTemperature = (temp: number, windSpeed: number, humidity: number): number => {
    // 온도가 26.7°C (80°F) 이상이고 습도가 40% 이상일 때: Heat Index 사용
    if (temp >= 26.7 && humidity >= 40) {
      // Heat Index 공식 (더위지수)
      const t = temp;
      const h = humidity;
      
      let hi = -8.78469475556 +
               1.61139411 * t +
               2.33854883889 * h +
               -0.14611605 * t * h +
               -0.012308094 * t * t +
               -0.0164248277778 * h * h +
               0.002211732 * t * t * h +
               0.00072546 * t * h * h +
               -0.000003582 * t * t * h * h;
      
      return Math.max(hi, temp);
    }
    // 온도가 10°C (50°F) 이하이고 풍속이 있을 때: Wind Chill 사용
    else if (temp <= 10 && windSpeed > 0) {
      // Wind Chill 공식 (체감온도)
      const v = windSpeed * 3.6; // m/s를 km/h로 변환
      const wc = 13.12 + 0.6215 * temp - 11.37 * Math.pow(v, 0.16) + 0.3965 * temp * Math.pow(v, 0.16);
      return Math.min(wc, temp);
    }
    // 중간 온도: 습도와 풍속을 고려한 보정
    else {
      let adjusted = temp;
      
      // 습도 보정 (높은 습도일 때 더 덥게 느껴짐)
      // 네이버와 유사하게 조정
      if (humidity > 50) {
        adjusted += (humidity - 50) * 0.05; // 50% 이상부터 보정 시작
      }
      
      // 바람 보정 (바람이 있으면 시원하게 느껴짐)
      // 약한 바람은 체감온도에 큰 영향 없음
      if (windSpeed > 3) {
        adjusted -= (windSpeed - 3) * 0.5; // 3m/s 이상일 때만 보정
      }
      
      return adjusted;
    }
  };

  // 풍향 텍스트 변환
  const getWindDirectionText = (deg: string) => {
    const degree = parseInt(deg);
    const directions = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
    const index = Math.round((degree % 360) / 22.5);
    return directions[index] || '북';
  };

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
        <h3 className="text-xl font-bold text-gray-900">인천 남동구 논현동</h3>
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
                <CloudRain className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600">강수확률</p>
                  <p className="text-sm font-semibold text-gray-800">{weather.precipitationProbability}%</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-60 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">체감온도</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {calculateFeelLikeTemperature(
                      parseFloat(weather.temperature),
                      parseFloat(weather.windSpeed),
                      parseFloat(weather.humidity)
                    ).toFixed(1)}°C
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
                      {getWeatherIcon(item.skyStatus, item.precipitationType, "w-8 h-8")}
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