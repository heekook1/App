import { supabase } from '../supabaseClient';

// localStorage 데이터를 Supabase로 마이그레이션하는 함수
export const migrateDataToSupabase = async () => {
  console.log('🚀 데이터 마이그레이션 시작...');
  
  try {
    // 1. 인력 데이터 마이그레이션
    const personnelData = localStorage.getItem('personnel');
    if (personnelData) {
      const personnel = JSON.parse(personnelData);
      if (Array.isArray(personnel) && personnel.length > 0) {
        console.log(`📋 인력 데이터 ${personnel.length}건 마이그레이션 중...`);
        
        for (const person of personnel) {
          const { error } = await supabase
            .from('personnel')
            .upsert({
              id: person.id,
              name: person.name,
              position: person.position,
              field: person.field,
              phone: person.phone,
              hire_date: person.hireDate,
              certifications: person.certifications,
              access_history: person.accessHistory
            }, { onConflict: 'id' });
            
          if (error) console.error('인력 마이그레이션 오류:', error);
        }
      }
    }

    // 2. 작업 지시서 데이터 마이그레이션
    const workOrdersData = localStorage.getItem('workOrders');
    if (workOrdersData) {
      const workOrders = JSON.parse(workOrdersData);
      if (Array.isArray(workOrders) && workOrders.length > 0) {
        console.log(`🔧 작업 지시서 ${workOrders.length}건 마이그레이션 중...`);
        
        for (const order of workOrders) {
          const { error } = await supabase
            .from('work_orders')
            .upsert({
              id: order.id,
              title: order.title,
              equipment: order.equipment,
              equipment_name: order.equipmentName,
              description: order.description,
              request_date: order.requestDate,
              due_date: order.dueDate,
              work_result: order.workResult,
              status: order.status,
              assignee: order.assignee,
              completion_note: order.completionNote,
              attachments: order.attachments || [],
              type: order.type
            }, { onConflict: 'id' });
            
          if (error) console.error('작업 지시서 마이그레이션 오류:', error);
        }
      }
    }

    // 3. 일정 데이터 마이그레이션
    const schedulesData = localStorage.getItem('schedules');
    if (schedulesData) {
      const schedules = JSON.parse(schedulesData);
      if (Array.isArray(schedules) && schedules.length > 0) {
        console.log(`📅 일정 ${schedules.length}건 마이그레이션 중...`);
        
        for (const schedule of schedules) {
          const { error } = await supabase
            .from('schedules')
            .upsert({
              id: schedule.id,
              schedule_number: schedule.scheduleNumber,
              title: schedule.title,
              date: schedule.date,
              type: schedule.type,
              equipment: schedule.equipment,
              equipment_name: schedule.equipmentName,
              assignee: schedule.assignee,
              description: schedule.description
            }, { onConflict: 'id' });
            
          if (error) console.error('일정 마이그레이션 오류:', error);
        }
      }
    }

    // 4. 공지사항 데이터 마이그레이션
    const announcementsData = localStorage.getItem('announcements');
    if (announcementsData) {
      const announcements = JSON.parse(announcementsData);
      if (Array.isArray(announcements) && announcements.length > 0) {
        console.log(`📢 공지사항 ${announcements.length}건 마이그레이션 중...`);
        
        for (const announcement of announcements) {
          const { error } = await supabase
            .from('announcements')
            .upsert({
              id: announcement.id,
              title: announcement.title,
              content: announcement.content,
              date: announcement.date,
              author: announcement.author,
              priority: announcement.priority
            }, { onConflict: 'id' });
            
          if (error) console.error('공지사항 마이그레이션 오류:', error);
        }
      }
    }

    // 5. 설비 데이터 마이그레이션
    const equipmentData = localStorage.getItem('equipment');
    if (equipmentData) {
      const equipment = JSON.parse(equipmentData);
      if (Array.isArray(equipment) && equipment.length > 0) {
        console.log(`⚙️ 설비 ${equipment.length}건 마이그레이션 중...`);
        
        for (const equip of equipment) {
          const { error } = await supabase
            .from('equipment')
            .upsert({
              id: equip.id,
              name: equip.name,
              model: equip.model,
              manufacturer: equip.manufacturer,
              status: equip.status,
              location: equip.location,
              specifications: equip.specifications
            }, { onConflict: 'id' });
            
          if (error) console.error('설비 마이그레이션 오류:', error);
        }
      }
    }

    // 6. 근태 데이터 마이그레이션
    const attendancesData = localStorage.getItem('attendances');
    if (attendancesData) {
      const attendances = JSON.parse(attendancesData);
      if (Array.isArray(attendances) && attendances.length > 0) {
        console.log(`📊 근태 ${attendances.length}건 마이그레이션 중...`);
        
        for (const attendance of attendances) {
          const { error } = await supabase
            .from('attendances')
            .insert({
              personnel_id: attendance.personnelId,
              personnel_name: attendance.personnelName,
              date: attendance.date,
              type: attendance.type,
              note: attendance.note
            });
            
          if (error) console.error('근태 마이그레이션 오류:', error);
        }
      }
    }

    // 7. 업무일지 데이터 마이그레이션
    const dailyReportsData = localStorage.getItem('dailyReports');
    if (dailyReportsData) {
      const dailyReports = JSON.parse(dailyReportsData);
      if (Array.isArray(dailyReports) && dailyReports.length > 0) {
        console.log(`📝 업무일지 ${dailyReports.length}건 마이그레이션 중...`);
        
        for (const report of dailyReports) {
          const { error } = await supabase
            .from('daily_reports')
            .insert({
              date: report.date,
              mechanical_today: report.mechanical?.today,
              mechanical_tomorrow: report.mechanical?.tomorrow,
              youngjin_mechanical_today: report.youngjinMechanical?.today,
              youngjin_mechanical_tomorrow: report.youngjinMechanical?.tomorrow,
              electrical_today: report.electrical?.today,
              electrical_tomorrow: report.electrical?.tomorrow,
              youngjin_electrical_today: report.youngjinElectrical?.today,
              youngjin_electrical_tomorrow: report.youngjinElectrical?.tomorrow,
              control_today: report.control?.today,
              control_tomorrow: report.control?.tomorrow,
              youngjin_control_today: report.youngjinControl?.today,
              youngjin_control_tomorrow: report.youngjinControl?.tomorrow,
              attendance_status: report.attendanceStatus,
              safety_slogan: report.safetySlogan,
              created_by: report.createdBy
            });
            
          if (error) console.error('업무일지 마이그레이션 오류:', error);
        }
      }
    }

    console.log('✅ 데이터 마이그레이션 완료!');
    return true;
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    return false;
  }
};

// Supabase에서 데이터를 가져와서 상태를 초기화하는 함수들
export const loadPersonnelFromSupabase = async () => {
  const { data, error } = await supabase
    .from('personnel')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('인력 데이터 로드 오류:', error);
    return [];
  }
  
  return data.map(person => ({
    id: person.id,
    name: person.name,
    position: person.position,
    field: person.field,
    phone: person.phone,
    hireDate: person.hire_date,
    certifications: person.certifications || [],
    accessHistory: person.access_history || []
  }));
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