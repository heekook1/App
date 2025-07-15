-- 테이블 INSERT 정책
create policy "Allow insert"
on documents
for insert
to authenticated
with check (true);