import { supabase } from '../supabaseClient';

export interface AICacheEntry {
  id?: number;
  data_hash: string;
  analysis_type: string;
  analysis_result: any;
  created_at?: string;
  updated_at?: string;
}

class AICacheService {
  
  // AI 분석 결과를 캐시에서 가져오기
  async getAnalysisCache(dataHash: string, analysisType: string): Promise<any | null> {
    try {
      console.log('🔍 AI 캐시 조회:', { dataHash: dataHash.slice(0, 8) + '...', analysisType });
      
      const { data, error } = await supabase
        .from('ai_analysis_cache')
        .select('analysis_result, created_at')
        .eq('data_hash', dataHash)
        .eq('analysis_type', analysisType)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 데이터 없음 (정상 상황)
          console.log('📭 캐시 없음 - 새로 분석 필요');
          return null;
        }
        console.error('캐시 조회 오류:', error);
        return null;
      }

      console.log('✅ 캐시 발견:', new Date(data.created_at).toLocaleString());
      return data.analysis_result;
    } catch (error) {
      console.error('AI 캐시 조회 실패:', error);
      return null;
    }
  }

  // AI 분석 결과를 캐시에 저장하기
  async saveAnalysisCache(dataHash: string, analysisType: string, result: any): Promise<boolean> {
    try {
      console.log('💾 AI 캐시 저장:', { dataHash: dataHash.slice(0, 8) + '...', analysisType });

      // upsert 사용 (데이터가 있으면 업데이트, 없으면 삽입)
      const { error } = await supabase
        .from('ai_analysis_cache')
        .upsert({
          data_hash: dataHash,
          analysis_type: analysisType,
          analysis_result: result,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'data_hash,analysis_type'
        });

      if (error) {
        console.error('캐시 저장 오류:', error);
        return false;
      }

      console.log('✅ AI 캐시 저장 완료');
      return true;
    } catch (error) {
      console.error('AI 캐시 저장 실패:', error);
      return false;
    }
  }

  // 여러 분석 타입의 캐시를 한번에 가져오기
  async getAllAnalysisCache(dataHash: string): Promise<Record<string, any>> {
    try {
      console.log('🔍 전체 AI 캐시 조회:', dataHash.slice(0, 8) + '...');
      
      const { data, error } = await supabase
        .from('ai_analysis_cache')
        .select('analysis_type, analysis_result, created_at')
        .eq('data_hash', dataHash);

      if (error) {
        console.error('전체 캐시 조회 오류:', error);
        return {};
      }

      const cache: Record<string, any> = {};
      data?.forEach(item => {
        cache[item.analysis_type] = item.analysis_result;
      });

      console.log('✅ 전체 캐시 조회 완료:', Object.keys(cache));
      return cache;
    } catch (error) {
      console.error('전체 AI 캐시 조회 실패:', error);
      return {};
    }
  }

  // 오래된 캐시 데이터 정리 (선택적)
  async cleanupOldCache(daysOld: number = 7): Promise<boolean> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('ai_analysis_cache')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) {
        console.error('캐시 정리 오류:', error);
        return false;
      }

      console.log('🧹 오래된 AI 캐시 정리 완료');
      return true;
    } catch (error) {
      console.error('캐시 정리 실패:', error);
      return false;
    }
  }
}

export default new AICacheService();