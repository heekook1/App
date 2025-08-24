interface TextAnalysisResult {
  keywords: { keyword: string; count: number; importance: number }[];
  categories: { category: string; confidence: number }[];
  sentiment: 'positive' | 'negative' | 'neutral';
  urgency: 'high' | 'medium' | 'low';
  summary: string;
}

interface PredictiveMaintenanceResult {
  riskScore: number;
  predictedFailureDate: string | null;
  recommendedActions: string[];
  estimatedCost: number;
  confidence: number;
  analysisDetails?: {
    failurePattern: string;
    criticalComponents: string[];
    maintenanceInterval: string;
    riskFactors: string[];
  };
}

interface AIInsight {
  type: 'warning' | 'recommendation' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

class OpenAIService {
  private apiUrl = '/api/openai'; // Vercel Serverless Function 프록시 사용

  constructor() {
    console.log('🔑 OpenAI Service initialized with proxy endpoint');
  }

  async analyzeText(texts: string[]): Promise<TextAnalysisResult> {
    const combinedText = texts.join(' ');
    
    try {
      console.log('🚀 Calling OpenAI API via proxy for text analysis');
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You MUST respond ONLY with valid JSON. No text before or after the JSON. 

              Analyze Korean maintenance text and return this exact JSON format:
              {
                "keywords": [{"keyword": "word", "count": 3, "importance": 0.8}],
                "categories": [{"category": "기계고장", "confidence": 0.9}],
                "sentiment": "neutral",
                "urgency": "medium", 
                "summary": "Korean summary"
              }

              Categories: 기계고장, 전기문제, 유압문제, 공압문제, 제어문제, 안전문제, 정기점검, 기타
              RESPOND ONLY WITH JSON - NO OTHER TEXT.`
            },
            {
              role: 'user',
              content: `Analyze this maintenance text: ${combinedText}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const content = data.choices[0].message.content;
      console.log('🔍 GPT Response:', content.substring(0, 100) + '...');
      
      try {
        // JSON 응답에서 코드 블록 제거 (```json ... ``` 형태)
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // JSON 파싱 시도
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('🚨 JSON Parse Error:', parseError);
        console.log('📄 Full GPT Response:', content);
        
        // JSON이 아닌 응답이면 기본값 반환
        throw new Error('Invalid JSON response from GPT');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to basic analysis
      return this.basicTextAnalysis(texts);
    }
  }

  async predictMaintenance(equipmentData: any): Promise<PredictiveMaintenanceResult> {
    try {
      console.log('🚀 Calling OpenAI API via proxy for predictive maintenance');
      
      // TM 이력 데이터 포맷팅
      const tmHistoryText = equipmentData.tmHistory && equipmentData.tmHistory.length > 0
        ? equipmentData.tmHistory.map((tm: any) => `
          TM NO: ${tm.tmNo}
          작업일자: ${tm.requestDate} ~ ${tm.dueDate}
          작업유형: ${tm.type ? tm.type.join(', ') : '미분류'}
          작업내용: ${tm.description}
          작업결과: ${tm.workResult || '미기록'}
          완료노트: ${tm.completionNote || '없음'}
          상태: ${tm.status}
        `).join('\n---\n')
        : '이력 없음';

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `당신은 설비 신뢰성을 분석하는 전문 정비 엔지니어입니다. 반드시 유효한 JSON으로만 응답하세요.
              
              작업 설명, 완료 날짜, 작업 세부사항을 포함한 완전한 정비 이력을 분석하여 고장을 예측하세요.
              
              고려사항:
              1. 정비 빈도 패턴과 트렌드
              2. 수행된 작업 유형 (예방정비, 고장수리, 점검, 교체)
              3. 작업 설명에서 반복되는 문제
              4. 유사한 고장 간의 시간 간격
              5. 과거 작업의 심각도와 긴급성
              
              다음 정확한 JSON 형식으로 한국어로 응답하세요:
              {
                "riskScore": 0-100 (고장 확률 기준),
                "predictedFailureDate": "YYYY-MM-DD" 또는 null,
                "recommendedActions": ["구체적인 조치 1", "구체적인 조치 2"],
                "estimatedCost": KRW 단위 금액,
                "confidence": 0.0-1.0,
                "analysisDetails": {
                  "failurePattern": "식별된 패턴에 대한 한국어 설명",
                  "criticalComponents": ["부품1", "부품2"],
                  "maintenanceInterval": "권장 점검 주기 (예: 매월, 3개월마다, 6개월마다)",
                  "riskFactors": ["위험요소1", "위험요소2"]
                }
              }
              
              반드시 한국어로 JSON만 응답하세요 - 다른 텍스트는 없어야 합니다.`
            },
            {
              role: 'user',
              content: `설비명: ${equipmentData.name}
              모델: ${equipmentData.model || '미상'}
              총 TM 건수: ${equipmentData.count}건
              마지막 정비 후 경과일: ${equipmentData.daysSince}일
              
              완전한 정비 이력:
              ${tmHistoryText}
              
              최근 문제 요약: ${equipmentData.recentIssues}
              우선순위 분포: 높음 ${equipmentData.priorityDist.high}건, 보통 ${equipmentData.priorityDist.medium}건, 낮음 ${equipmentData.priorityDist.low}건
              
              정비 이력의 패턴을 분석하고 실제 수행된 작업을 기반으로 향후 고장을 예측해주세요.`
            }
          ],
          temperature: 0.4,
          max_tokens: 1200
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const content = data.choices[0].message.content;
      console.log('🔍 GPT Response:', content.substring(0, 100) + '...');
      
      try {
        // JSON 응답에서 코드 블록 제거 (```json ... ``` 형태)
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // JSON 파싱 시도
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('🚨 JSON Parse Error:', parseError);
        console.log('📄 Full GPT Response:', content);
        
        // JSON이 아닌 응답이면 기본값 반환
        throw new Error('Invalid JSON response from GPT');
      }
    } catch (error) {
      console.error('Predictive maintenance error:', error);
      return this.basicPredictiveMaintenance(equipmentData);
    }
  }

