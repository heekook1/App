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

class MisoService {
  private apiUrl = '/api/miso'; // Vercel Serverless Function 프록시 사용
  private conversationId: string | null = null;

  constructor() {
    console.log('🔑 MISO Service initialized with proxy endpoint');
  }

  private async sendMessage(query: string): Promise<any> {
    try {

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          mode: 'blocking', // 블로킹 모드로 한번에 결과 받기
          conversation_id: this.conversationId || '',
          user: 'maintenance-system',
          inputs: {}
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('MISO API Error Response:', {
          status: response.status,
          error: data.error,
          details: data.details,
          fullResponse: data,
          requestBody: {
            query: query,
            mode: 'blocking',
            conversation_id: this.conversationId || '',
            user: 'maintenance-system',
            inputs: {}
          }
        });

        throw new Error(`MISO API error: ${response.status} - ${JSON.stringify(data)}`);
      }

      // 대화 ID 저장 (이어서 대화할 경우 사용)
      if (data.conversation_id) {
        this.conversationId = data.conversation_id;
      }

      return data.answer || data.message || data;
    } catch (error) {
      console.error('MISO API call failed:', error);
      throw error;
    }
  }

  async analyzeText(texts: string[]): Promise<TextAnalysisResult> {
    const combinedText = texts.join(' ');

    try {
      console.log('🚀 Calling MISO API for text analysis');

      const query = `다음 정비 텍스트를 JSON 형식으로 분석해주세요: ${combinedText}

다음 형식으로 응답해주세요:
{
  "keywords": [{"keyword": "단어", "count": 횟수, "importance": 중요도}],
  "categories": [{"category": "카테고리", "confidence": 신뢰도}],
  "sentiment": "positive/negative/neutral",
  "urgency": "high/medium/low",
  "summary": "요약"
}

카테고리: 기계고장, 전기문제, 유압문제, 공압문제, 제어문제, 안전문제, 정기점검, 기타`;

      const response = await this.sendMessage(query);

      try {
        // 응답이 문자열인 경우 파싱
        const content = typeof response === 'string' ? response : JSON.stringify(response);
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        // JSON 부분만 추출 (설명 텍스트 제거)
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        throw new Error('No valid JSON found in response');
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return this.basicTextAnalysis(texts);
      }
    } catch (error) {
      console.error('MISO API error:', error);
      return this.basicTextAnalysis(texts);
    }
  }

  async predictMaintenance(equipmentData: any): Promise<PredictiveMaintenanceResult> {
    try {
      console.log('🚀 Calling MISO API for predictive maintenance');

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

      const query = `설비 고장 예측 분석을 JSON 형식으로 해주세요:

설비명: ${equipmentData.name}
모델: ${equipmentData.model || '미상'}
총 TM 건수: ${equipmentData.count}건
마지막 정비 후 경과일: ${equipmentData.daysSince}일

정비 이력:
${tmHistoryText}

최근 문제: ${equipmentData.recentIssues}
우선순위: 높음 ${equipmentData.priorityDist.high}건, 보통 ${equipmentData.priorityDist.medium}건, 낮음 ${equipmentData.priorityDist.low}건

다음 JSON 형식으로 응답해주세요:
{
  "riskScore": 위험점수(0-100),
  "predictedFailureDate": "예측고장일(YYYY-MM-DD)" 또는 null,
  "recommendedActions": ["권장조치1", "권장조치2"],
  "estimatedCost": 예상비용,
  "confidence": 신뢰도(0.0-1.0),
  "analysisDetails": {
    "failurePattern": "고장패턴설명",
    "criticalComponents": ["주요부품1", "주요부품2"],
    "maintenanceInterval": "권장점검주기",
    "riskFactors": ["위험요소1", "위험요소2"]
  }
}`;

      const response = await this.sendMessage(query);

      try {
        const content = typeof response === 'string' ? response : JSON.stringify(response);
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        throw new Error('No valid JSON found in response');
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return this.basicPredictiveMaintenance(equipmentData);
      }
    } catch (error) {
      console.error('Predictive maintenance error:', error);
      return this.basicPredictiveMaintenance(equipmentData);
    }
  }

  async generateInsights(analysisData: any): Promise<AIInsight[]> {
    try {
      console.log('🚀 Calling MISO API for insights generation');

      const query = `발전소 정비 인사이트를 JSON 배열로 생성해주세요:

분석 데이터: ${JSON.stringify(analysisData)}

다음 JSON 배열 형식으로 2-4개의 인사이트를 생성하세요:
[
  {
    "type": "warning/recommendation/trend",
    "title": "인사이트 제목",
    "description": "설비 관련 설명",
    "priority": "high/medium/low",
    "actionItems": ["조치항목1", "조치항목2"]
  }
]

'설비'라는 용어를 사용하고 실용적인 조치항목을 포함해주세요.`;

      const response = await this.sendMessage(query);

      try {
        const content = typeof response === 'string' ? response : JSON.stringify(response);
        const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const jsonMatch = cleanedContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }

        throw new Error('No valid JSON array found in response');
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return this.basicInsights(analysisData);
      }
    } catch (error) {
      console.error('AI insights error:', error);
      return this.basicInsights(analysisData);
    }
  }

  // 새 대화 시작 (필요시 conversation_id 리셋)
  startNewConversation() {
    this.conversationId = null;
    console.log('🔄 Started new conversation');
  }

  // Fallback methods
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
      predictedFailureDate: equipmentData.daysSince > 180
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null,
      recommendedActions: riskScore > 70
        ? ['즉시 점검 필요', '예비 부품 준비']
        : ['정기 점검 일정 확인'],
      estimatedCost: riskScore * 10000,
      confidence: 0.6
    };
  }

  private basicInsights(analysisData: any): AIInsight[] {
    const insights: AIInsight[] = [];

    if (analysisData.highRiskEquipment?.length > 0) {
      insights.push({
        type: 'warning',
        title: '고위험 설비 발견',
        description: `${analysisData.highRiskEquipment.length}개의 설비가 즉시 점검이 필요합니다.`,
        priority: 'high',
        actionItems: ['긴급 점검 일정 수립', '예비 부품 확보']
      });
    }

    return insights;
  }
}

export default new MisoService();