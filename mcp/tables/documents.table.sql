-- 문서 메타데이터 저장 테이블
create table if not exists public.documents (
  id bigserial primary key,
  filename text not null,
  path text not null,
  category text,
  uploader text,
  uploaded_at timestamp with time zone default now()
);