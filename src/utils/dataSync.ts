import { supabase } from '../supabaseClient';

// Supabase에서 데이터를 가져와서 상태를 초기화하는 함수들

// 담당자 목록 로드
export const loadAssigneesFromSupabase = async () => {
  try {
    console.log('🔍 assignees 테이블 접근 시도...');
    console.time('assignees-query');
    
    const queryPromise = supabase
      .from('assignees')
      .select('*')
      .order('name');
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('assignees 쿼리 타임아웃 (15초)')), 15000)
    );
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any;
    console.timeEnd('assignees-query');
    
    const { data, error } = result;
      
    if (error) {
      console.error('담당자 데이터 로드 오류:', error);
      return [];
    }
    
    console.log('✅ assignees 데이터 로드 성공:', data?.length || 0, '명');
    
    return data.filter((assignee: any) => assignee.is_active).map((assignee: any) => assignee.name);
  } catch (error) {
    console.error('담당자 데이터 로드 실패:', error);
    return [];
  }
};
export const loadPersonnelFromSupabase = async () => {
  try {
    console.log('🔍 personnel 테이블 접근 시도...');
    console.time('personnel-query');
    
    // 토큰 정보는 App.tsx에서 확인 (getSession 무한대기 방지)
    
    // SDK 응답 형태 디버깅
    console.log('🔧 Supabase SDK 버전 테스트 중...');
    
    const queryPromise = supabase
      .from('personnel')
      .select('*')
      .order('id');
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('personnel 쿼리 타임아웃 (15초)')), 15000)
    );
    
    const result = await Promise.race([queryPromise, timeoutPromise]) as any;
    console.timeEnd('personnel-query');
    
    console.log('🔍 SDK 응답 타입:', typeof result);
    console.log('🔍 SDK 응답 구조:', Object.keys(result));
    console.log('🔍 SDK 전체 응답:', result);
    
    const { data, error } = result;
      
    if (error) {
      console.error('인력 데이터 로드 오류:', error);
      console.error('오류 상세:', error.message, error.details, error.hint);
      console.error('🚨 에러 타입:', typeof error);
      return [];
    }
    
    console.log('✅ personnel 데이터 로드 성공:', data?.length || 0, '명');
    console.log('🔍 원본 데이터:', data);
    
    const mappedData = data.map((person: any) => ({
      id: person.id,
      name: person.name,
      position: person.position,
      field: person.field,
      phone: person.phone,
      hireDate: person.hire_date,
      certifications: person.certifications || [],
      accessHistory: person.access_history || []
    }));
    
    console.log('🔄 매핑된 데이터:', mappedData);
    return mappedData;
  } catch (err) {
    console.error('❌ loadPersonnelFromSupabase 예외:', err);
    return [];
  }
};

export const loadWorkOrdersFromSupabase = async () => {
  try {
    console.log('🔍 work_orders 테이블 접근 시도...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('작업 지시서 데이터 로드 오류:', error);
      console.error('오류 상세:', error.message, error.details, error.hint);
      return [];
    }
    
    console.log('✅ work_orders 데이터 로드 성공:', data?.length || 0, '건');
    
    return data.map((order: any) => ({
      id: order.id,
      title: order.title,
      equipment: order.equipment,
      equipmentName: order.equipment_name,
      description: order.description,
      requestDate: order.request_date,
      dueDate: order.due_date,
      workResult: order.work_result,
      status: order.status,
      assignee: order.assignee,
      completionNote: order.completion_note,
      attachments: order.attachments || [],
      type: order.type,
      tmNo: order.tm_no
    }));
  } catch (err) {
    console.error('❌ loadWorkOrdersFromSupabase 예외:', err);
    return [];
  }
};

export const loadSchedulesFromSupabase = async () => {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('date');
    
  if (error) {
    console.error('일정 데이터 로드 오류:', error);
    return [];
  }
  
  return data.map((schedule: any) => ({
    id: schedule.id,
    scheduleNumber: schedule.schedule_number,
    title: schedule.title,
    date: schedule.date,
    type: schedule.type,
    equipment: schedule.equipment,
    equipmentName: schedule.equipment_name,
    assignee: schedule.assignee,
    description: schedule.description
  }));
};

