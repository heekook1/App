-- 문서 정보 저장 테이블 생성
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by TEXT,
  description TEXT,
  tags TEXT[],
  category TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at ON documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);

-- RLS 정책 활성화
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 생성
CREATE POLICY "Enable read access for all users" ON documents
  FOR SELECT USING (true);

-- 모든 사용자가 삽입할 수 있도록 정책 생성  
CREATE POLICY "Enable insert for all users" ON documents
  FOR INSERT WITH CHECK (true);

-- 모든 사용자가 자신의 문서를 수정할 수 있도록 정책 생성
CREATE POLICY "Enable update for all users" ON documents
  FOR UPDATE USING (true);

-- 모든 사용자가 자신의 문서를 삭제할 수 있도록 정책 생성
CREATE POLICY "Enable delete for all users" ON documents
  FOR DELETE USING (true);

-- Storage 버킷은 Supabase 대시보드에서 직접 생성해야 합니다:
-- 1. Supabase 대시보드로 이동
-- 2. Storage 섹션으로 이동
-- 3. "New bucket" 클릭
-- 4. 버킷 이름: "documents"
-- 5. Public 버킷: 체크 해제 (비공개)
-- 6. 생성