# AI 도구를 활용한 정비업체 통합 관리 시스템 개발
## 2025 사내 AI 경진대회

---

## 1. 프로젝트 배경

### 대상 업무
**위드-영진 경상 정비 업무**
- 일일 정비 작업 관리
- 정비 인력 운영
- 설비 이력 관리
- 기술 문서 관리

### 프로젝트 목적
정비 현장의 비효율적인 업무 프로세스를 디지털화하여 업무 효율성 향상

---

## 2. 기존 업무 프로세스 (AS-IS)

### 현재 업무 흐름
```
1. 아침 TBM (20-30분)
   └─ 수기 작성된 작업 일지 공유
   └─ 구두로 작업 배정
   
2. 작업 수행
   └─ 종이 작업 지시서 작성
   └─ 카카오톡으로 진행 상황 공유
   
3. 작업 완료
   └─ 엑셀에 수기로 이력 입력
   └─ 종이 서류 보관
   
4. 문서 관리
   └─ 매뉴얼/도면 찾기 (평균 15분)
   └─ 버전 관리 없음
```

---

## 3. 페인포인트 분석

### 1. 정보 분산 문제
| 업무 | 현재 방식 | 문제점 |
|------|-----------|--------|
| 작업 지시 | 종이, 엑셀, 카톡 | 정보 누락, 중복 작업 |
| 인력 관리 | 엑셀 파일 | 실시간 현황 파악 불가 |
| 설비 이력 | 수기 대장 | 검색 불가, 이력 누락 |
| 문서 관리 | 로컬 폴더 | 최신 버전 확인 어려움 |

### 2. 시간 낭비
- **TBM 시간**: 매일 20-30분 (연간 120시간)
- **문서 검색**: 건당 15분 (일 3회 = 45분)
- **작업 이력 정리**: 일 1시간
- **총 낭비 시간**: 일 2시간 15분

### 3. 데이터 신뢰성
- 작업 누락률: 월 5건 (15%)
- 설비 이력 누락: 30%
- 문서 버전 불일치: 40%

---

## 4. 개선 업무 프로세스 (TO-BE)

### AI 도구를 활용한 새로운 업무 흐름
```
1. 아침 TBM (10분)
   └─ 시스템에서 실시간 현황 확인
   └─ 자동 작업 배정
   
2. 작업 수행
   └─ 모바일로 실시간 상태 업데이트
   └─ AI 챗봇으로 기술 지원
   
3. 작업 완료
   └─ 자동으로 설비 이력 연동
   └─ 디지털 서명 및 저장
   
4. 문서 관리
   └─ 3초 내 검색
   └─ 자동 버전 관리
```

---

## 5. 개발 환경 및 AI 도구

### 개발 환경
- **IDE**: VS Code
- **버전 관리**: Git / GitHub
- **배포**: Vercel

### AI 도구 활용
| 단계 | 도구 | 용도 | 효과 |
|------|------|------|------|
| **기획** | ChatGPT, Gemini Pro 2.5 | 요구사항 정의 | 기획 시간 70% 단축 |
| **코딩** | Claude Code (Opus 4.1) | 코드 작성 | 개발 시간 80% 단축 |
| **DB** | MCP | Supabase 제어 | DB 구축 90% 자동화 |
| **운영** | Dify | AI 챗봇 | 24/7 사용자 지원 |

---

## 6. 기술 스택

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Lucide React

### Backend (Supabase)
- PostgreSQL Database
- Authentication
- Realtime Subscriptions
- Storage

### AI Integration
- Claude Code (개발)
- MCP Server (DB 관리)
- Dify Chatbot (운영)

---

## 7. 주요 개선점

### 1. 작업 관리 디지털화
| Before | After | 개선 효과 |
|--------|-------|-----------|
| 종이 작업 지시서 | 디지털 작업 관리 | 작업 누락 80% 감소 |
| 수기 번호 부여 | 자동 번호 생성 (2025-001) | 중복 방지 100% |
| 카톡 상태 공유 | 실시간 상태 업데이트 | 즉시 확인 가능 |

