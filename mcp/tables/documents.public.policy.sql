-- 임시: RLS 비활성화 또는 public 접근 허용
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- 또는 public 접근 허용 정책
-- create policy "Allow public read"
-- on documents
-- for select
-- to anon
-- using (true);

-- create policy "Allow public insert"
-- on documents
-- for insert
-- to anon
-- with check (true);