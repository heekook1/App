-- documents 버킷 생성
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;