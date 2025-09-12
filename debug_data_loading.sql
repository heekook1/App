-- 앱에서 사용하는 정확한 쿼리 테스트

-- 1. personnel 테이블 (앱에서 사용하는 쿼리와 동일)
SELECT * FROM personnel ORDER BY id;

-- 2. announcements 테이블 (앱에서 사용하는 쿼리와 동일)
SELECT * FROM announcements ORDER BY date DESC;

-- 3. equipment 테이블 (앱에서 사용하는 쿼리와 동일)
SELECT * FROM equipment ORDER BY id;

-- 4. 네트워크 요청에서 사용할 수 있는 형태로 확인
SELECT 
  id,
  name,
  position,
  field,
  phone,
  hire_date,
  certifications,
  access_history
FROM personnel 
ORDER BY id;

SELECT 
  id,
  title,
  content,
  date,
  author,
  priority
FROM announcements 
ORDER BY date DESC;

-- 5. API 응답 형태 확인 (JSON)
SELECT json_agg(
  json_build_object(
    'id', id,
    'name', name,
    'position', position,
    'field', field,
    'phone', phone,
    'hireDate', hire_date,
    'certifications', certifications,
    'accessHistory', access_history
  )
) as personnel_json FROM personnel;

SELECT json_agg(
  json_build_object(
    'id', id,
    'title', title,
    'content', content,
    'date', date,
    'author', author,
    'priority', priority
  )
) as announcements_json FROM announcements;