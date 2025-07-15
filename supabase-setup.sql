-- Documents 테이블 생성
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- RLS 활성화
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 설정 (개발용)
CREATE POLICY "Allow all operations for documents" ON documents
  FOR ALL USING (true) WITH CHECK (true);

-- Storage 버킷 생성을 위한 SQL (실제로는 Supabase 대시보드에서 해야 함)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', true);

-- Storage 정책 설정 (실제로는 Supabase 대시보드에서 해야 함)
-- CREATE POLICY "Allow all operations for documents bucket" ON storage.objects
--   FOR ALL USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');