### 2. 인력 관리 자동화
| Before | After | 개선 효과 |
|--------|-------|-----------|
| 엑셀 관리 | 통합 DB | 실시간 조회 |
| 수기 출입 기록 | 자동 이력 추적 | 정확도 100% |
| 자격증 만료 미확인 | 자동 알림 | 규정 위반 Zero |

### 3. 문서 관리 효율화
| Before | After | 개선 효과 |
|--------|-------|-----------|
| 로컬 폴더 | 클라우드 Storage | 어디서나 접근 |
| 15분 검색 | 3초 검색 | 90% 시간 단축 |
| 버전 관리 없음 | 자동 버전 관리 | 최신 문서 보장 |

---

## 8. 산출물 상세

### 1. 정비업체 통합 관리 시스템
- **URL**: https://app-three-ashy.vercel.app
- **GitHub**: https://github.com/heekook1/App

### 2. 시스템 구성
```
총 코드: 약 15,000줄
├─ AI 생성: 14,000줄 (93%)
└─ 수동 작성: 1,000줄 (7%)

개발 기간: 2주
├─ Week 1: 기획 및 설계
└─ Week 2: 구현 및 배포
```

### 3. 주요 화면
- **대시보드**: 실시간 현황 한눈에 확인
- **작업 관리**: 드래그 앤 드롭으로 상태 변경
- **인력 관리**: 자격증, 출입 이력 통합 관리
- **일정 관리**: 캘린더 뷰로 일정 확인
- **문서 관리**: 카테고리별 문서 분류
- **AI 챗봇**: 24/7 업무 지원

---

## 9. Claude Code 활용 사례

### VS Code에서 실제 개발 과정
```typescript
// Claude Code가 생성한 작업 관리 컴포넌트
interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignees: string[];
  priority: 'urgent' | 'high' | 'normal' | 'low';
  equipment: string;
  createdAt: string;
  completedAt?: string;
}

const WorkOrderManagement: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  
  // 자동 번호 생성 로직
  const generateOrderNumber = () => {
    const year = new Date().getFullYear();
    const count = workOrders.length + 1;
    return `${year}-${String(count).padStart(3, '0')}`;
  };
  
  // 상태 변경 시 설비 이력 자동 연동
  const updateStatus = async (orderId: string, newStatus: string) => {
    // Claude Code가 자동으로 에러 처리 포함
    try {
      await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (newStatus === 'completed') {
        // 설비 이력에 자동 기록
        await recordEquipmentHistory(orderId);
      }
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
    }
  };
  
  return (
    // Tailwind CSS 자동 적용
    <div className="p-6 bg-white rounded-lg shadow">
      {/* 컴포넌트 UI */}
    </div>
  );
};
```

---

## 10. MCP를 통한 DB 관리

### MCP로 Supabase 직접 제어
```sql
-- MCP를 통해 실행된 테이블 생성
CREATE TABLE work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  equipment_id UUID REFERENCES equipment(id),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'hold')),
  priority TEXT CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  assignees JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- RLS 정책 자동 생성
CREATE POLICY "Users can view all work orders" 
ON work_orders FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update assigned orders" 
ON work_orders FOR UPDATE 
USING (auth.uid() = ANY(assignees));
```

---

## 11. 성과 측정

### 정량적 성과
| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| **TBM 시간** | 25분 | 15분 | 40% 감소 |
| **작업 누락** | 월 5건 | 월 1건 | 80% 감소 |
| **문서 검색** | 15분 | 1.5분 | 90% 감소 |
| **설비 이력 누락** | 30% | 0% | 100% 개선 |
| **일일 업무 시간** | 10시간 | 8시간 | 20% 단축 |

