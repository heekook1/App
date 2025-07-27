import { supabase } from '../supabaseClient';

// Supabase에서 데이터를 가져와서 상태를 초기화하는 함수들
export const loadPersonnelFromSupabase = async () => {
  try {
    console.log('🔍 personnel 테이블 접근 시도...');
    
    // 타임아웃 제거하고 실제 에러 확인
    console.log('🌐 Supabase 연결 확인 중...');
    
    const { data, error } = await supabase
      .from('personnel')
      .select('*')
      .order('id');
      
    if (error) {
      console.error('❌ 인력 데이터 로드 오류:', error);
      console.error('❌ 에러 상세:', JSON.stringify(error, null, 2));
      return [];
    }
    
    console.log('✅ personnel 테이뺔 접근 성공, 데이터:', data?.length || 0, '건');
    
    // 데이터가 없으면 빈 배열 반환
    if (!data || data.length === 0) {
      console.log('📌 personnel 테이블이 비어있음 - 빈 배열 반환');
      return [];
    }
    
    return data.map((person: any) => ({
      id: person.id,
      name: person.name,
      position: person.position,
      field: person.field,
      phone: person.phone,
      hireDate: person.hire_date,
      certifications: person.certifications || [],
      accessHistory: person.access_history || []
    }));
  } catch (err) {
    console.error('❌ loadPersonnelFromSupabase 예외:', err);
    return [];
  }
};

export const loadWorkOrdersFromSupabase = async () => {
  const { data, error } = await supabase
    .from('work_orders')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('작업 지시서 데이터 로드 오류:', error);
    return [];
  }
  
  return data.map(order => ({
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
    type: order.type
  }));
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
  
  return data.map(schedule => ({
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
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('공지사항 데이터 로드 오류:', error);
    return [];
  }
  
  return data.map(announcement => ({
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    date: announcement.date,
    author: announcement.author,
    priority: announcement.priority
  }));
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
  
  return data.map(equip => ({
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
  
  return data.map(attendance => ({
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
  
  return data.map(report => ({
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