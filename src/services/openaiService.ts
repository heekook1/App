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
              content: `You are an expert maintenance engineer analyzing equipment reliability. You MUST respond ONLY with valid JSON.
              
              Analyze the complete maintenance history including work descriptions, completion dates, and work details to predict failures.
              
              Consider:
              1. Maintenance frequency patterns and trends
              2. Types of work performed (예방정비, 고장수리, 점검, 교체)
              3. Recurring issues in work descriptions
              4. Time intervals between similar failures
              5. Severity and urgency of past work
              
              Return this exact JSON format:
              {
                "riskScore": 0-100 (based on failure probability),
                "predictedFailureDate": "YYYY-MM-DD" or null,
                "recommendedActions": ["specific action 1", "specific action 2"],
                "estimatedCost": amount in KRW,
                "confidence": 0.0-1.0,
                "analysisDetails": {
                  "failurePattern": "description of identified pattern",
                  "criticalComponents": ["component1", "component2"],
                  "maintenanceInterval": "recommended interval",
                  "riskFactors": ["factor1", "factor2"]
                }
              }
              
              RESPOND ONLY WITH JSON - NO OTHER TEXT.`
            },
            {
              role: 'user',
              content: `Equipment: ${equipmentData.name}
              Model: ${equipmentData.model || 'Unknown'}
              Total TM Count: ${equipmentData.count}
              Days Since Last Maintenance: ${equipmentData.daysSince}
              
              Complete Maintenance History:
              ${tmHistoryText}
              
              Recent Issues Summary: ${equipmentData.recentIssues}
              Priority Distribution: ${JSON.stringify(equipmentData.priorityDist)}
              
              Analyze the patterns in the maintenance history and predict future failures based on the actual work performed.`
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