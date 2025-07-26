# 정비업체 관리 시스템 - 개발 가이드

## 📋 프로젝트 개요
정비업체를 위한 통합 관리 시스템으로 인력 관리, 작업 지시서, 일정 관리, 문서 관리, 공지사항 기능을 제공합니다.

## 🚀 회사 PC에서 작업 시작하기

### 1. 초기 환경 설정
```bash
# 1. 저장소 클론
git clone https://github.com/heekook1/App.git
cd App

# 2. Node.js 의존성 설치
npm install

# 3. 환경 변수 설정 (필요시)
# .env 파일을 생성하고 Supabase 설정 추가
```

### 2. 개발 서버 실행
```bash
# 개발 서버 시작
npm start

# 서버가 https://app-three-ashy.vercel.app 에서 실행됩니다
```

### 3. 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 타입 체크
npm run typecheck

# 린트 실행
npm run lint
```

## 🔧 기술 스택
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase
- **File Handling**: xlsx
- **Chatbot**: Dify

## 📁 프로젝트 구조
```
src/
├── App.tsx                    # 메인 애플리케이션 컴포넌트
├── supabaseClient.ts          # Supabase 설정
├── LoginPage.tsx              # 로그인 페이지
├── SignupPage.tsx             # 회원가입 페이지
├── ForgotPasswordPage.tsx     # 비밀번호 찾기 페이지
├── AuthCallback.tsx           # 이메일 인증 콜백 페이지
├── ResetPasswordPage.tsx      # 비밀번호 재설정 페이지
└── components/
    └── DifyChatbot.tsx        # Dify 챗봇 컴포넌트

public/
└── index.html                 # HTML 템플릿 (Dify 챗봇 스크립트 포함)
```

## 🔐 인증 시스템
### Supabase Authentication 사용
- 이메일/비밀번호 로그인
- 회원가입 시 이메일 인증 필요
- 이메일 인증 완료 후 **자동 로그인 방지** (사용자가 직접 로그인해야 함)
- JWT 토큰 기반 세션 관리

### 로그인 상태 관리
```javascript
// 로그인 상태 확인
const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
```

## 🤖 Dify 챗봇 통합
### 설정 정보
- **토큰**: `LgVEnTaf3ncIaEct`
- **위치**: 우측 하단 고정 버튼
- **크기**: 24rem × 40rem

### 표시 조건
- ✅ **로그인한 사용자에게만 표시**
- ❌ **로그인 페이지에서는 숨김**
- 🔄 **실시간 상태 변화 반영**

### CSS 조건부 스타일링
```css
/* 로그인하지 않은 상태에서 챗봇 숨김 */
body.unauthenticated #dify-chatbot-bubble-button,
body.unauthenticated #dify-chatbot-bubble-window {
  display: none !important;
}
```

## 📊 데이터 관리
### 로컬 스토리지 사용
- 인력 관리 데이터
- 작업 지시서 데이터
- 일정 관리 데이터
- 문서 관리 데이터 (Supabase Storage 연동)
- 공지사항 데이터

### Supabase Storage (문서 관리)
- 버킷명: `documents`
- 파일 업로드/다운로드 지원
- 파일 타입 제한 없음

## 🛠️ 주요 기능

### 1. 인력 관리
- 인력 추가/수정/삭제
- 자격증 관리
- 출입 이력 추가

### 2. 작업 지시서 관리
- 작업 지시서 생성/편집
- 상태 관리 (대기중, 진행중, 완료, 보류)
- 담당자 배정
- 첨부파일 지원

### 3. 일정 관리
- 달력 형태의 일정 표시
- 일정 추가/편집
- 장비별 일정 관리

### 4. 문서 관리
- 파일 업로드/다운로드
- 카테고리별 분류
- Supabase Storage 연동

### 5. 공지사항
- 우선순위별 공지 (긴급, 중요, 일반)
- 상세 내용 모달 표시

## 🔧 개발 팁

### 타입스크립트 에러 해결
```bash
# 타입 에러 확인
npm run typecheck

# 주요 타입 정의는 App.tsx 상단에 있음
```

### 스타일링
```bash
# Tailwind CSS 사용
# 클래스명은 기존 패턴을 따라 작성

# 주요 색상:
# - 파란색: bg-blue-600, text-blue-600
# - 회색: bg-gray-100, text-gray-600
# - 빨간색: bg-red-600, text-red-600
```

### Git 사용법
```bash
# 최신 변경사항 가져오기
git pull origin main

# 변경사항 커밋
git add .
git commit -m "feat: 기능 설명"
git push origin main
```

## ⚠️ 주의사항

### 1. 환경 변수
- Supabase URL과 API Key는 `src/supabaseClient.ts`에서 확인
- 민감한 정보는 절대 Git에 커밋하지 말것

### 2. 챗봇 관련
- Dify 챗봇 토큰이 하드코딩되어 있음
- 프로덕션 환경에서는 환경 변수로 관리 권장

### 3. 로컬 스토리지
- 브라우저 개발자 도구에서 Application > Local Storage에서 데이터 확인 가능
- 데이터 초기화가 필요하면 로컬 스토리지를 클리어

### 4. 이메일 인증
- 이메일 인증 후 **자동 로그인되지 않음** (의도된 동작)
- 사용자가 인증 완료 후 직접 로그인해야 함

## 🐛 트러블슈팅

### 챗봇이 나타나지 않는 경우
1. 브라우저 콘솔에서 에러 확인
2. 네트워크 탭에서 `embed.min.js` 로드 확인
3. `body` 태그에 `authenticated` 클래스가 있는지 확인

### 빌드 에러 발생시
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 클리어
npm start -- --reset-cache
```

### Supabase 연결 문제
1. `src/supabaseClient.ts`에서 URL과 Key 확인
2. 네트워크 연결 상태 확인
3. Supabase 프로젝트 상태 확인

## 📞 연락처
개발 관련 문의나 문제 발생시 언제든 연락 주세요!

---
**Last Updated**: 2025년 7월 21일  
**Version**: 1.0.0  
**Developer**: Claude + User Collaboration