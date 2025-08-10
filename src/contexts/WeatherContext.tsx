import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  precipitationProbability: string;
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

interface WeatherContextType {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};

interface WeatherProviderProps {
  children: ReactNode;
}

export const WeatherProvider: React.FC<WeatherProviderProps> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 격자 좌표 (인천 남동구 논현동 고정)
  const gridCoords = { nx: 55, ny: 124 };

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

  // 초단기예보 base_time 계산 (매시 30분 발표, 45분 이후 제공)
  const getUltraSrtFcstBaseTime = (date: Date) => {
    const hour = date.getUTCHours();
    const minute = date.getUTCMinutes();
    
    let selectedBaseTime: string;
    let baseDate = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 45분 이후라면 현재 시간의 30분 데이터 사용
    if (minute >= 45) {
      selectedBaseTime = hour.toString().padStart(2, '0') + '30';
    } else if (minute >= 30) {
      // 30분 이후 45분 이전이면 이전 시간의 30분 데이터 사용
      let prevHour = hour - 1;
      if (prevHour < 0) {
        prevHour = 23;
        const prevDay = new Date(date.getTime() - (24 * 60 * 60 * 1000));
        baseDate = prevDay.toISOString().slice(0, 10).replace(/-/g, '');
      }
      selectedBaseTime = prevHour.toString().padStart(2, '0') + '30';
    } else {
      // 30분 이전이면 이전 시간의 30분 데이터 사용
      let prevHour = hour - 1;
      if (prevHour < 0) {
        prevHour = 23;
        const prevDay = new Date(date.getTime() - (24 * 60 * 60 * 1000));
        baseDate = prevDay.toISOString().slice(0, 10).replace(/-/g, '');
      }
      selectedBaseTime = prevHour.toString().padStart(2, '0') + '30';
    }
    
    return {
      baseTime: selectedBaseTime,
      baseDate: baseDate
    };
  };

  // 단기예보 base_time 계산 (KST 기준)
  const getVilageBaseTime = (date: Date) => {
    const hour = date.getUTCHours(); // UTC+9로 변환된 date에서 UTC 메서드 사용
    const minute = date.getUTCMinutes();
    
    // 단기예보는 02, 05, 08, 11, 14, 17, 20, 23시에 발표 (각 기준시간 + 10분 후)
    const slots = [2, 5, 8, 11, 14, 17, 20, 23];
    const currentTime = hour * 100 + minute;
    
    // 현재 시간 이전의 가장 최근 슬롯 찾기
    let selectedHour = 23; // 기본값: 전날 23시
    let baseDate = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    for (let i = slots.length - 1; i >= 0; i--) {
      const slotTime = slots[i] * 100 + 10; // 슬롯 시간 + 10분
      if (currentTime >= slotTime) {
        selectedHour = slots[i];
        break;
      }
    }
    
    // 새벽 시간대(02:10 이전)는 전날 23시 데이터 사용
    if (selectedHour === 23 && hour < 2) {
      const prevDay = new Date(date.getTime() - (24 * 60 * 60 * 1000));
      baseDate = prevDay.toISOString().slice(0, 10).replace(/-/g, '');
    }
    
    const selectedBaseTime = selectedHour.toString().padStart(2, '0') + '00';
    
    return {
      baseTime: selectedBaseTime,
      baseDate: baseDate
    };
  };

  // 날씨 데이터 가져오기
  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      // 한국 시간 기준으로 현재 시간 계산 (UTC+9)
      const now = new Date();
      const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const baseDate = koreaTime.toISOString().slice(0, 10).replace(/-/g, '');
      
      // 초단기실황은 매시 10분 이후 발표, 10분마다 업데이트 (한국 시간 기준)
      const currentMinutes = koreaTime.getUTCMinutes(); // UTC+9로 변환된 koreaTime에서 UTC 메서드 사용
      const currentHour = koreaTime.getUTCHours(); // UTC+9로 변환된 koreaTime에서 UTC 메서드 사용
      let ncstBaseTime: string;
      let ncstBaseDate = baseDate;
      
      // 초단기실황 base_time 계산: 매시 10분 이후에 해당 시간 데이터 제공
      if (currentMinutes >= 10) {
        // 10분 이후라면 현재 시간 사용
        ncstBaseTime = currentHour.toString().padStart(2, '0') + '00';
      } else {
        // 10분 이전이라면 1시간 전 데이터 사용
        let prevHour = currentHour - 1;
        if (prevHour < 0) {
          prevHour = 23;
          // 날짜가 바뀐 경우 baseDate도 조정
          const prevDay = new Date(koreaTime.getTime() - (24 * 60 * 60 * 1000));
          ncstBaseDate = prevDay.toISOString().slice(0, 10).replace(/-/g, '');
        }
        ncstBaseTime = prevHour.toString().padStart(2, '0') + '00';
      }
      
      // 초단기예보 base_time 계산 (매시 30분 발표, 45분 이후 제공)
      const ultraResult = getUltraSrtFcstBaseTime(koreaTime);
      const ultraBaseTime = ultraResult.baseTime;
      const ultraBaseDate = ultraResult.baseDate;
      
      // 단기예보 base_time 계산 (한국 시간 기준)
      const vilageResult = getVilageBaseTime(koreaTime);
      const vilageBaseTime = vilageResult.baseTime;
      const vilageBaseDate = vilageResult.baseDate;
      
      // 초단기실황 (현재 날씨) - 조회된 격자 좌표 사용
      const ncstUrl = `/api/weather?endpoint=getUltraSrtNcst&numOfRows=10&pageNo=1&base_date=${ncstBaseDate}&base_time=${ncstBaseTime}&nx=${gridCoords.nx}&ny=${gridCoords.ny}`;
      
      // 초단기예보 (6시간 시간별 예보) - 조회된 격자 좌표 사용
      const ultraUrl = `/api/weather?endpoint=getUltraSrtFcst&numOfRows=60&pageNo=1&base_date=${ultraBaseDate}&base_time=${ultraBaseTime}&nx=${gridCoords.nx}&ny=${gridCoords.ny}`;
      
      // 단기예보 (최고/최저 기온) - TMX/TMN 확보를 위해 더 많은 데이터 요청
      const vilageUrl = `/api/weather?endpoint=getVilageFcst&numOfRows=1000&pageNo=1&base_date=${vilageBaseDate}&base_time=${vilageBaseTime}&nx=${gridCoords.nx}&ny=${gridCoords.ny}`;

      // 세 API 동시 호출
      const [ncstResponse, ultraResponse, vilageResponse] = await Promise.all([
        fetch(ncstUrl),
        fetch(ultraUrl),
        fetch(vilageUrl)
      ]);

      const ncstData = await ncstResponse.json();
      const ultraData = await ultraResponse.json();
      const vilageData = await vilageResponse.json();

      // 에러 응답 체크
      if (ncstData.error || ultraData.error || vilageData.error) {
        throw new Error(ncstData.error || ultraData.error || vilageData.error || 'API 오류');
      }

      if (ncstData.response?.header?.resultCode === '00' && 
          ultraData.response?.header?.resultCode === '00' && 
          vilageData.response?.header?.resultCode === '00') {
        const ncstItems = ncstData.response.body.items.item;
        const ultraItems = ultraData.response.body.items.item;
        const vilageItems = vilageData.response.body.items.item;
        
        const weatherData: Partial<WeatherData> = {
          updateTime: ncstBaseTime.slice(0, 2) + ':' + ncstBaseTime.slice(2),
          precipitation: '0',
          precipitationType: '0',
          skyStatus: '1',
          precipitationProbability: '0'
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
        // 오늘과 내일 데이터 확보 (안전 범위)
        const tomorrow = new Date(koreaTime.getTime() + (24 * 60 * 60 * 1000));
        const tomorrowDate = tomorrow.toISOString().slice(0, 10).replace(/-/g, '');
        
        // 오늘/내일 데이터만 필터링
        const relevantItems = vilageItems.filter((item: any) => 
          item.fcstDate === baseDate || item.fcstDate === tomorrowDate
        );
        
        // 현재 시간과 가장 가까운 하늘상태 가져오기 (KST 기준)
        const currentHour = koreaTime.getUTCHours(); // UTC+9로 변환된 koreaTime에서 UTC 메서드 사용
        const currentTimeStr = currentHour.toString().padStart(2, '0') + '00';
        let skyItem = relevantItems.find((item: any) => item.category === 'SKY' && item.fcstTime === currentTimeStr);
        
        // 정확한 시간의 데이터가 없으면 가장 가까운 시간의 데이터 사용
        if (!skyItem) {
          skyItem = relevantItems.find((item: any) => item.category === 'SKY');
        }
        
        if (skyItem) {
          weatherData.skyStatus = skyItem.fcstValue;
        }
        
        // 현재 시간대 강수확률 가져오기
        let popItem = relevantItems.find((item: any) => item.category === 'POP' && item.fcstTime === currentTimeStr);
        if (!popItem) {
          popItem = relevantItems.find((item: any) => item.category === 'POP');
        }
        if (popItem) {
          weatherData.precipitationProbability = popItem.fcstValue;
        }
        
        // TMX/TMN 추출 함수
        const pickTMXTMN = (items: any[], targetDate: string) => {
          const dayItems = items.filter((item: any) => item.fcstDate === targetDate);
          
          const tmx = dayItems.find((item: any) => item.category === 'TMX')?.fcstValue;
          const tmn = dayItems.find((item: any) => item.category === 'TMN')?.fcstValue;
          
          return { tmx, tmn };
        };
        
        // 오늘 우선, 없으면 내일 폴백
        const todayTM = pickTMXTMN(relevantItems, baseDate);
        const tomorrowTM = pickTMXTMN(relevantItems, tomorrowDate);
        
        const finalTMX = todayTM.tmx || tomorrowTM.tmx;
        const finalTMN = todayTM.tmn || tomorrowTM.tmn;
        
        if (finalTMX) weatherData.maxTemp = finalTMX;
        if (finalTMN) weatherData.minTemp = finalTMN;

        // 시간별 예보 (초단기예보 사용 - 향후 6시간)
        const forecast: any[] = [];
        const baseHour = parseInt(ultraBaseTime.slice(0, 2));
        
        // 초단기예보는 현재 기준 시간부터 +6시간까지 제공
        for (let i = 1; i <= 6; i++) {
          const fcstHour = (baseHour + i) % 24;
          const fcstTimeStr = fcstHour.toString().padStart(2, '0') + '00';
          let fcstDateStr = ultraBaseDate;
          
          // 날짜가 바뀌는 경우 처리
          if (baseHour + i >= 24) {
            const nextDay = new Date(koreaTime.getTime() + (24 * 60 * 60 * 1000));
            fcstDateStr = nextDay.toISOString().slice(0, 10).replace(/-/g, '');
          }
          
          const hourData: any = {
            time: fcstHour.toString().padStart(2, '0') + ':00',
            temperature: '',
            skyStatus: '1',
            precipitationType: '0',
            precipitationProbability: '0'
          };
          
          // 초단기예보 데이터에서 해당 시간 찾기
          ultraItems.forEach((item: any) => {
            if (item.fcstDate === fcstDateStr && item.fcstTime === fcstTimeStr) {
              switch (item.category) {
                case 'T1H':
                  hourData.temperature = item.fcstValue;
                  break;
                case 'SKY':
                  hourData.skyStatus = item.fcstValue;
                  break;
                case 'PTY':
                  hourData.precipitationType = item.fcstValue;
                  break;
                case 'RN1':
                  // 초단기예보에는 POP가 없으므로 강수량으로 확률 추정
                  if (parseFloat(item.fcstValue) > 0) {
                    hourData.precipitationProbability = '60'; // 강수 있으면 높은 확률
                  }
                  break;
              }
            }
          });
          
          if (hourData.temperature) {
            forecast.push(hourData);
          }
        }

        weatherData.forecast = forecast;
        setWeather(weatherData as WeatherData);
      } else {
        console.error('API 응답 오류:', {
          ncstResult: ncstData.response?.header?.resultCode,
          ncstMsg: ncstData.response?.header?.resultMsg,
          ultraResult: ultraData.response?.header?.resultCode,
          ultraMsg: ultraData.response?.header?.resultMsg,
          vilageResult: vilageData.response?.header?.resultCode,
          vilageMsg: vilageData.response?.header?.resultMsg
        });
        setError(`날씨 데이터를 가져올 수 없습니다: ${ncstData.response?.header?.resultMsg || ultraData.response?.header?.resultMsg || vilageData.response?.header?.resultMsg || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('날씨 데이터 가져오기 실패:', err);
      setError('날씨 정보를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 각 API별 독립적인 스케줄링 (5분마다 체크해서 필요시에만 호출)
  useEffect(() => {
    // 초기 로드
    fetchWeather();

    let lastNcstBaseTime = '';
    let lastUltraBaseTime = '';
    let lastVilageBaseTime = '';

    // 5분마다 체크해서 base_time이 변경된 경우에만 API 호출
    const checkAndUpdate = () => {
      try {
        const now = new Date();
        const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
        const currentMinutes = koreaTime.getUTCMinutes();
        const currentHour = koreaTime.getUTCHours();

        // 초단기실황 base_time 계산
        let ncstBaseTime: string;
        if (currentMinutes >= 10) {
          ncstBaseTime = currentHour.toString().padStart(2, '0') + '00';
        } else {
          let prevHour = currentHour - 1;
          if (prevHour < 0) prevHour = 23;
          ncstBaseTime = prevHour.toString().padStart(2, '0') + '00';
        }

        // 초단기예보 base_time 계산
        const ultraResult = getUltraSrtFcstBaseTime(koreaTime);
        const ultraBaseTime = ultraResult.baseTime;

        // 단기예보 base_time 계산
        const vilageResult = getVilageBaseTime(koreaTime);
        const vilageBaseTime = vilageResult.baseTime;

        // 변경된 것이 있으면 업데이트
        if (ncstBaseTime !== lastNcstBaseTime || 
            ultraBaseTime !== lastUltraBaseTime || 
            vilageBaseTime !== lastVilageBaseTime) {
          
          console.log('날씨 API 업데이트 감지:', {
            ncst: `${lastNcstBaseTime} → ${ncstBaseTime}`,
            ultra: `${lastUltraBaseTime} → ${ultraBaseTime}`,
            vilage: `${lastVilageBaseTime} → ${vilageBaseTime}`
          });
          
          fetchWeather();
          
          lastNcstBaseTime = ncstBaseTime;
          lastUltraBaseTime = ultraBaseTime;
          lastVilageBaseTime = vilageBaseTime;
        }
      } catch (error) {
        console.error('스케줄 체크 중 오류:', error);
      }
    };

    // 5분마다 체크
    const interval = setInterval(checkAndUpdate, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const value: WeatherContextType = {
    weather,
    loading,
    error,
    refreshWeather: fetchWeather
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};