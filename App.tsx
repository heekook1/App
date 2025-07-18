import { useState } from 'react';
import { Calendar, Users, Settings, FileText, MessageSquare, Wrench, Home, ChevronRight, Download, Plus, Eye, Edit, Trash2, Search, Filter, CheckSquare, Clock, AlertCircle, Send } from 'lucide-react';

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
  
  // Sample data - in real app this would come from backend
  const [personnel, setPersonnel] = useState<Personnel[]>([
    {
      id: 1,
      name: '한희명',
      position: '팀장',
      field: '기계',
      phone: '010-4916-8560',
      hireDate: '2024-04-01',
      certifications: ['일반기계기사'],
      accessHistory: ['2024-06-30', '2024-07-01']
    },
    {
      id: 2,
      name: '이상경',
      position: '사원',
      field: '기계',
      phone: '010-7150-0129',
      hireDate: '2024-06-03',
      certifications: [],
      accessHistory: ['2024-06-29', '2024-06-30']
    },
    {
      id: 3,
      name: '김태연',
      position: '사원',
      field: '제어',
      phone: '010-8514-5675',
      hireDate: '2025-04-01',
      certifications: ['전기기사'],
      accessHistory: ['2024-06-28', '2024-06-30', '2024-07-01']
    },
    {
      id: 4,
      name: '이중원',
      position: '사원',
      field: '전기',
      phone: '010-',
      hireDate: '2023-02-01',
      certifications: ['전기기사'],
      accessHistory: ['2024-06-29']
    }
  ]);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
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
    },
    {
      id: '25-4',
      title: '제어시스템 업데이트',
      equipment: '제어시스템',
      equipmentName: 'CS-100',
      description: '제어 소프트웨어 업데이트',
      requestDate: '2025-07-01',
      dueDate: '2025-07-18',
      status: '대기',
      assignee: '이중원',
      completionNote: '',
      attachments: [],
      type: '전기'
    }
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 1,
      title: '7월 정기 정비 일정 안내',
      content: '7월 정기 정비 일정이 확정되었습니다. 세부 사항은 첨부 파일을 확인해주세요.\n\n작업 일정:\n- 7월 5일: 터빈 점검\n- 7월 8일: 보일러 정비\n- 7월 12일: 발전기 점검',
      date: '2025-06-30',
      author: '관리자',
      priority: 'important'
    },
    {
      id: 2,
      title: '안전수칙 준수 당부',
      content: '작업 시 반드시 안전 장비를 착용하고 절차를 준수해주시기 바랍니다.\n\n필수 안전 장비:\n- 안전모\n- 안전화\n- 작업복\n- 안전장갑',
      date: '2025-06-29',
      author: '안전관리자',
      priority: 'urgent'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('all');
  const [showPersonnelModal, setShowPersonnelModal] = useState(false);
  const [showAddPersonnelModal, setShowAddPersonnelModal] = useState(false);
  const [showEditPersonnelModal, setShowEditPersonnelModal] = useState(false);
  const [showDeletePersonnelModal, setShowDeletePersonnelModal] = useState(false);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [showEditWorkOrderModal, setShowEditWorkOrderModal] = useState(false);
  const [showDeleteWorkOrderModal, setShowDeleteWorkOrderModal] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(null);
  const [newPersonnel, setNewPersonnel] = useState({
    name: '',
    position: '사원',
    field: '기계',
    phone: '',
    hireDate: '',
    certifications: []
  });
  const [newWorkOrder, setNewWorkOrder] = useState({
    title: '',
    equipment: '',
    equipmentName: '',
    description: '',
    dueDate: '',
    assignee: '',
    type: '기계'
  });

  // Schedule management states
  const [schedules, setSchedules] = useState<Schedule[]>([
    {
      id: 1,
      scheduleNumber: '25-1',
      title: '터빈 정기점검',
      date: '2025-06-02', // workOrders와 일치하도록 수정
      type: '기계',
      equipment: '터빈',
      equipmentName: 'T-3000',
      assignee: '한희명',
      description: '월간 정기점검'
    },
    {
      id: 2,
      scheduleNumber: '25-2',
      title: '보일러 밸브 교체',
      date: '2025-06-05', // workOrders와 일치하도록 수정
      type: '기계',
      equipment: '보일러',
      equipmentName: 'B-2500',
      assignee: '이상경',
      description: '압력밸브 교체 작업'
    },
    {
      id: 3,
      scheduleNumber: '25-3',
      title: '발전기 전기 점검',
      date: '2025-06-06', // workOrders와 일치하도록 수정
      type: '전기',
      equipment: '발전기',
      equipmentName: 'G-1800',
      assignee: '김태연',
      description: '전기 계통 정기 점검'
    },
    {
      id: 4,
      scheduleNumber: '25-4',
      title: '제어시스템 업데이트',
      date: '2025-07-18',
      type: '제어',
      equipment: '제어시스템',
      equipmentName: 'CS-100',
      assignee: '이중원',
      description: '제어 소프트웨어 업데이트'
    },
    {
      id: 5,
      scheduleNumber: '25-5',
      title: '터빈 다음 정기점검',
      date: '2025-08-02', // 터빈의 다음 정비 일정 추가
      type: '기계',
      equipment: '터빈',
      equipmentName: 'T-3000',
      assignee: '한희명',
      description: '정기점검'
    }
  ]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    scheduleNumber: '',
    title: '',
    date: '',
    type: '기계',
    equipment: '',
    equipmentName: '',
    assignee: '',
    description: ''
  });
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (6 = July)
  const [currentYear, setCurrentYear] = useState(2025);
  const [selectedDateForDetail, setSelectedDateForDetail] = useState<string | null>(null);

  // Chat management states
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      message: '터빈 작업 준비 완료했습니다.',
      sender: '한희명',
      timestamp: new Date(2025, 5, 30, 10, 30),
      isUser: false
    },
    {
      id: 2,
      message: '확인했습니다. 작업 시작하세요.',
      sender: '관리자',
      timestamp: new Date(2025, 5, 30, 10, 32),
      isUser: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Announcement management states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] = useState(false);
  const [showAnnouncementDetailModal, setShowAnnouncementDetailModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal' // normal, important, urgent
  });

  // Document management states
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentCategories, setDocumentCategories] = useState(['설비 도면', '작업 매뉴얼']);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [showDocumentViewModal, setShowDocumentViewModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<any>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState(null);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfPages, setPdfPages] = useState([]);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [uploadCategory, setUploadCategory] = useState('설비 도면');
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [selectedDocumentCategory, setSelectedDocumentCategory] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{url: string; type: string; name: string}[]>([]);

  // Equipment management states
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: 1,
      name: '터빈',
      model: 'Ovation 3.5',
      manufacturer: 'ABB',
      status: '정상',
      location: '열원설비동',
      specifications: {
        power: '500MW',
        type: '증기터빈',
        fuel: '천연가스'
      }
    },
    {
      id: 2,
      name: '보일러',
      model: 'B-2500',
      manufacturer: 'ABB',
      status: '점검필요',
      location: '열원설비동',
      specifications: {
        capacity: '400톤/시',
        pressure: '170kg/cm²',
        temperature: '540°C'
      }
    },
    {
      id: 3,
      name: '발전기',
      model: 'G-1800',
      manufacturer: 'ABB',
      status: '정상',
      location: '열원설비동',
      specifications: {
        output: '500MVA',
        voltage: '22kV',
        frequency: '60Hz'
      }
    },
    {
      id: 4,
      name: '제어시스템',
      model: 'CS-100',
      manufacturer: 'ABB',
      status: '정상',
      location: '중앙제어실',
      specifications: {
        type: 'DCS',
        capacity: '1000 I/O',
        software: 'System 800xA'
      }
    }
  ]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showEditEquipmentModal, setShowEditEquipmentModal] = useState(false);
  const [showDeleteEquipmentModal, setShowDeleteEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    model: '',
    manufacturer: '',
    status: '정상',
    location: '',
    specifications: {
      power: '',
      type: '',
      capacity: ''
    }
  });
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
  const [selectedEquipmentStatus, setSelectedEquipmentStatus] = useState('all');

  // Filter personnel based on search and field
  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = filterField === 'all' || person.field === filterField;
    return matchesSearch && matchesField;
  });

  // Export to Excel function (실제 다운로드)
  const exportToExcel = (data, filename) => {
    try {
      let csvContent = '';
      
      if (filename === '작업관리') {
        // 작업 관리 데이터 CSV 생성
        const headers = ['작업번호', '작업명', '설비명', '기기명', '작업내용', '등록일', '작업일', '상태', '담당자'];
        csvContent = headers.join(',') + '\n';
        
        data.forEach(order => {
          const row = [
            order.id,
            `"${order.title}"`,
            order.equipment,
            order.equipmentName || '',
            `"${order.description}"`,
            order.requestDate,
            order.dueDate,
            order.status,
            order.assignee
          ];
          csvContent += row.join(',') + '\n';
        });
      } else if (filename === '인력관리') {
        // 인력 관리 데이터 CSV 생성
        const headers = ['이름', '직책', '공종', '연락처', '입사일', '자격증', '출입이력'];
        csvContent = headers.join(',') + '\n';
        
        data.forEach(person => {
          const row = [
            person.name,
            person.position,
            person.field,
            person.phone,
            person.hireDate,
            `"${person.certifications?.join(', ') || ''}"`,
            `"${person.accessHistory?.join(', ') || ''}"`
          ];
          csvContent += row.join(',') + '\n';
        });
      }
      
      // 바로 다운로드
      const dataStr = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvContent);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      downloadAnchorNode.style.display = 'none';
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      document.body.removeChild(downloadAnchorNode);
      
      // 성공 메시지
      alert(`${filename} CSV 파일이 다운로드되었습니다!`);
      
    } catch (error) {
      console.error('CSV 생성 오류:', error);
      alert('파일 생성 중 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '완료': return 'bg-green-100 text-green-800';
      case '진행중': return 'bg-blue-100 text-blue-800';
      case '대기': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateWorkOrderStatus = (id, newStatus) => {
    setWorkOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  const addNewWorkOrder = () => {
    if (!newWorkOrder.title || !newWorkOrder.equipment || !newWorkOrder.equipmentName || !newWorkOrder.assignee || !newWorkOrder.dueDate) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    // 현재 연도의 마지막 두 자리 가져오기
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // 예: 2025 → "25", 2026 → "26"
    
    // 해당 연도의 작업 개수 계산
    const currentYearOrders = workOrders.filter(order => 
      order.id.startsWith(`${yearSuffix}-`)
    );
    const nextNumber = currentYearOrders.length + 1;
    const nextId = `${yearSuffix}-${nextNumber}`;
    
    const order = {
      id: nextId,
      ...newWorkOrder,
      requestDate: new Date().toISOString().split('T')[0],
      status: '대기',
      completionNote: '',
      attachments: []
    };
    
    // 작업 일정에도 자동으로 추가
    const scheduleMaxId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) : 0;
    const newScheduleItem = {
      id: scheduleMaxId + 1,
      scheduleNumber: nextId, // 작업 번호와 동일하게 설정
      title: newWorkOrder.title,
      date: newWorkOrder.dueDate,
      type: newWorkOrder.type,
      equipment: newWorkOrder.equipment,
      equipmentName: newWorkOrder.equipmentName,
      assignee: newWorkOrder.assignee,
      description: newWorkOrder.description
    };
    
    setWorkOrders(prev => [...prev, order]);
    setSchedules(prev => [...prev, newScheduleItem]); // 작업 일정에도 추가
    setNewWorkOrder({ title: '', equipment: '', equipmentName: '', description: '', dueDate: '', assignee: '', type: '기계' });
    setShowWorkOrderModal(false);
    
    alert('작업이 등록되었고, 작업 일정에도 자동으로 추가되었습니다.');
  };

  const addNewSchedule = () => {
    if (!newSchedule.scheduleNumber || !newSchedule.title || !newSchedule.date || !newSchedule.assignee) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    // 번호 중복 체크
    const isDuplicate = schedules.some(schedule => schedule.scheduleNumber === newSchedule.scheduleNumber);
    if (isDuplicate) {
      alert('이미 존재하는 번호입니다. 다른 번호를 입력해주세요.');
      return;
    }
    
    // 번호 형식 검증 (XX-N 형식)
    const numberPattern = /^\d{2}-\d+$/;
    if (!numberPattern.test(newSchedule.scheduleNumber)) {
      alert('번호는 "25-1" 형식으로 입력해주세요. (연도 2자리-순번)');
      return;
    }
    
    // 더 안전한 ID 생성 (기존 ID들의 최대값 + 1)
    const maxId = schedules.length > 0 ? Math.max(...schedules.map(s => s.id)) : 0;
    
    const schedule = {
      id: maxId + 1,
      ...newSchedule
    };
    
    setSchedules(prev => [...prev, schedule]);
    setNewSchedule({ scheduleNumber: '', title: '', date: '', type: '기계', equipment: '', equipmentName: '', assignee: '', description: '' });
    setShowScheduleModal(false);
  };

  const handleDateClick = (date: Date) => {
    // 로컬 시간대를 유지하여 날짜 문자열 생성
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    setSelectedDateForDetail(dateStr);
    setShowDayDetailModal(true);
  };

  const openNewScheduleModal = (date = null) => {
    const dateStr = date || selectedDateForDetail || new Date().toISOString().split('T')[0];
    
    setSelectedScheduleDate(dateStr);
    setNewSchedule(prev => ({ 
      ...prev, 
      date: dateStr
    }));
    setShowDayDetailModal(false);
    setShowScheduleModal(true);
  };

  const openEditScheduleModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowDayDetailModal(false);
    setShowEditScheduleModal(true);
  };

  const openDeleteConfirmModal = (schedule) => {
    setScheduleToDelete(schedule);
    setShowDayDetailModal(false);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteSchedule = () => {
    if (scheduleToDelete) {
      setSchedules(prev => prev.filter(s => s.id !== scheduleToDelete.id));
      setScheduleToDelete(null);
      setShowDeleteConfirmModal(false);
      alert('일정이 삭제되었습니다.');
    }
  };

  const updateSchedule = () => {
    if (!editingSchedule || !editingSchedule.title || !editingSchedule.date || !editingSchedule.assignee) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    setSchedules(prev => prev.map(schedule => 
      schedule.id === editingSchedule.id ? editingSchedule : schedule
    ));
    
    setEditingSchedule(null);
    setShowEditScheduleModal(false);
    alert('일정이 수정되었습니다.');
  };

  const getSchedulesBySpecificDate = (dateStr: string) => {
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  const formatDateKorean = (dateStr) => {
    // 시간대 문제를 방지하기 위해 로컬 날짜로 파싱
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month는 0-indexed
    
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  const getSchedulesByDate = (date: Date) => {
    // 시간대 문제를 방지하기 위해 로컬 시간대 유지
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  const getScheduleTypeColor = (type) => {
    switch (type) {
      case '기계': return 'bg-blue-500';
      case '전기': return 'bg-yellow-500';
      case '제어': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getMonthName = (month: number) => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return months[month];
  };

  const getCalendarDays = (): Date[] => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getCurrentMonthSchedules = () => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      return scheduleDate.getFullYear() === currentYear && scheduleDate.getMonth() === currentMonth;
    });
  };

  const sendMessage = () => {
    if (newMessage.trim() === '') {
      alert('메시지를 입력해주세요.');
      return;
    }
    
    const message = {
      id: chatMessages.length + 1,
      message: newMessage.trim(),
      sender: '관리자', // 현재 사용자 (실제로는 로그인한 사용자명)
      timestamp: new Date(),
      isUser: true
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleMessageKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatChatTime = (timestamp) => {
    const hours = timestamp.getHours();
    const minutes = String(timestamp.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Announcement management functions
  const addNewAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    const announcement = {
      id: Math.max(...announcements.map(a => a.id), 0) + 1,
      title: newAnnouncement.title.trim(),
      content: newAnnouncement.content.trim(),
      priority: newAnnouncement.priority,
      date: new Date().toISOString().split('T')[0],
      author: '관리자' // 실제로는 로그인한 사용자명
    };

    setAnnouncements(prev => [announcement, ...prev]);
    setNewAnnouncement({ title: '', content: '', priority: 'normal' });
    setShowAnnouncementModal(false);
    alert('공지사항이 등록되었습니다.');
  };

  const openEditAnnouncementModal = (announcement: Announcement) => {
    setEditingAnnouncement({ ...announcement });
    setShowEditAnnouncementModal(true);
  };

  const updateAnnouncement = () => {
    if (!editingAnnouncement || !editingAnnouncement.title.trim() || !editingAnnouncement.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setAnnouncements(prev => prev.map(announcement =>
      announcement.id === editingAnnouncement.id ? editingAnnouncement : announcement
    ));

    setEditingAnnouncement(null);
    setShowEditAnnouncementModal(false);
    alert('공지사항이 수정되었습니다.');
  };

  const openDeleteAnnouncementModal = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setShowDeleteAnnouncementModal(true);
  };

  const confirmDeleteAnnouncement = () => {
    if (announcementToDelete) {
      setAnnouncements(prev => prev.filter(a => a.id !== announcementToDelete.id));
      setAnnouncementToDelete(null);
      setShowDeleteAnnouncementModal(false);
      alert('공지사항이 삭제되었습니다.');
    }
  };

  const openAnnouncementDetail = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementDetailModal(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'important': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return '긴급';
      case 'important': return '중요';
      case 'normal': return '일반';
      default: return '일반';
    }
  };

  // Personnel management functions
  const addNewPersonnel = () => {
    if (!newPersonnel.name.trim() || !newPersonnel.phone.trim() || !newPersonnel.hireDate) {
      alert('이름, 연락처, 입사일은 필수 항목입니다.');
      return;
    }

    // 전화번호 형식 간단 검증
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(newPersonnel.phone)) {
      alert('연락처는 010-0000-0000 형식으로 입력해주세요.');
      return;
    }

    const maxId = personnel.length > 0 ? Math.max(...personnel.map(p => p.id)) : 0;
    const person = {
      id: maxId + 1,
      name: newPersonnel.name.trim(),
      position: newPersonnel.position,
      field: newPersonnel.field,
      phone: newPersonnel.phone.trim(),
      hireDate: newPersonnel.hireDate,
      certifications: newPersonnel.certifications.filter(cert => cert.trim()),
      accessHistory: [] // 새 인력은 출입 이력이 없음
    };

    setPersonnel(prev => [...prev, person]);
    setNewPersonnel({
      name: '',
      position: '사원',
      field: '기계',
      phone: '',
      hireDate: '',
      certifications: []
    });
    setShowAddPersonnelModal(false);
    alert('새 인력이 등록되었습니다.');
  };

  const openEditPersonnelModal = (person: Personnel) => {
    setEditingPersonnel(person);
    setShowEditPersonnelModal(true);
  };

  const openDeletePersonnelModal = (person: Personnel) => {
    setPersonnelToDelete(person);
    setShowDeletePersonnelModal(true);
  };

  const updatePersonnel = () => {
    if (!editingPersonnel || !editingPersonnel.name || !editingPersonnel.position || !editingPersonnel.phone) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    setPersonnel(prev => prev.map(person => 
      person.id === editingPersonnel.id ? editingPersonnel : person
    ));
    
    setEditingPersonnel(null);
    setShowEditPersonnelModal(false);
    alert('인력 정보가 수정되었습니다.');
  };

  const confirmDeletePersonnel = () => {
    if (personnelToDelete) {
      setPersonnel(prev => prev.filter(p => p.id !== personnelToDelete.id));
      setPersonnelToDelete(null);
      setShowDeletePersonnelModal(false);
      alert('인력이 삭제되었습니다.');
    }
  };

  // Work Order management functions
  const openEditWorkOrderModal = (order: WorkOrder) => {
    setEditingWorkOrder({ ...order });
    setShowEditWorkOrderModal(true);
  };

  const updateWorkOrder = () => {
    if (!editingWorkOrder || !editingWorkOrder.title || !editingWorkOrder.equipment || !editingWorkOrder.equipmentName || !editingWorkOrder.assignee || !editingWorkOrder.dueDate) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    setWorkOrders(prev => prev.map(order => 
      order.id === editingWorkOrder.id ? editingWorkOrder : order
    ));
    
    // 해당 작업의 일정도 함께 업데이트
    setSchedules(prev => prev.map(schedule => 
      schedule.scheduleNumber === editingWorkOrder.id ? {
        ...schedule,
        title: editingWorkOrder.title,
        date: editingWorkOrder.dueDate,
        type: editingWorkOrder.type,
        equipment: editingWorkOrder.equipment,
        equipmentName: editingWorkOrder.equipmentName,
        assignee: editingWorkOrder.assignee,
        description: editingWorkOrder.description
      } : schedule
    ));
    
    setEditingWorkOrder(null);
    setShowEditWorkOrderModal(false);
    alert('작업 정보가 수정되었습니다.');
  };

  const openDeleteWorkOrderModal = (order: WorkOrder) => {
    setWorkOrderToDelete(order);
    setShowDeleteWorkOrderModal(true);
  };

  const confirmDeleteWorkOrder = () => {
    if (workOrderToDelete) {
      setWorkOrders(prev => prev.filter(order => order.id !== workOrderToDelete.id));
      
      // 해당 작업의 일정도 함께 삭제
      setSchedules(prev => prev.filter(schedule => schedule.scheduleNumber !== workOrderToDelete.id));
      
      setWorkOrderToDelete(null);
      setShowDeleteWorkOrderModal(false);
      alert('작업이 삭제되었습니다.');
    }
  };

  // Document management functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 선택된 파일 상태 업데이트
    setSelectedFiles(files);
    
    // 미리보기 생성
    const previews = files.map((file: File) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 
            file.type === 'application/pdf' ? 'pdf' : 'other',
      name: file.name
    }));
    
    setFilePreviews(previews);
  };

  const handleFileUpload = () => {
    if (selectedFiles.length === 0) {
      alert('업로드할 파일을 선택해주세요.');
      return;
    }
    
    selectedFiles.forEach(file => {
      const newDocument = {
        id: Date.now() + Math.random(),
        name: file.name,
        category: uploadCategory,
        uploadDate: new Date().toISOString().split('T')[0],
        size: formatFileSize(file.size),
        type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        uploader: '관리자',
        file: file // 실제 파일 객체 저장
      };
      
      setDocuments(prev => [...prev, newDocument]);
    });
    
    // 상태 초기화
    setSelectedFiles([]);
    setFilePreviews([]);
    setShowUploadModal(false);
    alert(`${selectedFiles.length}개 파일이 업로드되었습니다.`);
  };

  const clearSelectedFiles = () => {
    // 미리보기 URL 정리
    filePreviews.forEach(preview => {
      URL.revokeObjectURL(preview.url);
    });
    setSelectedFiles([]);
    setFilePreviews([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const downloadDocument = (document) => {
    try {
      if (document.file) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(document.file);
        link.download = document.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`${document.name} 파일이 다운로드되었습니다!`);
      } else {
        alert('파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('다운로드 오류:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  const viewDocument = (document) => {
    try {
      if (document.file) {
        setViewingDocument(document);
        setPdfLoadError(false);
        setPdfPages([]);
        setTotalPages(0);
        setCurrentPdfPage(1);
        
        if (document.file.type === 'application/pdf') {
          setShowDocumentViewModal(true);
        } else {
          const fileUrl = URL.createObjectURL(document.file);
          setPdfDataUrl(fileUrl);
          setShowDocumentViewModal(true);
        }
      } else {
        alert('파일을 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('파일 열기 오류:', error);
      alert('파일을 여는 중 오류가 발생했습니다.');
    }
  };

  const openDeleteDocumentModal = (document) => {
    setDocumentToDelete(document);
    setShowDeleteDocumentModal(true);
  };

  const confirmDeleteDocument = () => {
    if (documentToDelete) {
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
      setDocumentToDelete(null);
      setShowDeleteDocumentModal(false);
      alert('문서가 삭제되었습니다.');
    }
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(documentSearchTerm.toLowerCase());
      const matchesCategory = selectedDocumentCategory === 'all' || doc.category === selectedDocumentCategory;
      return matchesSearch && matchesCategory;
    });
  };

  // Equipment management functions
  const getFilteredEquipment = () => {
    return equipment.filter(eq => {
      const matchesSearch = eq.name.toLowerCase().includes(equipmentSearchTerm.toLowerCase()) ||
                           eq.model.toLowerCase().includes(equipmentSearchTerm.toLowerCase()) ||
                           eq.manufacturer.toLowerCase().includes(equipmentSearchTerm.toLowerCase());
      const matchesStatus = selectedEquipmentStatus === 'all' || eq.status === selectedEquipmentStatus;
      return matchesSearch && matchesStatus;
    });
  };

  const getEquipmentStatusColor = (status) => {
    switch (status) {
      case '정상': return 'bg-green-100 text-green-800';
      case '점검필요': return 'bg-yellow-100 text-yellow-800';
      case '고장': return 'bg-red-100 text-red-800';
      case '정비중': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceHistory = (equipmentName) => {
    return workOrders.filter(order => order.equipment === equipmentName);
  };

  const getMaintenanceHistoryByModel = (equipmentModel) => {
    return workOrders.filter(order => order.equipmentName === equipmentModel);
  };

  // 마지막 정비일 계산 (과거 작업일 중 가장 최근, 상태 무관)
  const getLastMaintenanceDate = (equipmentName, equipmentModel) => {
    const today = new Date().toISOString().split('T')[0];
    
    // workOrders에서 과거 작업들 찾기 (상태 무관)
    const pastOrders = workOrders.filter(order => 
      (order.equipment === equipmentName || order.equipmentName === equipmentModel) && 
      order.dueDate < today
    );
    
    // schedules에서 과거 일정들 찾기
    const pastSchedules = schedules.filter(schedule => 
      (schedule.equipment === equipmentName || schedule.equipmentName === equipmentModel) &&
      schedule.date < today
    );
    
    // 모든 과거 날짜들을 합쳐서 가장 최근 날짜 찾기
    const allPastDates = [
      ...pastOrders.map(order => order.dueDate),
      ...pastSchedules.map(schedule => schedule.date)
    ];
    
    if (allPastDates.length === 0) return '-';
    
    // 가장 최근 과거 날짜 찾기
    const latestDate = allPastDates.reduce((latest, current) => 
      new Date(current) > new Date(latest) ? current : latest
    );
    
    return latestDate;
  };

  // 다음 정비 예정일 계산 (미래 작업일 중 가장 가까운, 상태 무관)
  const getNextMaintenanceDate = (equipmentName, equipmentModel) => {
    const today = new Date().toISOString().split('T')[0];
    
    // workOrders에서 미래 작업들 찾기 (상태 무관)
    const futureOrders = workOrders.filter(order => 
      (order.equipment === equipmentName || order.equipmentName === equipmentModel) && 
      order.dueDate >= today
    );
    
    // schedules에서 미래 일정들 찾기
    const futureSchedules = schedules.filter(schedule => 
      (schedule.equipment === equipmentName || schedule.equipmentName === equipmentModel) &&
      schedule.date >= today
    );
    
    // 모든 미래 날짜들을 합쳐서 가장 가까운 날짜 찾기
    const allFutureDates = [
      ...futureOrders.map(order => order.dueDate),
      ...futureSchedules.map(schedule => schedule.date)
    ];
    
    if (allFutureDates.length === 0) return '-';
    
    // 가장 가까운 미래 날짜 찾기
    const nearestDate = allFutureDates.reduce((nearest, current) => 
      new Date(current) < new Date(nearest) ? current : nearest
    );
    
    return nearestDate;
  };

  const addNewEquipment = () => {
    if (!newEquipment.name.trim() || !newEquipment.model.trim() || !newEquipment.manufacturer.trim()) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const maxId = equipment.length > 0 ? Math.max(...equipment.map(eq => eq.id)) : 0;
    const eq = {
      id: maxId + 1,
      ...newEquipment
    };

    setEquipment(prev => [...prev, eq]);
    setNewEquipment({
      name: '',
      model: '',
      manufacturer: '',
      status: '정상',
      location: '',
      specifications: {
        power: '',
        type: '',
        capacity: ''
      }
    });
    setShowAddEquipmentModal(false);
    alert('새 설비가 등록되었습니다.');
  };

  const openEditEquipmentModal = (eq: Equipment) => {
    setEditingEquipment({ ...eq });
    setShowEditEquipmentModal(true);
  };

  const updateEquipment = () => {
    if (!editingEquipment || !editingEquipment.name || !editingEquipment.model || !editingEquipment.manufacturer) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    setEquipment(prev => prev.map(eq => 
      eq.id === editingEquipment.id ? editingEquipment : eq
    ));
    
    setEditingEquipment(null);
    setShowEditEquipmentModal(false);
    alert('설비 정보가 수정되었습니다.');
  };

  const openDeleteEquipmentModal = (eq) => {
    setEquipmentToDelete(eq);
    setShowDeleteEquipmentModal(true);
  };

  const confirmDeleteEquipment = () => {
    if (equipmentToDelete) {
      setEquipment(prev => prev.filter(eq => eq.id !== equipmentToDelete.id));
      setEquipmentToDelete(null);
      setShowDeleteEquipmentModal(false);
      alert('설비가 삭제되었습니다.');
    }
  };

  const openEquipmentDetail = (eq) => {
    setSelectedEquipment(eq);
    setShowEquipmentModal(true);
  };

  const renderSidebar = () => (
    <div className="w-64 bg-slate-800 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-xl font-bold">정비 업체 관리 시스템</h1>
          <div className="flex items-center gap-4">
            <img src="/wideincheon-logo.png" alt="위드인천에너지" className="h-10 w-auto" />
            <span className="text-gray-400 text-xl">×</span>
            <img src="/youngjin-logo.png" alt="영진" className="h-10 w-auto" />
          </div>
        </div>
        <p className="text-sm text-slate-300 mt-1">영진(주)</p>
      </div>
      
      <nav className="mt-6">
        {[
          { id: 'dashboard', name: '대시보드', icon: Home },
          { id: 'personnel', name: '인력 관리', icon: Users },
          { id: 'work-orders', name: '작업 관리', icon: Wrench },
          { id: 'schedule', name: '작업 일정', icon: Calendar },
          { id: 'equipment', name: '설비 이력', icon: Settings },
          { id: 'communication', name: '커뮤니케이션', icon: MessageSquare },
          { id: 'documents', name: '문서 관리', icon: FileText }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-slate-700 transition-colors ${
                currentPage === item.id ? 'bg-slate-700 border-r-2 border-blue-400' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">대시보드</h2>
      
      {/* Main Layout - 공지사항을 오른쪽 상단에 배치 */}
      <div className="flex gap-6">
        {/* Left Section - Status Cards + Recent Work Orders */}
        <div className="flex-1 space-y-6">
          {/* Status Cards - 2x2 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">진행 중 작업</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {workOrders.filter(w => w.status === '진행중').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">대기 작업</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {workOrders.filter(w => w.status === '대기').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">완료 작업</p>
                  <p className="text-2xl font-bold text-green-600">
                    {workOrders.filter(w => w.status === '완료').length}
                  </p>
                </div>
                <CheckSquare className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">전체 인력</p>
                  <p className="text-2xl font-bold text-purple-600">{personnel.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Recent Work Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">최근 작업 목록</h3>
            <div className="space-y-3">
              {workOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{order.title}</p>
                    <p className="text-sm text-gray-600">{order.equipment} ({order.equipmentName})</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Announcements (상단에 배치) */}
        <div className="w-80">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">공지사항</h3>
            <div className="space-y-3">
              {announcements.slice(0, 5).map(announcement => (
                <div key={announcement.id} className="p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(announcement.priority)}`}>
                      {getPriorityText(announcement.priority)}
                    </span>
                    <p className="font-medium text-sm">{announcement.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {announcement.content.length > 60 
                      ? `${announcement.content.substring(0, 60)}...` 
                      : announcement.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{announcement.date} | {announcement.author}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">등록된 공지사항이 없습니다</p>
                </div>
              )}
            </div>
            
            {/* 공지사항 더보기 버튼 */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentPage('communication')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                전체 공지사항 보기 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonnelManagement = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">인력 관리</h2>
        <div className="flex gap-3">
          <button
            onClick={() => exportToExcel(filteredPersonnel, '인력관리')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Excel 다운로드
          </button>
          <button 
            onClick={() => setShowAddPersonnelModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            인력 추가
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="이름, 직책으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 공종</option>
          <option value="기계">기계</option>
          <option value="전기">전기</option>
          <option value="제어">제어</option>
        </select>
      </div>

      {/* Personnel Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">직책</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공종</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입사일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">출입 이력</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPersonnel.map(person => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{person.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{person.position}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {person.field}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{person.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{person.hireDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setSelectedPersonnel(person);
                      setShowPersonnelModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    보기 ({person.accessHistory.length})
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditPersonnelModal(person)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => openDeletePersonnelModal(person)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Personnel Modal */}
      {showPersonnelModal && selectedPersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">인력 상세 정보</h3>
            <div className="space-y-3">
              <div><strong>이름:</strong> {selectedPersonnel.name}</div>
              <div><strong>직책:</strong> {selectedPersonnel.position}</div>
              <div><strong>공종:</strong> {selectedPersonnel.field}</div>
              <div><strong>연락처:</strong> {selectedPersonnel.phone}</div>
              <div><strong>입사일:</strong> {selectedPersonnel.hireDate}</div>
              <div><strong>자격증:</strong> {selectedPersonnel.certifications.join(', ')}</div>
              <div>
                <strong>출입 이력:</strong>
                <ul className="mt-2 space-y-1">
                  {selectedPersonnel.accessHistory.map((date, index) => (
                    <li key={index} className="text-sm text-gray-600">• {date} 출입</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPersonnelModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Personnel Modal */}
      {showAddPersonnelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">새 인력 등록</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  value={newPersonnel.name}
                  onChange={(e) => setNewPersonnel({...newPersonnel, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                <select
                  value={newPersonnel.position}
                  onChange={(e) => setNewPersonnel({...newPersonnel, position: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="사원">사원</option>
                  <option value="대리">대리</option>
                  <option value="과장">과장</option>
                  <option value="차장">차장</option>
                  <option value="부장">부장</option>
                  <option value="팀장">팀장</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공종</label>
                <select
                  value={newPersonnel.field}
                  onChange={(e) => setNewPersonnel({...newPersonnel, field: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="기계">기계</option>
                  <option value="전기">전기</option>
                  <option value="제어">제어</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
                <input
                  type="text"
                  value={newPersonnel.phone}
                  onChange={(e) => setNewPersonnel({...newPersonnel, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">입사일 *</label>
                <input
                  type="date"
                  value={newPersonnel.hireDate}
                  onChange={(e) => setNewPersonnel({...newPersonnel, hireDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">자격증</label>
                <input
                  type="text"
                  value={newPersonnel.certifications.join(', ')}
                  onChange={(e) => setNewPersonnel({
                    ...newPersonnel, 
                    certifications: e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert)
                  })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="자격증을 쉼표로 구분하여 입력 (예: 전기기사, 전기기능사)"
                />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              * 표시는 필수 입력 항목입니다.
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddPersonnelModal(false);
                  setNewPersonnel({
                    name: '',
                    position: '사원',
                    field: '기계',
                    phone: '',
                    hireDate: '',
                    certifications: []
                  });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={addNewPersonnel}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Personnel Modal */}
      {showEditPersonnelModal && editingPersonnel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">인력 정보 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  value={editingPersonnel.name}
                  onChange={(e) => setEditingPersonnel({...editingPersonnel, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">직책</label>
                <select
                  value={editingPersonnel.position}
                  onChange={(e) => setEditingPersonnel({...editingPersonnel, position: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="사원">사원</option>
                  <option value="대리">대리</option>
                  <option value="과장">과장</option>
                  <option value="차장">차장</option>
                  <option value="부장">부장</option>
                  <option value="팀장">팀장</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공종</label>
                <select
                  value={editingPersonnel.field}
                  onChange={(e) => setEditingPersonnel({...editingPersonnel, field: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="기계">기계</option>
                  <option value="전기">전기</option>
                  <option value="제어">제어</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="text"
                  value={editingPersonnel.phone}
                  onChange={(e) => setEditingPersonnel({...editingPersonnel, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">입사일</label>
                <input
                  type="date"
                  value={editingPersonnel.hireDate}
                  onChange={(e) => setEditingPersonnel({...editingPersonnel, hireDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">자격증</label>
                <input
                  type="text"
                  value={editingPersonnel.certifications?.join(', ') || ''}
                  onChange={(e) => setEditingPersonnel({
                    ...editingPersonnel, 
                    certifications: e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert)
                  })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="자격증을 쉼표로 구분하여 입력"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditPersonnelModal(false);
                  setEditingPersonnel(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={updatePersonnel}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Personnel Confirmation Modal */}
      {showDeletePersonnelModal && personnelToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">인력 삭제 확인</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">다음 인력을 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {personnelToDelete.field}
                  </span>
                  <span className="font-medium">{personnelToDelete.name}</span>
                </div>
                <p className="text-sm text-gray-600">직책: {personnelToDelete.position}</p>
                <p className="text-sm text-gray-600">연락처: {personnelToDelete.phone}</p>
                <p className="text-sm text-gray-600">입사일: {personnelToDelete.hireDate}</p>
              </div>
              <p className="text-red-600 text-sm mt-3">⚠️ 삭제된 인력 정보는 복구할 수 없습니다.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeletePersonnelModal(false);
                  setPersonnelToDelete(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={confirmDeletePersonnel}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Work Order Modal */}
      {showEditWorkOrderModal && editingWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">작업 정보 수정</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업명</label>
                <input
                  type="text"
                  value={editingWorkOrder.title}
                  onChange={(e) => setEditingWorkOrder({...editingWorkOrder, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공종</label>
                <select
                  value={editingWorkOrder.type}
                  onChange={(e) => setEditingWorkOrder({...editingWorkOrder, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="기계">기계</option>
                  <option value="전기">전기</option>
                  <option value="제어">제어</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설비명</label>
                <select
                  value={editingWorkOrder.equipment}
                  onChange={(e) => setEditingWorkOrder({...editingWorkOrder, equipment: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.name}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기기명</label>
                <input
                  type="text"
                  value={editingWorkOrder.equipmentName}
                  onChange={(e) => setEditingWorkOrder({...editingWorkOrder, equipmentName: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: T-3000, B-2500, G-1800"
                />
                <p className="text-xs text-gray-500 mt-1">설비의 정확한 모델명을 입력해주세요</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업 내용</label>
                <textarea
                  value={editingWorkOrder.description}
                  onChange={(e) => setEditingWorkOrder({...editingWorkOrder, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업일</label>
                <input
                  type="date"
                  value={editingWorkOrder.dueDate}
                  onChange={(e) => setEditingWorkOrder({...editingWorkOrder, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                <select
                  value={editingWorkOrder.assignee}
                  onChange={(e) => setEditingWorkOrder({...editingWorkOrder, assignee: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {personnel.map(person => (
                    <option key={person.id} value={person.name}>{person.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={editingWorkOrder.status}
                  onChange={(e) => setEditingWorkOrder({...editingWorkOrder, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="대기">대기</option>
                  <option value="진행중">진행중</option>
                  <option value="완료">완료</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditWorkOrderModal(false);
                  setEditingWorkOrder(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={updateWorkOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Work Order Confirmation Modal */}
      {showDeleteWorkOrderModal && workOrderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">작업 삭제 확인</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">다음 작업을 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workOrderToDelete.status)}`}>
                    {workOrderToDelete.status}
                  </span>
                  <span className="font-medium">{workOrderToDelete.title}</span>
                </div>
                <p className="text-sm text-gray-600">작업번호: {workOrderToDelete.id}</p>
                <p className="text-sm text-gray-600">설비: {workOrderToDelete.equipment} ({workOrderToDelete.equipmentName})</p>
                <p className="text-sm text-gray-600">작업일: {workOrderToDelete.dueDate}</p>
                <p className="text-sm text-gray-600">담당자: {workOrderToDelete.assignee}</p>
              </div>
              <p className="text-red-600 text-sm mt-3">⚠️ 삭제된 작업은 복구할 수 없으며, 관련 일정도 함께 삭제됩니다.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteWorkOrderModal(false);
                  setWorkOrderToDelete(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteWorkOrder}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWorkOrders = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">작업 관리</h2>
        <div className="flex gap-3">
          <button
            onClick={() => exportToExcel(workOrders, '작업관리')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Excel 다운로드
          </button>
          <button
            onClick={() => setShowWorkOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            작업 등록
          </button>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table style={{ width: '100%', minWidth: '1600px', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '80px', maxWidth: '80px', minWidth: '80px' }}>번호</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '200px', maxWidth: '200px', minWidth: '200px' }}>작업명</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '96px', maxWidth: '96px', minWidth: '96px' }}>설비</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '128px', maxWidth: '128px', minWidth: '128px' }}>기기명</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '2000px', maxWidth: '2000px', minWidth: '2000px' }}>작업내용</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '112px', maxWidth: '112px', minWidth: '112px' }}>등록일</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '112px', maxWidth: '112px', minWidth: '112px' }}>작업일</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '96px', maxWidth: '96px', minWidth: '96px' }}>상태</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '80px', maxWidth: '80px', minWidth: '80px' }}>담당자</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '112px', maxWidth: '112px', minWidth: '112px' }}>액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b text-sm whitespace-nowrap" style={{ width: '80px', maxWidth: '80px', minWidth: '80px' }}>{order.id}</td>
                <td className="px-4 py-2 border-b text-sm whitespace-pre-line" style={{ width: '200px', maxWidth: '200px', minWidth: '200px' }}>{order.title}</td>
                <td className="px-4 py-2 border-b text-sm whitespace-nowrap" style={{ width: '96px', maxWidth: '96px', minWidth: '96px' }}>{order.equipment}</td>
                <td className="px-4 py-2 border-b text-sm whitespace-nowrap" style={{ width: '128px', maxWidth: '128px', minWidth: '128px' }}>{order.equipmentName}</td>
                <td className="px-4 py-2 border-b text-sm whitespace-pre-line" style={{ width: '2000px', maxWidth: '2000px', minWidth: '2000px' }}>{order.description}</td>
                <td className="px-4 py-2 border-b text-sm whitespace-nowrap" style={{ width: '112px', maxWidth: '112px', minWidth: '112px' }}>{order.requestDate}</td>
                <td className="px-4 py-2 border-b text-sm whitespace-nowrap" style={{ width: '112px', maxWidth: '112px', minWidth: '112px' }}>{order.dueDate}</td>
                <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-24">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-20">{order.assignee}</td>
                <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-28">
                  <div className="flex gap-1">
                    {order.status === '대기' && (
                      <button
                        onClick={() => updateWorkOrderStatus(order.id, '진행중')}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        시작
                      </button>
                    )}
                    {order.status === '진행중' && (
                      <button
                        onClick={() => updateWorkOrderStatus(order.id, '완료')}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        완료
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => openEditWorkOrderModal(order)}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => openDeleteWorkOrderModal(order)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Work Order Modal */}
      {showWorkOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">새 작업 등록</h3>
            
            {/* 자동 생성될 번호 안내 */}
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                📋 자동 부여될 작업 번호: <strong>{(() => {
                  const currentYear = new Date().getFullYear();
                  const yearSuffix = currentYear.toString().slice(-2);
                  const currentYearOrders = workOrders.filter(order => 
                    order.id.startsWith(`${yearSuffix}-`)
                  );
                  return `${yearSuffix}-${currentYearOrders.length + 1}`;
                })()}</strong>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업명</label>
                <input
                  type="text"
                  value={newWorkOrder.title}
                  onChange={(e) => setNewWorkOrder({...newWorkOrder, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공종</label>
                <select
                  value={newWorkOrder.type}
                  onChange={(e) => setNewWorkOrder({...newWorkOrder, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="기계">기계</option>
                  <option value="전기">전기</option>
                  <option value="제어">제어</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설비명</label>
                <select
                  value={newWorkOrder.equipment}
                  onChange={(e) => setNewWorkOrder({...newWorkOrder, equipment: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.name}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기기명</label>
                <input
                  type="text"
                  value={newWorkOrder.equipmentName}
                  onChange={(e) => setNewWorkOrder({...newWorkOrder, equipmentName: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: T-3000, B-2500, G-1800"
                />
                <p className="text-xs text-gray-500 mt-1">설비의 정확한 모델명을 입력해주세요</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업 내용</label>
                <textarea
                  value={newWorkOrder.description}
                  onChange={(e) => setNewWorkOrder({...newWorkOrder, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업일</label>
                <input
                  type="date"
                  value={newWorkOrder.dueDate}
                  onChange={(e) => setNewWorkOrder({...newWorkOrder, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                <select
                  value={newWorkOrder.assignee}
                  onChange={(e) => setNewWorkOrder({...newWorkOrder, assignee: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {personnel.map(person => (
                    <option key={person.id} value={person.name}>{person.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowWorkOrderModal(false);
                  setNewWorkOrder({ title: '', equipment: '', equipmentName: '', description: '', dueDate: '', assignee: '', type: '기계' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={addNewWorkOrder}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSchedule = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">작업 일정</h2>
        <button
          onClick={() => openNewScheduleModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          일정 추가
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <h3 className="text-lg font-semibold">{currentYear}년 {getMonthName(currentMonth)}</h3>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>기계</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>전기</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>제어</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2 text-sm">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {getCalendarDays().map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const daySchedules = getSchedulesByDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`p-2 h-24 border rounded cursor-pointer hover:bg-gray-50 ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${daySchedules.length > 0 ? 'border-blue-300' : 'border-gray-200'} ${
                    isToday ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className={`text-sm font-medium ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1">
                    {daySchedules.slice(0, 2).map(schedule => (
                      <div
                        key={schedule.id}
                        className={`text-xs text-white px-1 py-0.5 rounded truncate ${getScheduleTypeColor(schedule.type)}`}
                        title={schedule.title}
                      >
                        {schedule.title}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="text-xs text-gray-500">+{daySchedules.length - 2}개</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{getMonthName(currentMonth)} 일정</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {getCurrentMonthSchedules()
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(schedule => (
                <div key={schedule.id} className="p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="px-1 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                          {schedule.scheduleNumber}
                        </span>
                        <p className="font-medium text-sm">{schedule.title}</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{schedule.equipment} ({schedule.equipmentName})</p>
                      <p className="text-xs text-gray-500">{schedule.date}</p>
                      <p className="text-xs text-gray-600">담당: {schedule.assignee}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs text-white ${getScheduleTypeColor(schedule.type)}`}>
                      {schedule.type}
                    </span>
                  </div>
                </div>
              ))}
            {getCurrentMonthSchedules().length === 0 && (
              <div className="text-center text-gray-500 py-8">
                {getMonthName(currentMonth)}에 등록된 일정이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {showDayDetailModal && selectedDateForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{formatDateKorean(selectedDateForDetail)}</h3>
              <button
                onClick={() => setShowDayDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Existing Schedules */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">등록된 일정</h4>
              {getSchedulesBySpecificDate(selectedDateForDetail).length > 0 ? (
                <div className="space-y-3">
                  {getSchedulesBySpecificDate(selectedDateForDetail).map(schedule => (
                    <div key={schedule.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                              {schedule.scheduleNumber}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs text-white ${getScheduleTypeColor(schedule.type)}`}>
                              {schedule.type}
                            </span>
                            <span className="font-medium">{schedule.title}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">설비: {schedule.equipment} ({schedule.equipmentName})</p>
                          <p className="text-sm text-gray-600 mb-1">담당: {schedule.assignee}</p>
                          {schedule.description && (
                            <p className="text-sm text-gray-500">{schedule.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => openEditScheduleModal(schedule)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => openDeleteConfirmModal(schedule)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>등록된 일정이 없습니다</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDayDetailModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
              <button
                onClick={() => openNewScheduleModal(selectedDateForDetail)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                새 일정 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirmModal && scheduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">일정 삭제 확인</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">다음 일정을 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-mono">
                    {scheduleToDelete.scheduleNumber}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs text-white ${getScheduleTypeColor(scheduleToDelete.type)}`}>
                    {scheduleToDelete.type}
                  </span>
                  <span className="font-medium">{scheduleToDelete.title}</span>
                </div>
                <p className="text-sm text-gray-600">설비: {scheduleToDelete.equipment} ({scheduleToDelete.equipmentName})</p>
                <p className="text-sm text-gray-600">담당: {scheduleToDelete.assignee}</p>
                <p className="text-sm text-gray-600">날짜: {scheduleToDelete.date}</p>
              </div>
              <p className="text-red-600 text-sm mt-3">⚠️ 삭제된 일정은 복구할 수 없습니다.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setScheduleToDelete(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteSchedule}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditScheduleModal && editingSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">일정 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업명</label>
                <input
                  type="text"
                  value={editingSchedule.title}
                  onChange={(e) => setEditingSchedule({...editingSchedule, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 터빈 정기점검"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업일</label>
                <input
                  type="date"
                  value={editingSchedule.date}
                  onChange={(e) => setEditingSchedule({...editingSchedule, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공종</label>
                <select
                  value={editingSchedule.type}
                  onChange={(e) => setEditingSchedule({...editingSchedule, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="기계">기계</option>
                  <option value="전기">전기</option>
                  <option value="제어">제어</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설비명</label>
                <select
                  value={editingSchedule.equipment}
                  onChange={(e) => setEditingSchedule({...editingSchedule, equipment: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.name}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기기명</label>
                <input
                  type="text"
                  value={editingSchedule.equipmentName || ''}
                  onChange={(e) => setEditingSchedule({...editingSchedule, equipmentName: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: T-3000, B-2500, G-1800"
                />
                <p className="text-xs text-gray-500 mt-1">설비의 정확한 모델명을 입력해주세요</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                <select
                  value={editingSchedule.assignee}
                  onChange={(e) => setEditingSchedule({...editingSchedule, assignee: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {personnel.map(person => (
                    <option key={person.id} value={person.name}>{person.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업내용</label>
                <textarea
                  value={editingSchedule.description}
                  onChange={(e) => setEditingSchedule({...editingSchedule, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="작업 내용 설명"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditScheduleModal(false);
                  setEditingSchedule(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={updateSchedule}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">새 일정 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">번호</label>
                <input
                  type="text"
                  value={newSchedule.scheduleNumber}
                  onChange={(e) => setNewSchedule({...newSchedule, scheduleNumber: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 25-5 (연도 2자리-순번)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  현재 연도: {new Date().getFullYear()}년 → {new Date().getFullYear().toString().slice(-2)}-N 형식
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업명</label>
                <input
                  type="text"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 터빈 정기점검"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업일</label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공종</label>
                <select
                  value={newSchedule.type}
                  onChange={(e) => setNewSchedule({...newSchedule, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="기계">기계</option>
                  <option value="전기">전기</option>
                  <option value="제어">제어</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설비명</label>
                <select
                  value={newSchedule.equipment}
                  onChange={(e) => setNewSchedule({...newSchedule, equipment: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.name}>{eq.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기기명</label>
                <input
                  type="text"
                  value={newSchedule.equipmentName}
                  onChange={(e) => setNewSchedule({...newSchedule, equipmentName: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: T-3000, B-2500, G-1800"
                />
                <p className="text-xs text-gray-500 mt-1">설비의 정확한 모델명을 입력해주세요</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                <select
                  value={newSchedule.assignee}
                  onChange={(e) => setNewSchedule({...newSchedule, assignee: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">선택하세요</option>
                  {personnel.map(person => (
                    <option key={person.id} value={person.name}>{person.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">작업내용</label>
                <textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="작업 내용 설명"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setNewSchedule({ scheduleNumber: '', title: '', date: '', type: '기계', equipment: '', equipmentName: '', assignee: '', description: '' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={addNewSchedule}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEquipment = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">설비 이력 관리</h2>
        <button
          onClick={() => setShowAddEquipmentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          설비 추가
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="설비명, 모델명, 제조사로 검색..."
            value={equipmentSearchTerm}
            onChange={(e) => setEquipmentSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedEquipmentStatus}
          onChange={(e) => setSelectedEquipmentStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 상태</option>
          <option value="정상">정상</option>
          <option value="점검필요">점검필요</option>
          <option value="고장">고장</option>
          <option value="정비중">정비중</option>
        </select>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설비명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제조사</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">마지막 정비일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">다음 정비일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정비 이력</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getFilteredEquipment().map(eq => (
              <tr key={eq.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{eq.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{eq.model}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{eq.manufacturer}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEquipmentStatusColor(eq.status)}`}>
                    {eq.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{getLastMaintenanceDate(eq.name, eq.model)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{getNextMaintenanceDate(eq.name, eq.model)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => openEquipmentDetail(eq)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    보기 ({workOrders.filter(order => order.equipment === eq.name || order.equipmentName === eq.model).length})
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditEquipmentModal(eq)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => openDeleteEquipmentModal(eq)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Equipment Detail Modal */}
      {showEquipmentModal && selectedEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{selectedEquipment.name} 상세 정보</h3>
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 기본 정보 */}
              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-semibold text-lg mb-3">기본 정보</h4>
                <div className="space-y-2">
                  <div><strong>설비명:</strong> {selectedEquipment.name}</div>
                  <div><strong>모델명:</strong> {selectedEquipment.model}</div>
                  <div><strong>제조사:</strong> {selectedEquipment.manufacturer}</div>
                  <div><strong>위치:</strong> {selectedEquipment.location}</div>
                  <div>
                    <strong>상태:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getEquipmentStatusColor(selectedEquipment.status)}`}>
                      {selectedEquipment.status}
                    </span>
                  </div>
                  <div><strong>마지막 정비:</strong> {getLastMaintenanceDate(selectedEquipment.name, selectedEquipment.model)}</div>
                  <div><strong>다음 정비 예정일:</strong> {getNextMaintenanceDate(selectedEquipment.name, selectedEquipment.model)}</div>
                </div>
              </div>

              {/* 상세 스펙 */}
              <div className="bg-gray-50 p-4 rounded border">
                <h4 className="font-semibold text-lg mb-3">상세 스펙</h4>
                <div className="space-y-2">
                  {Object.entries(selectedEquipment.specifications).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 정비 이력 */}
            <div className="mt-6">
              <h4 className="font-semibold text-lg mb-3">정비 이력</h4>
              <div className="bg-white border rounded">
                {(() => {
                  const maintenanceHistory = workOrders.filter(order => 
                    order.equipment === selectedEquipment.name || order.equipmentName === selectedEquipment.model
                  );
                  return maintenanceHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">작업번호</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">작업명</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">설비명</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">기기명</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">작업일</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">담당자</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {maintenanceHistory.map(order => (
                            <tr key={order.id}>
                              <td className="px-4 py-2 text-sm font-medium">{order.id}</td>
                              <td className="px-4 py-2 text-sm">{order.title}</td>
                              <td className="px-4 py-2 text-sm">{order.equipment}</td>
                              <td className="px-4 py-2 text-sm">{order.equipmentName}</td>
                              <td className="px-4 py-2 text-sm">{order.dueDate}</td>
                              <td className="px-4 py-2 text-sm">{order.assignee}</td>
                              <td className="px-4 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Settings className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>등록된 정비 이력이 없습니다</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowEquipmentModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">새 설비 등록</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설비명 *</label>
                <input
                  type="text"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 터빈"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">모델명 *</label>
                <input
                  type="text"
                  value={newEquipment.model}
                  onChange={(e) => setNewEquipment({...newEquipment, model: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: Ovation 3.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제조사 *</label>
                <input
                  type="text"
                  value={newEquipment.manufacturer}
                  onChange={(e) => setNewEquipment({...newEquipment, manufacturer: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: ABB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
                <input
                  type="text"
                  value={newEquipment.location}
                  onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 열원설비동"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={newEquipment.status}
                  onChange={(e) => setNewEquipment({...newEquipment, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="정상">정상</option>
                  <option value="점검필요">점검필요</option>
                  <option value="고장">고장</option>
                  <option value="정비중">정비중</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">상세 스펙</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">출력/용량</label>
                  <input
                    type="text"
                    value={newEquipment.specifications.power}
                    onChange={(e) => setNewEquipment({
                      ...newEquipment, 
                      specifications: {...newEquipment.specifications, power: e.target.value}
                    })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 500MW"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
                  <input
                    type="text"
                    value={newEquipment.specifications.type}
                    onChange={(e) => setNewEquipment({
                      ...newEquipment, 
                      specifications: {...newEquipment.specifications, type: e.target.value}
                    })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 증기터빈"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">추가 사양</label>
                  <input
                    type="text"
                    value={newEquipment.specifications.capacity}
                    onChange={(e) => setNewEquipment({
                      ...newEquipment, 
                      specifications: {...newEquipment.specifications, capacity: e.target.value}
                    })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 천연가스"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              * 표시는 필수 입력 항목입니다.
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddEquipmentModal(false);
                  setNewEquipment({
                    name: '',
                    model: '',
                    manufacturer: '',
                    installDate: '',
                    status: '정상',
                    location: '',
                    specifications: {
                      power: '',
                      type: '',
                      capacity: ''
                    }
                  });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={addNewEquipment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditEquipmentModal && editingEquipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">설비 정보 수정</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설비명</label>
                <input
                  type="text"
                  value={editingEquipment.name}
                  onChange={(e) => setEditingEquipment({...editingEquipment, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">모델명</label>
                <input
                  type="text"
                  value={editingEquipment.model}
                  onChange={(e) => setEditingEquipment({...editingEquipment, model: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제조사</label>
                <input
                  type="text"
                  value={editingEquipment.manufacturer}
                  onChange={(e) => setEditingEquipment({...editingEquipment, manufacturer: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
                <input
                  type="text"
                  value={editingEquipment.location}
                  onChange={(e) => setEditingEquipment({...editingEquipment, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={editingEquipment.status}
                  onChange={(e) => setEditingEquipment({...editingEquipment, status: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="정상">정상</option>
                  <option value="점검필요">점검필요</option>
                  <option value="고장">고장</option>
                  <option value="정비중">정비중</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">상세 스펙</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">출력/용량</label>
                  <input
                    type="text"
                    value={editingEquipment.specifications?.power || ''}
                    onChange={(e) => setEditingEquipment({
                      ...editingEquipment, 
                      specifications: {...editingEquipment.specifications, power: e.target.value}
                    })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
                  <input
                    type="text"
                    value={editingEquipment.specifications?.type || ''}
                    onChange={(e) => setEditingEquipment({
                      ...editingEquipment, 
                      specifications: {...editingEquipment.specifications, type: e.target.value}
                    })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">추가 사양</label>
                  <input
                    type="text"
                    value={editingEquipment.specifications?.capacity || ''}
                    onChange={(e) => setEditingEquipment({
                      ...editingEquipment, 
                      specifications: {...editingEquipment.specifications, capacity: e.target.value}
                    })}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditEquipmentModal(false);
                  setEditingEquipment(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={updateEquipment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Equipment Confirmation Modal */}
      {showDeleteEquipmentModal && equipmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">설비 삭제 확인</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">다음 설비를 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEquipmentStatusColor(equipmentToDelete.status)}`}>
                    {equipmentToDelete.status}
                  </span>
                  <span className="font-medium">{equipmentToDelete.name}</span>
                </div>
                <p className="text-sm text-gray-600">모델: {equipmentToDelete.model}</p>
                <p className="text-sm text-gray-600">제조사: {equipmentToDelete.manufacturer}</p>
                <p className="text-sm text-gray-600">설치일: {equipmentToDelete.installDate}</p>
              </div>
              <p className="text-red-600 text-sm mt-3">⚠️ 삭제된 설비 정보는 복구할 수 없습니다.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteEquipmentModal(false);
                  setEquipmentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteEquipment}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCommunication = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">커뮤니케이션</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">공지사항</h3>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              공지 작성
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {announcements.length > 0 ? (
              announcements.map(announcement => (
                <div key={announcement.id} className="p-4 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(announcement.priority)}`}>
                        {getPriorityText(announcement.priority)}
                      </span>
                      <h4 
                        className="font-medium text-sm hover:text-blue-600"
                        onClick={() => openAnnouncementDetail(announcement)}
                      >
                        {announcement.title}
                      </h4>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditAnnouncementModal(announcement);
                        }}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        title="수정"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteAnnouncementModal(announcement);
                        }}
                        className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        title="삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p 
                    className="text-sm text-gray-600 cursor-pointer overflow-hidden"
                    onClick={() => openAnnouncementDetail(announcement)}
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {announcement.date} | {announcement.author}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">등록된 공지사항이 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">실시간 채팅</h3>
          <div className="border rounded h-64 p-4 overflow-y-auto mb-4 bg-gray-50">
            <div className="space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`${msg.isUser ? 'flex justify-end' : 'flex justify-start'}`}>
                  <div className={`max-w-xs p-2 rounded ${
                    msg.isUser ? 'bg-white ml-auto' : 'bg-blue-100'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {msg.sender} • {formatChatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleMessageKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={sendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">새 공지사항 작성</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">일반</option>
                  <option value="important">중요</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="공지사항 제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  placeholder="공지사항 내용을 입력하세요"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAnnouncementModal(false);
                  setNewAnnouncement({ title: '', content: '', priority: 'normal' });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={addNewAnnouncement}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {showEditAnnouncementModal && editingAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">공지사항 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                <select
                  value={editingAnnouncement.priority}
                  onChange={(e) => setEditingAnnouncement({...editingAnnouncement, priority: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">일반</option>
                  <option value="important">중요</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({...editingAnnouncement, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={editingAnnouncement.content}
                  onChange={(e) => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  rows="6"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditAnnouncementModal(false);
                  setEditingAnnouncement(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={updateAnnouncement}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Announcement Confirmation Modal */}
      {showDeleteAnnouncementModal && announcementToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">공지사항 삭제 확인</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">다음 공지사항을 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityColor(announcementToDelete.priority)}`}>
                    {getPriorityText(announcementToDelete.priority)}
                  </span>
                  <span className="font-medium">{announcementToDelete.title}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{announcementToDelete.content.substring(0, 100)}...</p>
                <p className="text-xs text-gray-500 mt-2">{announcementToDelete.date} | {announcementToDelete.author}</p>
              </div>
              <p className="text-red-600 text-sm mt-3">⚠️ 삭제된 공지사항은 복구할 수 없습니다.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteAnnouncementModal(false);
                  setAnnouncementToDelete(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteAnnouncement}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {showAnnouncementDetailModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded border ${getPriorityColor(selectedAnnouncement.priority)}`}>
                  {getPriorityText(selectedAnnouncement.priority)}
                </span>
                <h3 className="text-xl font-semibold">{selectedAnnouncement.title}</h3>
              </div>
              <button
                onClick={() => {
                  setShowAnnouncementDetailModal(false);
                  setSelectedAnnouncement(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {selectedAnnouncement.date} | {selectedAnnouncement.author}
              </p>
            </div>
            
            <div className="mb-6">
              <div className="bg-gray-50 p-4 rounded border">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                  {selectedAnnouncement.content}
                </pre>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAnnouncementDetailModal(false);
                  openEditAnnouncementModal(selectedAnnouncement);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                수정
              </button>
              <button
                onClick={() => {
                  setShowAnnouncementDetailModal(false);
                  setSelectedAnnouncement(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">문서 관리</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          파일 업로드
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="파일명으로 검색..."
            value={documentSearchTerm}
            onChange={(e) => setDocumentSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedDocumentCategory}
          onChange={(e) => setSelectedDocumentCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">전체 카테고리</option>
          <option value="설비 도면">설비 도면</option>
          <option value="작업 매뉴얼">작업 매뉴얼</option>
        </select>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {['설비 도면', '작업 매뉴얼'].map(category => {
          const categoryDocs = getFilteredDocuments().filter(doc => doc.category === category);
          
          return (
            <div key={category} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{category}</h3>
                <span className="text-sm text-gray-500">
                  {categoryDocs.length}개 파일
                </span>
              </div>
              
              <div className="space-y-3">
                {categoryDocs.length > 0 ? (
                  categoryDocs.map(doc => {
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          {/* File Icon */}
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                          
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="font-medium text-sm truncate">{doc.name}</span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs flex-shrink-0">
                                {doc.type}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {doc.size} • {doc.uploadDate} • {doc.uploader}
                            </p>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                            title="파일 다운로드"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openDeleteDocumentModal(doc)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                            title="파일 삭제"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">등록된 {category}이 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">파일 업로드</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="설비 도면">설비 도면</option>
                  <option value="작업 매뉴얼">작업 매뉴얼</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">파일 선택</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                />
                <p className="text-xs text-gray-500 mt-1">
                  지원 형식: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF
                </p>
              </div>
              
              {/* File List */}
              {filePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">선택된 파일</label>
                  <div className="space-y-2">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="relative flex items-center gap-3 p-3 bg-gray-50 border rounded">
                        <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate" title={preview.name}>
                            {preview.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {preview.type === 'image' ? '이미지' : 
                             preview.type === 'pdf' ? 'PDF 문서' : '문서'} 파일
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const newPreviews = filePreviews.filter((_, i) => i !== index);
                            const newFiles = selectedFiles.filter((_, i) => i !== index);
                            URL.revokeObjectURL(preview.url);
                            setFilePreviews(newPreviews);
                            setSelectedFiles(newFiles);
                          }}
                          className="w-8 h-8 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center flex-shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  clearSelectedFiles();
                  setShowUploadModal(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              {selectedFiles.length > 0 && (
                <button
                  onClick={handleFileUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  업로드 ({selectedFiles.length}개)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation Modal */}
      {showDeleteDocumentModal && documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">문서 삭제 확인</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-2">다음 문서를 삭제하시겠습니까?</p>
              <div className="p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{documentToDelete.name}</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {documentToDelete.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600">카테고리: {documentToDelete.category}</p>
                <p className="text-sm text-gray-600">크기: {documentToDelete.size}</p>
                <p className="text-sm text-gray-600">업로드일: {documentToDelete.uploadDate}</p>
                <p className="text-sm text-gray-600">업로더: {documentToDelete.uploader}</p>
              </div>
              <p className="text-red-600 text-sm mt-3">⚠️ 삭제된 문서는 복구할 수 없습니다.</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteDocumentModal(false);
                  setDocumentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={confirmDeleteDocument}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'personnel': return renderPersonnelManagement();
      case 'work-orders': return renderWorkOrders();
      case 'schedule': return renderSchedule();
      case 'equipment': return renderEquipment();
      case 'communication': return renderCommunication();
      case 'documents': return renderDocuments();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {renderSidebar()}
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default MaintenanceManagementSystem;