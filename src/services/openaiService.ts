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
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert maintenance analyst for Korean industrial equipment. Analyze maintenance text and return JSON only.
              
              Return format:
              {
                "keywords": [{"keyword": "word", "count": number, "importance": 0-1}],
                "categories": [{"category": "name", "confidence": 0-1}],
                "sentiment": "positive|negative|neutral",
                "urgency": "high|medium|low",
                "summary": "brief summary in Korean"
              }
              
              Categories should be from: 기계고장, 전기문제, 유압문제, 공압문제, 제어문제, 안전문제, 정기점검, 기타
              Extract Korean keywords related to maintenance issues.`
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

      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to basic analysis
      return this.basicTextAnalysis(texts);
    }
  }

  async predictMaintenance(equipmentData: any): Promise<PredictiveMaintenanceResult> {
    try {
      console.log('🚀 Calling OpenAI API via proxy for predictive maintenance');
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert in predictive maintenance. Analyze equipment data and predict maintenance needs.
              
              Return JSON only:
              {
                "riskScore": 0-100,
                "predictedFailureDate": "YYYY-MM-DD or null",
                "recommendedActions": ["action1", "action2"],
                "estimatedCost": number,
                "confidence": 0-1
              }
              
              Consider: failure frequency, days since last maintenance, priority levels, seasonal patterns.
              Provide Korean text for recommendedActions.`
            },
            {
              role: 'user',
              content: `Equipment: ${equipmentData.name}
              Failure count: ${equipmentData.count}
              Days since maintenance: ${equipmentData.daysSince}
              Last issues: ${equipmentData.recentIssues}
              Priority distribution: ${JSON.stringify(equipmentData.priorityDist)}`
            }
          ],
          temperature: 0.4,
          max_tokens: 800
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      return JSON.parse(data.choices[0].message.content);
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
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a maintenance expert providing actionable insights. Generate insights based on analysis data.
              
              Return JSON array only:
              [
                {
                  "type": "warning|recommendation|trend",
                  "title": "Korean title",
                  "description": "Korean description",
                  "priority": "high|medium|low",
                  "actionItems": ["Korean action 1", "Korean action 2"]
                }
              ]
              
              Focus on: safety risks, cost savings, efficiency improvements, preventive actions.`
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

      return JSON.parse(data.choices[0].message.content);
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