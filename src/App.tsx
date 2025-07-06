import { useState } from 'react';
import * as React from 'react';
import { Calendar, Users, Settings, FileText, MessageSquare, Wrench, Home, Plus, Edit, Trash2 } from 'lucide-react';

// Type definitions
interface Personnel {
  id: number;
  name: string;
  position: string;
  field: string;
  phone: string;
  hireDate: string;
  certifications: string[];
  accessHistory: string[];
}

interface WorkOrder {
  id: string;
  title: string;
  equipment: string;
  equipmentName: string;
  description: string;
  requestDate: string;
  dueDate: string;
  status: string;
  assignee: string;
  completionNote: string;
  attachments: any[];
  type: string;
}

interface Schedule {
  id: number;
  scheduleNumber: string;
  title: string;
  date: string;
  type: string;
  equipment: string;
  equipmentName: string;
  assignee: string;
  description: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: string;
}

interface Equipment {
  id: number;
  name: string;
  model: string;
  manufacturer: string;
  status: string;
  location: string;
  specifications: any;
  installDate?: string;
}

const MaintenanceManagementSystem = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Load data from localStorage
  const loadFromStorage = <T,>(key: string, defaultData: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultData;
    } catch {
      return defaultData;
    }
  };

  const saveToStorage = <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  };

  // Sample data - in real app this would come from backend
  const [personnel, setPersonnel] = useState<Personnel[]>(() => 
    loadFromStorage('personnel', [
    {
      id: 1,
      name: '한희명',
      position: '과장',
      field: '전기',
      phone: '010-1111-2222',
      hireDate: '2021-03-15',
      certifications: ['전기기사', '전기기능사'],
      accessHistory: ['2024-06-30', '2024-07-01']
    },
    {
      id: 2,
      name: '이상경',
      position: '대리',
      field: '기계',
      phone: '010-3333-4444',
      hireDate: '2022-07-20',
      certifications: ['기계정비산업기사'],
      accessHistory: ['2024-06-29', '2024-06-30']
    },
    {
      id: 3,
      name: '김태연',
      position: '팀장',
      field: '제어',
      phone: '010-5555-6666',
      hireDate: '2020-11-10',
      certifications: ['제어산업기사'],
      accessHistory: ['2024-06-28', '2024-06-30', '2024-07-01']
    },
    {
      id: 4,
      name: '이중원',
      position: '사원',
      field: '기계',
      phone: '010-7777-8888',
      hireDate: '2023-02-01',
      certifications: ['기계정비기능사'],
      accessHistory: ['2024-06-29']
    }
  ])
  );

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => 
    loadFromStorage('workOrders', [
    {
      id: '25-1',
      title: '오일필터 교체',
      equipment: '터빈',
      equipmentName: 'T-3000',
      description: '오일필터 정기 교체',
      requestDate: '2025-06-01',
      dueDate: '2025-06-02',
      status: '완료',
      assignee: '한희명',
      completionNote: '정상 교체 완료',
      attachments: [],
      type: '기계'
    },
    {
      id: '25-2',
      title: '밸브 교정',
      equipment: '보일러',
      equipmentName: 'B-2500',
      description: '압력 밸브 교정',
      requestDate: '2025-06-03',
      dueDate: '2025-06-05',
      status: '진행중',
      assignee: '이상경',
      completionNote: '',
      attachments: [],
      type: '기계'
    },
    {
      id: '25-3',
      title: '케이블 점검',
      equipment: '발전기',
      equipmentName: 'G-1800',
      description: '전원 케이블 절연 점검',
      requestDate: '2025-06-04',
      dueDate: '2025-06-06',
      status: '진행중',
      assignee: '김태연',
      completionNote: '',
      attachments: [],
      type: '전기'
    }
  ])
  );

  const [schedules, setSchedules] = useState<Schedule[]>(() => 
    loadFromStorage('schedules', [
    {
      id: 1,
      scheduleNumber: '25-1',
      title: '터빈 정기점검',
      date: '2025-07-02',
      type: '기계',
      equipment: '터빈',
      equipmentName: 'T-3000',
      assignee: '한희명',
      description: '정기점검'
    },
    {
      id: 2,
      scheduleNumber: '25-2',
      title: '보일러 점검',
      date: '2025-07-05',
      type: '기계',
      equipment: '보일러',
      equipmentName: 'B-2500',
      assignee: '이상경',
      description: '압력 점검'
    }
  ])
  );

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => 
    loadFromStorage('announcements', [
    {
      id: 1,
      title: '안전교육 실시 안내',
      content: '다음 주 월요일 오전 10시 안전교육을 실시합니다.',
      date: '2025-06-29',
      author: '관리자',
      priority: 'important'
    },
    {
      id: 2,
      title: '정기점검 일정 공지',
      content: '7월 첫째 주 정기점검 일정을 확인해주세요.',
      date: '2025-06-28',
      author: '관리자',
      priority: 'normal'
    }
  ])
  );

  const [equipment, setEquipment] = useState<Equipment[]>(() => 
    loadFromStorage('equipment', [
    {
      id: 1,
      name: 'T-3000',
      model: 'Turbine-3000',
      manufacturer: 'TurboTech',
      status: '정상',
      location: '발전동 1층',
      specifications: {
        power: '3000kW',
        type: '스팀터빈',
        fuel: '천연가스'
      }
    },
    {
      id: 2,
      name: 'B-2500',
      model: 'Boiler-2500',
      manufacturer: 'HeatSys',
      status: '점검중',
      location: '보일러실',
      specifications: {
        pressure: '25bar',
        temperature: '400°C',
        output: '2500kW'
      }
    }
  ])
  );

  // Generate work order number based on current year
  const generateWorkOrderId = () => {
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // 25, 26, etc.
    
    // Find existing work orders for current year
    const currentYearOrders = workOrders.filter(order => 
      order.id.startsWith(`${yearSuffix}-`)
    );
    
    const nextNumber = currentYearOrders.length + 1;
    return `${yearSuffix}-${nextNumber}`;
  };

  // Calculate maintenance dates for equipment
  const getMaintenanceDates = (equipmentName: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all work orders for this equipment (both completed and planned)
    const equipmentOrders = workOrders.filter(order => 
      order.equipment === equipmentName
    );
    
    let lastMaintenance = null;
    let nextMaintenance = null;
    
    if (equipmentOrders.length > 0) {
      // Get dates and sort them
      const dates = equipmentOrders.map(order => new Date(order.dueDate));
      dates.sort((a, b) => a.getTime() - b.getTime());
      
      // Find last maintenance (most recent completed work before or on today)
      const completedOrders = equipmentOrders.filter(order => order.status === '완료');
      if (completedOrders.length > 0) {
        const completedDates = completedOrders.map(order => new Date(order.dueDate));
        const pastCompleted = completedDates.filter(date => date <= today);
        if (pastCompleted.length > 0) {
          pastCompleted.sort((a, b) => b.getTime() - a.getTime());
          lastMaintenance = pastCompleted[0];
        }
      }
      
      // Find next maintenance (earliest planned work after today)
      const futureDates = dates.filter(date => date > today);
      if (futureDates.length > 0) {
        nextMaintenance = futureDates[0];
      }
    }
    
    return {
      lastMaintenance: lastMaintenance ? lastMaintenance.toISOString().split('T')[0] : null,
      nextMaintenance: nextMaintenance ? nextMaintenance.toISOString().split('T')[0] : null
    };
  };

  // Get maintenance history for equipment
  const getMaintenanceHistory = (equipmentName: string) => {
    return workOrders.filter(order => 
      order.equipment === equipmentName
    ).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  };

  // Save data to localStorage whenever state changes
  React.useEffect(() => {
    saveToStorage('personnel', personnel);
  }, [personnel]);

  React.useEffect(() => {
    saveToStorage('workOrders', workOrders);
  }, [workOrders]);

  React.useEffect(() => {
    saveToStorage('schedules', schedules);
  }, [schedules]);

  React.useEffect(() => {
    saveToStorage('announcements', announcements);
  }, [announcements]);

  React.useEffect(() => {
    saveToStorage('equipment', equipment);
  }, [equipment]);

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료': return 'bg-green-100 text-green-800';
      case '진행중': return 'bg-blue-100 text-blue-800';
      case '대기': return 'bg-yellow-100 text-yellow-800';
      case '지연': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'important': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case '정상': return 'bg-green-100 text-green-800';
      case '점검중': return 'bg-yellow-100 text-yellow-800';
      case '고장': return 'bg-red-100 text-red-800';
      case '정지': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Navigation
  const renderNavigation = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">정비 관리 시스템</h1>
          </div>
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: '대시보드', icon: Home },
              { id: 'schedule', label: '작업 일정', icon: Calendar },
              { id: 'workorder', label: '작업 관리', icon: Wrench },
              { id: 'personnel', label: '인력관리', icon: Users },
              { id: 'equipment', label: '설비관리', icon: Settings },
              { id: 'documents', label: '문서관리', icon: FileText },
              { id: 'announcements', label: '공지사항', icon: MessageSquare },
              { id: 'chat', label: '실시간 소통', icon: MessageSquare }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  // Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: '전체 작업', value: workOrders.length, color: 'bg-blue-500' },
          { title: '진행중 작업', value: workOrders.filter(w => w.status === '진행중').length, color: 'bg-yellow-500' },
          { title: '완료된 작업', value: workOrders.filter(w => w.status === '완료').length, color: 'bg-green-500' },
          { title: '전체 인력', value: personnel.length, color: 'bg-purple-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${stat.color}`}>
                <div className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">최근 작업</h3>
          <div className="space-y-3">
            {workOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-sm">{order.title}</p>
                  <p className="text-xs text-gray-500">{order.equipment} - {order.assignee}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">최근 공지사항</h3>
          <div className="space-y-3">
            {announcements.slice(0, 5).map(announcement => (
              <div key={announcement.id} className="p-3 border rounded hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">{announcement.title}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority === 'urgent' ? '긴급' :
                     announcement.priority === 'important' ? '중요' : '일반'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{announcement.date} - {announcement.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Schedule Management
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    date: '',
    type: '기계',
    equipment: '',
    equipmentName: '',
    assignee: '',
    description: ''
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchedule) {
      setSchedules(prev => prev.map(schedule => 
        schedule.id === editingSchedule.id 
          ? { ...schedule, ...scheduleForm, scheduleNumber: schedule.scheduleNumber }
          : schedule
      ));
      setEditingSchedule(null);
    } else {
      const newSchedule: Schedule = {
        id: Math.max(...schedules.map(s => s.id), 0) + 1,
        scheduleNumber: `25-${schedules.length + 1}`,
        ...scheduleForm
      };
      setSchedules(prev => [...prev, newSchedule]);
    }
    setShowScheduleForm(false);
    setScheduleForm({
      title: '',
      date: '',
      type: '기계',
      equipment: '',
      equipmentName: '',
      assignee: '',
      description: ''
    });
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      title: schedule.title,
      date: schedule.date,
      type: schedule.type,
      equipment: schedule.equipment,
      equipmentName: schedule.equipmentName,
      assignee: schedule.assignee,
      description: schedule.description
    });
    setShowScheduleForm(true);
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };

  // Calendar helper functions
  const getCurrentMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(getCurrentMonth());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSchedulesForDate = (date: string) => {
    return workOrders.filter(order => order.dueDate === date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '기계': return 'bg-purple-200 text-purple-800';
      case '전기': return 'bg-sky-200 text-sky-800';
      case '제어': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const formatCalendarDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentCalendarMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(currentCalendarMonth);
    const firstDay = getFirstDayOfMonth(currentCalendarMonth);
    
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    const calendarDays = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-20 border border-gray-200"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatCalendarDate(year, month, day);
      const daySchedules = getSchedulesForDate(dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      calendarDays.push(
        <div key={day} className={`h-20 border border-gray-200 p-1 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {daySchedules.slice(0, 2).map(schedule => (
              <div
                key={schedule.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${getTypeColor(schedule.type)}`}
                title={`${schedule.title} - ${schedule.assignee} (${schedule.type})`}
              >
                {schedule.title}
              </div>
            ))}
            {daySchedules.length > 2 && (
              <div className="text-xs text-gray-500">
                +{daySchedules.length - 2}개 더
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h3 className="text-lg font-semibold">
            {year}년 {monthNames[month]}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
        
        <div className="grid grid-cols-7">
          {dayNames.map(dayName => (
            <div key={dayName} className="p-2 border-b border-gray-200 text-center text-sm font-medium text-gray-700">
              {dayName}
            </div>
          ))}
          {calendarDays}
        </div>
      </div>
    );
  };

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">작업 일정</h2>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            일정 추가
          </button>
        </div>
        
        {/* Calendar View */}
        <div className="mb-6">
          {renderCalendar()}
        </div>
        
        {showScheduleForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">{editingSchedule ? '일정 수정' : '새 일정 추가'}</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="일정 제목"
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="기계">기계</option>
                  <option value="전기">전기</option>
                  <option value="제어">제어</option>
                </select>
                <select
                  value={scheduleForm.equipment}
                  onChange={(e) => {
                    setScheduleForm(prev => ({ 
                      ...prev, 
                      equipment: e.target.value
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">설비 선택</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.name}>{eq.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="기기명"
                  value={scheduleForm.equipmentName}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, equipmentName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <select
                  value={scheduleForm.assignee}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, assignee: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">담당자 선택</option>
                  {personnel.map(person => (
                    <option key={person.id} value={person.name}>{person.name}</option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="일정 설명"
                value={scheduleForm.description}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSchedule ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowScheduleForm(false);
                    setEditingSchedule(null);
                    setScheduleForm({
                      title: '',
                      date: '',
                      type: '기계',
                      equipment: '',
                      equipmentName: '',
                      assignee: '',
                      description: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div>
          <h3 className="font-medium text-lg mb-3">작업 목록</h3>
          <div className="space-y-4">
            {workOrders.map(order => (
              <div key={order.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                        {order.id}
                      </span>
                      <h3 className="font-medium">{order.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{order.description}</p>
                    <p className="text-sm text-gray-500">{order.equipment} ({order.equipmentName}) - {order.assignee}</p>
                    <p className="text-sm text-gray-500">작업일: {order.dueDate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                      {order.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Work Order Management
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [workOrderForm, setWorkOrderForm] = useState({
    title: '',
    equipment: '',
    equipmentName: '',
    description: '',
    dueDate: '',
    assignee: '',
    type: '기계'
  });

  const handleWorkOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorkOrder) {
      setWorkOrders(prev => prev.map(order => 
        order.id === editingWorkOrder.id 
          ? { ...order, ...workOrderForm, requestDate: new Date().toISOString().split('T')[0] }
          : order
      ));
      setEditingWorkOrder(null);
    } else {
      const newOrder: WorkOrder = {
        id: generateWorkOrderId(),
        ...workOrderForm,
        requestDate: new Date().toISOString().split('T')[0],
        status: '대기',
        completionNote: '',
        attachments: []
      };
      setWorkOrders(prev => [...prev, newOrder]);
    }
    setShowWorkOrderForm(false);
    setWorkOrderForm({
      title: '',
      equipment: '',
      equipmentName: '',
      description: '',
      dueDate: '',
      assignee: '',
      type: '기계'
    });
  };

  const handleEditWorkOrder = (order: WorkOrder) => {
    setEditingWorkOrder(order);
    setWorkOrderForm({
      title: order.title,
      equipment: order.equipment,
      equipmentName: order.equipmentName,
      description: order.description,
      dueDate: order.dueDate,
      assignee: order.assignee,
      type: order.type
    });
    setShowWorkOrderForm(true);
  };

  const handleDeleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(order => order.id !== id));
  };

  const handleUpdateWorkOrderStatus = (id: string, status: string) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status } : order
    ));
  };

  const renderWorkOrder = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">작업 관리</h2>
          <button
            onClick={() => setShowWorkOrderForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            작업 등록
          </button>
        </div>
        
        {showWorkOrderForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">{editingWorkOrder ? '작업 수정' : '새 작업 등록'}</h3>
            <form onSubmit={handleWorkOrderSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="작업 제목"
                  value={workOrderForm.title}
                  onChange={(e) => setWorkOrderForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <select
                  value={workOrderForm.equipment}
                  onChange={(e) => {
                    setWorkOrderForm(prev => ({ 
                      ...prev, 
                      equipment: e.target.value
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">설비 선택</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.name}>{eq.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="기기명"
                  value={workOrderForm.equipmentName}
                  onChange={(e) => setWorkOrderForm(prev => ({ ...prev, equipmentName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="date"
                  value={workOrderForm.dueDate}
                  onChange={(e) => setWorkOrderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  placeholder="작업일"
                />
                <select
                  value={workOrderForm.assignee}
                  onChange={(e) => setWorkOrderForm(prev => ({ ...prev, assignee: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">담당자 선택</option>
                  {personnel.map(person => (
                    <option key={person.id} value={person.name}>{person.name}</option>
                  ))}
                </select>
                <select
                  value={workOrderForm.type}
                  onChange={(e) => setWorkOrderForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="기계">기계</option>
                  <option value="전기">전기</option>
                  <option value="제어">제어</option>
                </select>
              </div>
              <textarea
                placeholder="작업 설명"
                value={workOrderForm.description}
                onChange={(e) => setWorkOrderForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingWorkOrder ? '수정' : '생성'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowWorkOrderForm(false);
                    setEditingWorkOrder(null);
                    setWorkOrderForm({
                      title: '',
                      equipment: '',
                      equipmentName: '',
                      description: '',
                      dueDate: '',
                      assignee: '',
                      type: '기계'
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">번호</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">작업명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">설비명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">기기명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">등록일</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">작업일</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">상태</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">담당자</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">관리</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b text-sm font-mono">{order.id}</td>
                  <td className="px-4 py-2 border-b text-sm font-medium">{order.title}</td>
                  <td className="px-4 py-2 border-b text-sm">{order.equipment}</td>
                  <td className="px-4 py-2 border-b text-sm">{order.equipmentName}</td>
                  <td className="px-4 py-2 border-b text-sm">{order.requestDate}</td>
                  <td className="px-4 py-2 border-b text-sm">{order.dueDate}</td>
                  <td className="px-4 py-2 border-b text-sm">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateWorkOrderStatus(order.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                    >
                      <option value="대기">대기</option>
                      <option value="진행중">진행중</option>
                      <option value="완료">완료</option>
                      <option value="지연">지연</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border-b text-sm">{order.assignee}</td>
                  <td className="px-4 py-2 border-b text-sm">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditWorkOrder(order)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWorkOrder(order.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Personnel Management
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [personnelForm, setPersonnelForm] = useState({
    name: '',
    position: '',
    field: '',
    phone: '',
    hireDate: '',
    certifications: [] as string[]
  });
  const [newCertification, setNewCertification] = useState('');

  const handlePersonnelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPersonnel) {
      setPersonnel(prev => prev.map(person => 
        person.id === editingPersonnel.id 
          ? { ...person, ...personnelForm, accessHistory: person.accessHistory }
          : person
      ));
      setEditingPersonnel(null);
    } else {
      const newPerson: Personnel = {
        id: Math.max(...personnel.map(p => p.id), 0) + 1,
        ...personnelForm,
        accessHistory: []
      };
      setPersonnel(prev => [...prev, newPerson]);
    }
    setShowPersonnelForm(false);
    setPersonnelForm({
      name: '',
      position: '',
      field: '',
      phone: '',
      hireDate: '',
      certifications: []
    });
  };

  const handleEditPersonnel = (person: Personnel) => {
    setEditingPersonnel(person);
    setPersonnelForm({
      name: person.name,
      position: person.position,
      field: person.field,
      phone: person.phone,
      hireDate: person.hireDate,
      certifications: [...person.certifications]
    });
    setShowPersonnelForm(true);
  };

  const handleDeletePersonnel = (id: number) => {
    setPersonnel(prev => prev.filter(person => person.id !== id));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setPersonnelForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setPersonnelForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const renderPersonnel = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">인력 관리</h2>
          <button
            onClick={() => setShowPersonnelForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            인력 추가
          </button>
        </div>
        
        {showPersonnelForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">{editingPersonnel ? '인력 정보 수정' : '새 인력 추가'}</h3>
            <form onSubmit={handlePersonnelSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="이름"
                  value={personnelForm.name}
                  onChange={(e) => setPersonnelForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="직급"
                  value={personnelForm.position}
                  onChange={(e) => setPersonnelForm(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <select
                  value={personnelForm.field}
                  onChange={(e) => setPersonnelForm(prev => ({ ...prev, field: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">분야 선택</option>
                  <option value="전기">전기</option>
                  <option value="기계">기계</option>
                  <option value="제어">제어</option>
                </select>
                <input
                  type="tel"
                  placeholder="연락처"
                  value={personnelForm.phone}
                  onChange={(e) => setPersonnelForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <input
                  type="date"
                  value={personnelForm.hireDate}
                  onChange={(e) => setPersonnelForm(prev => ({ ...prev, hireDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">자격증</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="자격증 입력"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                  />
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {personnelForm.certifications.map((cert, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex items-center gap-1">
                      {cert}
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPersonnel ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPersonnelForm(false);
                    setEditingPersonnel(null);
                    setPersonnelForm({
                      name: '',
                      position: '',
                      field: '',
                      phone: '',
                      hireDate: '',
                      certifications: []
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="space-y-4">
          {personnel.map(person => (
            <div key={person.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{person.name}</h3>
                  <p className="text-sm text-gray-600">{person.position} - {person.field}분야</p>
                  <p className="text-sm text-gray-500">연락처: {person.phone}</p>
                  <p className="text-sm text-gray-500">입사일: {person.hireDate}</p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">보유 자격증:</p>
                    <div className="flex flex-wrap gap-1">
                      {person.certifications.map((cert, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditPersonnel(person)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePersonnel(person.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Equipment Management
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    model: '',
    manufacturer: '',
    status: '정상',
    location: '',
    specifications: {} as any,
    installDate: ''
  });
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const handleEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipment) {
      setEquipment(prev => prev.map(eq => 
        eq.id === editingEquipment.id ? { ...eq, ...equipmentForm } : eq
      ));
      setEditingEquipment(null);
    } else {
      const newEquipment: Equipment = {
        id: Math.max(...equipment.map(e => e.id), 0) + 1,
        ...equipmentForm
      };
      setEquipment(prev => [...prev, newEquipment]);
    }
    setShowEquipmentForm(false);
    setEquipmentForm({
      name: '',
      model: '',
      manufacturer: '',
      status: '정상',
      location: '',
      specifications: {},
      installDate: ''
    });
  };

  const handleEditEquipment = (eq: Equipment) => {
    setEditingEquipment(eq);
    setEquipmentForm({
      name: eq.name,
      model: eq.model,
      manufacturer: eq.manufacturer,
      status: eq.status,
      location: eq.location,
      specifications: { ...eq.specifications },
      installDate: eq.installDate || ''
    });
    setShowEquipmentForm(true);
  };

  const handleDeleteEquipment = (id: number) => {
    setEquipment(prev => prev.filter(eq => eq.id !== id));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setEquipmentForm(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setEquipmentForm(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const renderEquipment = () => {
    if (selectedEquipment) {
      // Equipment detail view with maintenance history
      const maintenanceHistory = getMaintenanceHistory(selectedEquipment.name);
      const { lastMaintenance, nextMaintenance } = getMaintenanceDates(selectedEquipment.name);
      
      return (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">설비 상세정보</h2>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                목록으로
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-lg mb-3">기본 정보</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">설비명:</span> {selectedEquipment.name}</p>
                  <p><span className="font-medium">모델명:</span> {selectedEquipment.model}</p>
                  <p><span className="font-medium">제조사:</span> {selectedEquipment.manufacturer}</p>
                  <p><span className="font-medium">위치:</span> {selectedEquipment.location}</p>
                  <p><span className="font-medium">상태:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getEquipmentStatusColor(selectedEquipment.status)}`}>
                      {selectedEquipment.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-3">작업 정보</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">마지막 정비:</span> {lastMaintenance || '없음'}</p>
                  <p><span className="font-medium">다음 정비 예정일:</span> {nextMaintenance || '없음'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-3">작업 이력</h3>
              {maintenanceHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">작업번호</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">작업명</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">설비명</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">기기명</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">작업일</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">담당자</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceHistory.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b text-sm">{order.id}</td>
                          <td className="px-4 py-2 border-b text-sm">{order.title}</td>
                          <td className="px-4 py-2 border-b text-sm">{order.equipment}</td>
                          <td className="px-4 py-2 border-b text-sm">{order.equipmentName}</td>
                          <td className="px-4 py-2 border-b text-sm">{order.dueDate}</td>
                          <td className="px-4 py-2 border-b text-sm">{order.assignee}</td>
                          <td className="px-4 py-2 border-b text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">작업 이력이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Equipment list view
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">설비 관리</h2>
            <button
              onClick={() => setShowEquipmentForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              설비 추가
            </button>
          </div>
          
          {showEquipmentForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">{editingEquipment ? '설비 정보 수정' : '새 설비 추가'}</h3>
              <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="설비명"
                    value={equipmentForm.name}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="모델명"
                    value={equipmentForm.model}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="제조사"
                    value={equipmentForm.manufacturer}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <select
                    value={equipmentForm.status}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="정상">정상</option>
                    <option value="점검중">점검중</option>
                    <option value="고장">고장</option>
                    <option value="정지">정지</option>
                  </select>
                  <input
                    type="text"
                    placeholder="위치"
                    value={equipmentForm.location}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="date"
                    value={equipmentForm.installDate}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, installDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingEquipment ? '수정' : '추가'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEquipmentForm(false);
                      setEditingEquipment(null);
                      setEquipmentForm({
                        name: '',
                        model: '',
                        manufacturer: '',
                        status: '정상',
                        location: '',
                        specifications: {},
                        installDate: ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    취소
                  </button>
                </div>
              </form>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">설비명</th>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">모델명</th>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">제조사</th>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">상태</th>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">마지막 정비일</th>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">다음 정비일</th>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">정비 이력</th>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">관리</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map(eq => {
                  const { lastMaintenance, nextMaintenance } = getMaintenanceDates(eq.name);
                  return (
                    <tr key={eq.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b text-sm font-medium">{eq.name}</td>
                      <td className="px-4 py-2 border-b text-sm">{eq.model}</td>
                      <td className="px-4 py-2 border-b text-sm">{eq.manufacturer}</td>
                      <td className="px-4 py-2 border-b text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getEquipmentStatusColor(eq.status)}`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 border-b text-sm">{lastMaintenance || '-'}</td>
                      <td className="px-4 py-2 border-b text-sm">{nextMaintenance || '-'}</td>
                      <td className="px-4 py-2 border-b text-sm">
                        <button
                          onClick={() => setSelectedEquipment(eq)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          보기
                        </button>
                      </td>
                      <td className="px-4 py-2 border-b text-sm">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditEquipment(eq)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(eq.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Documents
  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">문서 관리</h2>
        <p className="text-gray-500">문서 관리 기능이 여기에 표시됩니다.</p>
      </div>
    </div>
  );

  // Announcements
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    author: '관리자'
  });

  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnouncement) {
      setAnnouncements(prev => prev.map(announcement => 
        announcement.id === editingAnnouncement.id 
          ? { ...announcement, ...announcementForm }
          : announcement
      ));
      setEditingAnnouncement(null);
    } else {
      const newAnnouncement: Announcement = {
        id: Math.max(...announcements.map(a => a.id), 0) + 1,
        ...announcementForm,
        date: new Date().toISOString().split('T')[0]
      };
      setAnnouncements(prev => [...prev, newAnnouncement]);
    }
    setShowAnnouncementForm(false);
    setAnnouncementForm({
      title: '',
      content: '',
      priority: 'normal',
      author: '관리자'
    });
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      author: announcement.author
    });
    setShowAnnouncementForm(true);
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
  };

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">공지사항</h2>
          <button
            onClick={() => setShowAnnouncementForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            공지사항 작성
          </button>
        </div>
        
        {showAnnouncementForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">{editingAnnouncement ? '공지사항 수정' : '새 공지사항 작성'}</h3>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="제목"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="normal">일반</option>
                  <option value="important">중요</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>
              <textarea
                placeholder="내용"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                required
              />
              <input
                type="text"
                placeholder="작성자"
                value={announcementForm.author}
                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAnnouncement ? '수정' : '작성'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementForm(false);
                    setEditingAnnouncement(null);
                    setAnnouncementForm({
                      title: '',
                      content: '',
                      priority: 'normal',
                      author: '관리자'
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div key={announcement.id} className="p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-lg">{announcement.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                    {announcement.priority === 'urgent' ? '긴급' :
                     announcement.priority === 'important' ? '중요' : '일반'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditAnnouncement(announcement)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{announcement.content}</p>
              <p className="text-sm text-gray-500">{announcement.date} - {announcement.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Chat
  const renderChat = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">실시간 소통</h2>
        <p className="text-gray-500">실시간 채팅 기능이 여기에 표시됩니다.</p>
      </div>
    </div>
  );

  // Main render function
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'schedule': return renderSchedule();
      case 'workorder': return renderWorkOrder();
      case 'personnel': return renderPersonnel();
      case 'equipment': return renderEquipment();
      case 'documents': return renderDocuments();
      case 'announcements': return renderAnnouncements();
      case 'chat': return renderChat();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default MaintenanceManagementSystem;