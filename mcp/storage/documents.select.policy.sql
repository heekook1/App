-- 로그인된 사용자가 파일 목록 조회 가능
create policy "Allow list documents"
on storage.objects
for select
to authenticated
using (bucket_id = 'documents' and auth.role() = 'authenticated');