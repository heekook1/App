-- 로그인된 사용자가 문서 정보 조회 가능
create policy "Allow read"
on documents
for select
to authenticated
using (true);