export const loadAnnouncementsFromSupabase = async () => {
  try {
    console.log('🔍 announcements 테이블 접근 시도...');
    
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) {
      console.error('공지사항 데이터 로드 오류:', error);
      console.error('오류 상세:', error.message, error.details, error.hint);
      return [];
    }
    
    console.log('✅ announcements 데이터 로드 성공:', data?.length || 0, '개');
    
    return data.map((announcement: any) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      date: announcement.date,
      author: announcement.author,
      priority: announcement.priority
    }));
  } catch (err) {
    console.error('❌ loadAnnouncementsFromSupabase 예외:', err);
    return [];
  }
};

export const loadEquipmentFromSupabase = async () => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('설비 데이터 로드 오류:', error);
    return [];
  }
  
  return data.map((equip: any) => ({
    id: equip.id,
    name: equip.name,
    model: equip.model,
    manufacturer: equip.manufacturer,
    status: equip.status,
    location: equip.location,
    specifications: equip.specifications || {}
  }));
};

export const loadAttendancesFromSupabase = async () => {
  const { data, error } = await supabase
    .from('attendances')
    .select('*')
    .order('date', { ascending: false });
    
  if (error) {
    console.error('근태 데이터 로드 오류:', error);
    return [];
  }
  
  return data.map((attendance: any) => ({
    id: attendance.id,
    personnelId: attendance.personnel_id,
    personnelName: attendance.personnel_name,
    date: attendance.date,
    type: attendance.type,
    note: attendance.note
  }));
};

export const loadDailyReportsFromSupabase = async () => {
  const { data, error } = await supabase
    .from('daily_reports')
    .select('*')
    .order('date', { ascending: false });
    
  if (error) {
    console.error('업무일지 데이터 로드 오류:', error);
    return [];
  }
  
  return data.map((report: any) => ({
    id: report.id,
    date: report.date,
    mechanical: {
      today: report.mechanical_today || '',
      tomorrow: report.mechanical_tomorrow || ''
    },
    youngjinMechanical: {
      today: report.youngjin_mechanical_today || '',
      tomorrow: report.youngjin_mechanical_tomorrow || ''
    },
    electrical: {
      today: report.electrical_today || '',
      tomorrow: report.electrical_tomorrow || ''
    },
    youngjinElectrical: {
      today: report.youngjin_electrical_today || '',
      tomorrow: report.youngjin_electrical_tomorrow || ''
    },
    control: {
      today: report.control_today || '',
      tomorrow: report.control_tomorrow || ''
    },
    youngjinControl: {
      today: report.youngjin_control_today || '',
      tomorrow: report.youngjin_control_tomorrow || ''
    },
    attendanceStatus: report.attendance_status || '',
    safetySlogan: report.safety_slogan || '',
    createdBy: report.created_by || '',
    createdAt: report.created_at,
    updatedAt: report.updated_at
  }));
};

// TM 현황 데이터를 Supabase에서 로드
export const loadTMStatusFromSupabase = async () => {
  try {
    console.log('🔍 tm_status 테이블 접근 시도...');
    
    const { data, error } = await supabase
      .from('tm_status')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('TM 현황 데이터 로드 오류:', error);
      return [];
    }
    
    console.log('✅ TM 현황 데이터 로드 성공:', data?.length, '개');
    
    return data.map((tm: any) => ({
      id: tm.id,
      tmNo: tm.tm_no,
      createdDate: tm.created_date,
      equipmentName: tm.equipment_name,
      description: tm.description,
      status: tm.status,
      createdBy: tm.created_by,
      assignee: tm.assignee,
      images: tm.images || [],
      pidLink: tm.pid_link,
      drawingLink: tm.drawing_link,
      faultCode: tm.fault_code,
      priority: tm.priority || '보통',
      changeManagementTask: tm.change_management_task,
      workRequest: tm.work_request,
      workDescription: tm.work_description,
      workSchedule: tm.work_schedule
    }));
  } catch (error) {
    console.error('TM 현황 데이터 로드 중 예외 발생:', error);
    return [];
  }
};