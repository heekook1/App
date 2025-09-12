-- 로그인된 사용자가 파일 업로드 가능
create policy "Allow uploads"
on storage.objects
for insert
to authenticated
using (bucket_id = 'documents' and auth.role() = 'authenticated');