  async generateInsights(analysisData: any): Promise<AIInsight[]> {
    try {
      console.log('🚀 Calling OpenAI API via proxy for insights generation');
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You MUST respond ONLY with valid JSON array. No text before or after the JSON.
              
              Generate 2-4 insights based on the analysis data. Return this JSON array format:
              [
                {
                  "type": "warning",
                  "title": "고위험 장비 발견",
                  "description": "즉시 점검이 필요한 장비가 있습니다",
                  "priority": "high",
                  "actionItems": ["긴급 점검 수행", "예비 부품 확보"]
                },
                {
                  "type": "recommendation", 
                  "title": "예방 정비 권장",
                  "description": "정기적인 예방 정비로 비용을 절약할 수 있습니다",
                  "priority": "medium",
                  "actionItems": ["정기 점검 스케줄 수립", "부품 교체 계획 작성"]
                }
              ]
              
              Types: warning, recommendation, trend
              RESPOND ONLY WITH JSON ARRAY - NO OTHER TEXT.`
            },
            {
              role: 'user',
              content: `Analysis data: ${JSON.stringify(analysisData)}`
            }
          ],
          temperature: 0.5,
          max_tokens: 1200
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const content = data.choices[0].message.content;
      console.log('🔍 GPT Response:', content.substring(0, 100) + '...');
      
      try {
        // JSON 응답에서 코드 블록 제거 (```json ... ``` 형태)
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // JSON 파싱 시도
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('🚨 JSON Parse Error:', parseError);
        console.log('📄 Full GPT Response:', content);
        
        // JSON이 아닌 응답이면 기본값 반환
        throw new Error('Invalid JSON response from GPT');
      }
    } catch (error) {
      console.error('AI insights error:', error);
      return this.basicInsights(analysisData);
    }
  }

  // Fallback methods for when API fails
  private basicTextAnalysis(texts: string[]): TextAnalysisResult {
    const keywords = ['누수', '소음', '진동', '과열', '이상', '고장', '점검', '교체', '수리', '정비'];
    const keywordMap = new Map<string, number>();
    
    texts.forEach(text => {
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
        }
      });
    });

    return {
      keywords: Array.from(keywordMap.entries()).map(([keyword, count]) => ({
        keyword,
        count,
        importance: Math.min(count / 10, 1)
      })),
      categories: [{ category: '기계고장', confidence: 0.7 }],
      sentiment: 'neutral',
      urgency: 'medium',
      summary: '기본 텍스트 분석 결과'
    };
  }

  private basicPredictiveMaintenance(equipmentData: any): PredictiveMaintenanceResult {
    const riskScore = Math.min(equipmentData.count * 10 + (equipmentData.daysSince / 10), 100);
    
    return {
      riskScore,
      predictedFailureDate: equipmentData.daysSince > 180 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      recommendedActions: riskScore > 70 ? ['즉시 점검 필요', '예비 부품 준비'] : ['정기 점검 일정 확인'],
      estimatedCost: riskScore * 10000,
      confidence: 0.6
    };
  }

  private basicInsights(analysisData: any): AIInsight[] {
    const insights: AIInsight[] = [];
    
    if (analysisData.highRiskEquipment?.length > 0) {
      insights.push({
        type: 'warning',
        title: '고위험 장비 발견',
        description: `${analysisData.highRiskEquipment.length}개의 장비가 즉시 점검이 필요합니다.`,
        priority: 'high',
        actionItems: ['긴급 점검 일정 수립', '예비 부품 확보']
      });
    }

    return insights;
  }
}

export default new OpenAIService();