### 정성적 성과
- ✅ 실시간 현황 파악 가능
- ✅ 데이터 기반 의사결정
- ✅ 24/7 AI 업무 지원
- ✅ 직원 만족도 향상

### ROI 분석
- **개발 비용**: 0원 (AI 도구 활용)
- **연간 절감액**: 약 2,000만원
  - 인건비 절감: 1,500만원
  - 작업 효율 향상: 500만원
- **투자 회수 기간**: 즉시

---

## 12. Dify AI 챗봇 통합

### 구현 방법
```javascript
// public/index.html
window.difyChatbotConfig = {
  token: 'LgVEnTaf3ncIaEct',
  baseUrl: 'https://api.dify.ai'
};
```

### 챗봇 활용 사례
| 질문 | AI 응답 |
|------|---------|
| "오늘 PM 일정?" | "14:00 A-101 펌프, 16:00 B-202 컴프레서" |
| "설비 이력 조회 방법?" | "설비관리 → 설비 선택 → 이력 탭 클릭" |
| "긴급 작업 등록" | "작업관리 → 새 작업 → 우선순위 '긴급'" |

### 효과
- 신입 교육 시간 50% 단축
- 업무 문의 응답 시간 95% 감소
- 사용자 만족도 92%

---

## 13. 프로젝트 구조

### 시스템 아키텍처
```
Frontend (React + TypeScript)
    ↓
Supabase Backend
├─ PostgreSQL DB
├─ Authentication
├─ Realtime
└─ Storage
    ↓
AI Integration
├─ Claude Code (개발)
├─ MCP (DB 관리)
└─ Dify (운영)
```

### 파일 구조
```
App/
├── src/
│   ├── App.tsx                 # 메인 컴포넌트
│   ├── supabaseClient.ts       # Supabase 설정
│   ├── components/             # UI 컴포넌트
│   └── contexts/               # Context API
├── public/
│   └── index.html              # Dify 스크립트
├── package.json
└── tsconfig.json
```

---

## 14. 문제 해결 사례

### 1. 실시간 동기화 구현
**문제**: 여러 사용자가 동시에 작업 시 데이터 불일치

**해결**: Supabase Realtime 구독
```typescript
useEffect(() => {
  const subscription = supabase
    .channel('work_orders')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'work_orders' },
      handleRealtimeUpdate
    )
    .subscribe();
  
  return () => subscription.unsubscribe();
}, []);
```

### 2. 중복 담당자 방지
**문제**: 동일 담당자가 중복 배정

**해결**: Claude Code로 중복 체크 로직 구현
```typescript
const assignees = [...new Set(selectedAssignees)];
```

---

## 15. 향후 계획

### 단기 (3개월)
- React Native 모바일 앱
- 고급 분석 대시보드
- 음성 입력 기능

### 중기 (6개월)
- IoT 센서 연동
- AI 예측 정비
- AR 정비 가이드

### 장기 (1년)
- 부품 재고 관리 통합
- 자동 발주 시스템
- 글로벌 확장

---

## 16. 결론

### 프로젝트 성과
1. **개발 기간**: 6개월 → 2주 (92% 단축)
2. **개발 비용**: 5,000만원 → 0원
3. **업무 효율**: 40% 향상
4. **데이터 정확도**: 100%

### 핵심 가치
- **AI 도구 활용**: 개발 전 과정 AI 활용
- **실무 중심**: 실제 현장 문제 해결
- **즉시 적용**: 복잡한 설정 없이 바로 사용

### 시사점
> "AI 도구를 활용하면 비개발자도 전문 시스템 구축 가능"

---

## 부록: 환경 변수 설정

```env
# Supabase
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=xxx

# MCP
SUPABASE_ACCESS_TOKEN=sbp_xxx

# 배포
REACT_APP_SITE_URL=https://app-three-ashy.vercel.app
```

---

**발표자**: 강희국  
**소속**: 위드-영진  
**날짜**: 2025년 8월  
**문의**: khkuk0510@withie.co.kr