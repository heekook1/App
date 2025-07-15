-- Storage public 접근 허용
create policy "Allow public uploads"
on storage.objects
for insert
to anon
using (bucket_id = 'documents');

create policy "Allow public reads"
on storage.objects
for select
to anon
using (bucket_id = 'documents');