import { useState, useEffect } from 'react';
import * as React from 'react';
import { Calendar, Users, Settings, FileText, MessageSquare, Wrench, Home, Plus, Edit, Trash2, X, Download, Upload, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import AuthCallback from './AuthCallback';
import ResetPasswordPage from './ResetPasswordPage';

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
  workResult: string;
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
}

interface Document {
  id: number | string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadDate: string;
  description?: string;
  fileData?: string; // Base64 encoded file data for local storage
}


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

const MaintenanceManagementSystem = () => {
  // URL 경로 확인
  const pathname = window.location.pathname;
  
  // 특수 경로 처리
  if (pathname === '/auth/callback') {
    return <AuthCallback />;
  }
  
  if (pathname === '/reset-password') {
    return <ResetPasswordPage />;
  }
  // 인증 상태
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  });
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password'>('login');
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // 문서 관리 상태
  const [documents, setDocuments] = useState<Document[]>(() => 
    loadFromStorage('documents', [
      {
        id: 1,
        name: '안전매뉴얼_v2.pdf',
        size: 2048576,
        type: 'application/pdf',
        category: '안전',
        uploadDate: '2025-06-01',
        description: '작업 안전 가이드라인'
      },
      {
        id: 2,
        name: '정비절차서.docx',
        size: 1024768,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        category: '매뉴얼',
        uploadDate: '2025-05-28',
        description: '표준 정비 절차'
      }
    ])
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadCategory, setUploadCategory] = useState('매뉴얼');
  const [uploadDescription, setUploadDescription] = useState('');

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
      workResult: '오일필터 교체 완료. 누유 없음 확인.',
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
      workResult: '',
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
      workResult: '',
      status: '진행중',
      assignee: '김태연',
      completionNote: '',
      attachments: [],
      type: '전기'
    },
    {
      id: '25-4',
      title: 'PLC 점검',
      equipment: '제어반',
      equipmentName: 'PLC-200',
      description: 'PLC 프로그램 점검 및 백업',
      requestDate: '2025-06-05',
      dueDate: '2025-06-07',
      workResult: '',
      status: '대기',
      assignee: '박정호',
      completionNote: '',
      attachments: [],
      type: '제어'
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
  // Check authentication on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      // First check Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated with Supabase Auth
        const user = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
          fullName: session.user.user_metadata?.full_name || '사용자',
          role: session.user.user_metadata?.role || 'user'
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Body 클래스 추가
        document.body.classList.add('authenticated');
        document.body.classList.remove('unauthenticated');
      } else {
        // Check localStorage as fallback
        const storedAuth = localStorage.getItem('isAuthenticated');
        const storedUser = localStorage.getItem('currentUser');
        
        if (storedAuth === 'true' && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setIsAuthenticated(true);
            
            // Body 클래스 추가
            document.body.classList.add('authenticated');
            document.body.classList.remove('unauthenticated');
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            setIsAuthenticated(false);
            
            // Body 클래스 추가
            document.body.classList.add('unauthenticated');
            document.body.classList.remove('authenticated');
          }
        } else {
          // No stored auth
          setIsAuthenticated(false);
          
          // Body 클래스 추가
          document.body.classList.add('unauthenticated');
          document.body.classList.remove('authenticated');
        }
      }
    };
    
    checkAuth();
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // User logged out
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        
        // Body 클래스 추가
        document.body.classList.add('unauthenticated');
        document.body.classList.remove('authenticated');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  // Handle click events
  const handleWorkOrderClick = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
  };

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
  };

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

  // Excel download functions
  const downloadWorkOrdersExcel = () => {
    // 설비별로 작업 이력 그룹화
    const equipmentGroups = workOrders.reduce((groups, order) => {
      const equipmentName = order.equipment;
      if (!groups[equipmentName]) {
        groups[equipmentName] = [];
      }
      groups[equipmentName].push({
        '작업번호': order.id,
        '작업명': order.title,
        '설비명': order.equipment,
        '기기명': order.equipmentName,
        '작업내용': order.description,
        '작업일': order.dueDate, // 완료예정일을 작업일로 사용
        '담당자': order.assignee
      });
      return groups;
    }, {} as Record<string, any[]>);

    const workbook = XLSX.utils.book_new();
    
    // 각 설비별로 시트 생성
    Object.keys(equipmentGroups).forEach(equipmentName => {
      const worksheet = XLSX.utils.json_to_sheet(equipmentGroups[equipmentName]);
      XLSX.utils.book_append_sheet(workbook, worksheet, equipmentName);
    });
    
    XLSX.writeFile(workbook, '설비별_작업이력.xlsx');
  };

  // Storage 버킷 확인 함수
  const checkStorageBucket = async () => {
    try {
      // documents 버킷의 파일 목록을 조회하여 버킷 존재 여부 확인
      const { data, error } = await supabase.storage
        .from('documents')
        .list('', { limit: 1 });
        
      if (error) {
        console.error('Documents 버킷 접근 에러:', error);
        if (error.message.includes('not found')) {
          console.warn('⚠️ documents 버킷이 존재하지 않습니다!');
          console.warn('Supabase 대시보드에서 다음을 수행하세요:');
          console.warn('1. Storage 섹션으로 이동');
          console.warn('2. "New bucket" 클릭');
          console.warn('3. 이름: "documents" 입력');
          console.warn('4. Public 버킷으로 설정 또는 RLS 정책 추가');
        }
      } else {
        console.log('✅ documents 버킷이 정상적으로 확인되었습니다.');
        console.log('버킷 내 파일 수:', data?.length || 0);
      }
    } catch (error) {
      console.error('Storage 버킷 확인 중 오류:', error);
    }
  };

  // 컴포넌트 마운트 시 버킷 확인
  useEffect(() => {
    checkStorageBucket();
  }, []);

  // 문서 관리 함수들
  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      const uploadedDocuments: Document[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documents/${fileName}`;
        
        // 1. Storage에 파일 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Supabase Storage 업로드 에러:', uploadError);
          console.error('에러 상세:', {
            message: uploadError.message,
            details: uploadError
          });
          // Storage 버킷이 없을 수도 있으므로 로컬 스토리지로 폴백
          // 파일을 Base64로 변환하여 저장
          const reader = new FileReader();
          const fileData = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          const newDoc: Document = {
            id: Date.now() + i,
            name: file.name,
            size: file.size,
            type: file.type,
            category: uploadCategory,
            uploadDate: new Date().toISOString().split('T')[0],
            description: uploadDescription,
            fileData: fileData
          };
          uploadedDocuments.push(newDoc);
          continue;
        }
        
        // 2. Database에 파일 정보 저장
        const { data: dbData, error: dbError } = await supabase
          .from('documents')
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            category: uploadCategory,
            description: uploadDescription,
            uploaded_by: '관리자'
          })
          .select()
          .single();
          
        if (dbError) {
          console.error('DB 저장 에러:', dbError);
          // DB 에러 시에도 로컬에 저장
          // 파일을 Base64로 변환하여 저장
          const reader = new FileReader();
          const fileData = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          const newDoc: Document = {
            id: Date.now() + i,
            name: file.name,
            size: file.size,
            type: file.type,
            category: uploadCategory,
            uploadDate: new Date().toISOString().split('T')[0],
            description: uploadDescription,
            fileData: fileData
          };
          uploadedDocuments.push(newDoc);
        } else if (dbData) {
          // 성공적으로 저장됨
          const newDoc: Document = {
            id: dbData.id,
            name: dbData.file_name,
            size: dbData.file_size,
            type: dbData.file_type,
            category: dbData.category || uploadCategory,
            uploadDate: dbData.uploaded_at,
            description: dbData.description
          };
          uploadedDocuments.push(newDoc);
        }
      }
      
      // 로컬 상태 업데이트
      const updatedDocuments = [...documents, ...uploadedDocuments];
      setDocuments(updatedDocuments);
      saveToStorage('documents', updatedDocuments);
      
      // 상태 초기화
      setSelectedFiles(null);
      setUploadDescription('');
      setShowUploadModal(false);
      
      alert(`${uploadedDocuments.length}개의 문서가 업로드되었습니다.`);
    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    }
  };

  const deleteDocument = async (documentId: number | string) => {
    try {
      // 문서 정보 찾기
      const documentToDelete = documents.find(doc => doc.id === documentId);
      if (!documentToDelete) return;
      
      // UUID 형식인 경우 Supabase에서 삭제
      if (typeof documentId === 'string' && documentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // DB에서 파일 경로 가져오기
        const { data: dbDoc, error: fetchError } = await supabase
          .from('documents')
          .select('file_path')
          .eq('id', documentId)
          .single();
          
        if (!fetchError && dbDoc) {
          // Storage에서 파일 삭제
          await supabase.storage
            .from('documents')
            .remove([dbDoc.file_path]);
        }
        
        // DB에서 레코드 삭제
        const { error: deleteError } = await supabase
          .from('documents')
          .delete()
          .eq('id', documentId);
          
        if (deleteError) {
          console.error('DB 삭제 에러:', deleteError);
        }
      }
      
      // 로컬 상태에서 삭제
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);
      saveToStorage('documents', updatedDocuments);
      alert('문서가 삭제되었습니다.');
    } catch (error) {
      console.error('문서 삭제 중 오류:', error);
      alert('문서 삭제 중 오류가 발생했습니다.');
    }
  };

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    saveToStorage('documents', documents);
  }, [documents]);
  
  // Supabase에서 문서 목록 가져오기
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('uploaded_at', { ascending: false });
          
        if (error) {
          console.error('문서 목록 가져오기 에러:', error);
          return;
        }
        
        if (data && data.length > 0) {
          const supabaseDocuments: Document[] = data.map(doc => ({
            id: doc.id,
            name: doc.file_name,
            size: doc.file_size,
            type: doc.file_type,
            category: doc.category || '기타',
            uploadDate: doc.uploaded_at,
            description: doc.description
          }));
          
          // 로컬 문서와 병합 (중복 제거)
          const localDocuments = loadFromStorage<Document[]>('documents', []);
          const mergedDocuments = [...supabaseDocuments];
          
          localDocuments.forEach(localDoc => {
            if (!mergedDocuments.find(doc => doc.id === localDoc.id)) {
              mergedDocuments.push(localDoc);
            }
          });
          
          setDocuments(mergedDocuments);
        }
      } catch (error) {
        console.error('문서 목록 가져오기 중 오류:', error);
      }
    };
    
    fetchDocuments();
  }, []);

  // Navigation
  const renderNavigation = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-1">정비 업체 관리 시스템</h1>
              <div className="flex items-center gap-2 justify-center w-full">
                <img src="/wideincheon-logo.png" alt="위드인천에너지" className="h-6 w-auto" />
                <span className="text-gray-400 text-sm">×</span>
                <img src="/youngjin-logo.png" alt="영진" className="h-6 w-auto" />
              </div>
            </div>
            <div className="flex space-x-1">
              {[
                { id: 'dashboard', label: '대시보드', icon: Home },
                { id: 'announcements', label: '공지사항', icon: MessageSquare },
                { id: 'workorder', label: '작업 관리', icon: Wrench },
                { id: 'schedule', label: '작업 일정', icon: Calendar },
                { id: 'equipment', label: '설비관리', icon: Settings },
                { id: 'documents', label: '문서관리', icon: FileText },
                { id: 'personnel', label: '인력관리', icon: Users }
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
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {currentUser?.fullName} ({currentUser?.role})
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              로그아웃
            </button>
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
              <div key={order.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleWorkOrderClick(order)}>
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
              <div key={announcement.id} className="p-3 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleAnnouncementClick(announcement)}>
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(order.type)}`}>
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
    workResult: '',
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
      workResult: '',
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
      workResult: order.workResult || '',
      assignee: order.assignee,
      type: order.type
    });
    setShowWorkOrderForm(true);
  };

  // 인증 관련 함수
  const handleLoginSuccess = (user: any) => {
    // username이 없으면 email에서 추출
    if (!user.username && user.email) {
      user.username = user.email.split('@')[0];
    }
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    setAuthView('login');
    
    // Body 클래스 추가
    document.body.classList.add('authenticated');
    document.body.classList.remove('unauthenticated');
  };

  const handleSignupSuccess = () => {
    setAuthView('login');
  };

  const handleLogout = async () => {
    try {
      // Supabase 로그아웃
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('로그아웃 에러:', error);
      }
      
      // 상태 초기화
      setCurrentUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      setCurrentPage('dashboard');
      
      // Body 클래스 추가
      document.body.classList.add('unauthenticated');
      document.body.classList.remove('authenticated');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteWorkOrder = (id: string) => {
    setWorkOrders(prev => prev.filter(order => order.id !== id));
  };

  const handleUpdateWorkOrderStatus = (id: string, status: string) => {
    // 완료 상태로 변경하려는 경우 작업 결과가 있는지 확인
    if (status === '완료') {
      const order = workOrders.find(o => o.id === id);
      if (order && !order.workResult) {
        alert('작업 결과를 기입해주세요');
        return;
      }
    }
    
    setWorkOrders(prev => prev.map(order => 
      order.id === id ? { ...order, status } : order
    ));
  };

  const renderWorkOrder = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">작업 관리</h2>
          <div className="flex gap-3">
            <button
              onClick={downloadWorkOrdersExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Excel 다운로드
            </button>
            <button
              onClick={() => setShowWorkOrderForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              작업 등록
            </button>
          </div>
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
                placeholder="작업 내용"
                value={workOrderForm.description}
                onChange={(e) => setWorkOrderForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                required
              />
              <textarea
                placeholder="작업 결과"
                value={workOrderForm.workResult}
                onChange={(e) => setWorkOrderForm(prev => ({ ...prev, workResult: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
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
                      workResult: '',
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
          <table className="w-full border border-gray-200" style={{ minWidth: '1600px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-20">번호</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-32">작업명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-20">분류</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-24">설비명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-32">기기명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '400px' }}>작업내용</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-28">등록일</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-28">작업일</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '400px' }}>작업결과</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-24">상태</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-24">담당자</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-20">관리</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b text-sm font-mono whitespace-nowrap w-20">{order.id}</td>
                  <td className="px-4 py-2 border-b text-sm font-medium whitespace-nowrap w-32">{order.title}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-20">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(order.type)}`}>
                      {order.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-24">{order.equipment}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-32">{order.equipmentName}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-pre-line" style={{ width: '400px' }}>{order.description}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-28">{order.requestDate}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-28">{order.dueDate}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-pre-line" style={{ width: '400px' }}>{order.workResult || '-'}</td>
                  <td className="px-4 py-2 border-b text-sm w-24">
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
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-24">{order.assignee}</td>
                  <td className="px-4 py-2 border-b text-sm w-20">
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
    specifications: {} as any
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
      specifications: {}
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
      specifications: { ...eq.specifications }
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
                  <table className="w-full border border-gray-200" style={{ minWidth: '1600px' }}>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-20">번호</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-32">작업명</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-24">설비명</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-32">기기명</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '400px' }}>작업내용</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-28">작업일</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-24">담당자</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '400px' }}>작업결과</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 w-24">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceHistory.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-20">{order.id}</td>
                          <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-32">{order.title}</td>
                          <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-24">{order.equipment}</td>
                          <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-32">{order.equipmentName}</td>
                          <td className="px-4 py-2 border-b text-sm whitespace-pre-line" style={{ width: '400px' }}>{order.description}</td>
                          <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-28">{order.dueDate}</td>
                          <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-24">{order.assignee}</td>
                          <td className="px-4 py-2 border-b text-sm whitespace-pre-line" style={{ width: '400px' }}>{order.workResult || '-'}</td>
                          <td className="px-4 py-2 border-b text-sm w-24">
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
                        specifications: {}
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
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">상세 정보</th>
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">문서 관리</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Upload className="w-4 h-4" />
          문서 업로드
        </button>
      </div>

      {/* 문서 목록 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">문서명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">파일 크기</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">업로드일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">업로더</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      {doc.description && (
                        <div className="text-sm text-gray-500">{doc.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {doc.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(doc.size / 1024 / 1024).toFixed(2)} MB
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(doc.uploadDate).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  관리자
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        // UUID 형식인 경우 Supabase에서 다운로드
                        if (typeof doc.id === 'string' && doc.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                          try {
                            // DB에서 파일 경로 가져오기
                            const { data: dbDoc } = await supabase
                              .from('documents')
                              .select('file_path')
                              .eq('id', doc.id)
                              .single();
                              
                            if (dbDoc) {
                              // Storage에서 파일 다운로드 URL 생성
                              const { data } = await supabase.storage
                                .from('documents')
                                .createSignedUrl(dbDoc.file_path, 3600); // 1시간 유효
                                
                              if (data) {
                                window.open(data.signedUrl, '_blank');
                              } else {
                                alert('파일을 다운로드할 수 없습니다.');
                              }
                            }
                          } catch (error) {
                            console.error('파일 다운로드 오류:', error);
                            alert('파일 다운로드 중 오류가 발생했습니다.');
                          }
                        } else {
                          // 로컬에 저장된 파일 다운로드
                          const localDoc = documents.find(d => d.id === doc.id);
                          if (localDoc && localDoc.fileData) {
                            // Base64 데이터를 Blob으로 변환
                            const base64Data = localDoc.fileData.split(',')[1];
                            const byteCharacters = atob(base64Data);
                            const byteNumbers = new Array(byteCharacters.length);
                            for (let i = 0; i < byteCharacters.length; i++) {
                              byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }
                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: localDoc.type });
                            
                            // 다운로드 링크 생성
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = localDoc.name;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } else {
                            alert('파일 데이터를 찾을 수 없습니다.');
                          }
                        }
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      다운로드
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>업로드된 문서가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">문서 업로드</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">파일 선택</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="매뉴얼">매뉴얼</option>
                  <option value="보고서">보고서</option>
                  <option value="도면">도면</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택사항)</label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="문서에 대한 간단한 설명을 입력하세요"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFiles || selectedFiles.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                업로드
              </button>
            </div>
          </div>
        </div>
      )}
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
            onClick={() => {
              setShowAnnouncementForm(true);
              setAnnouncementForm(prev => ({ ...prev, author: currentUser?.fullName || '관리자' }));
            }}
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
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                readOnly
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
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-700">우선순위</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">제목</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">작성자</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">작성일</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority === 'urgent' ? '긴급' :
                       announcement.priority === 'important' ? '중요' : '일반'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedAnnouncement(announcement)}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                    >
                      {announcement.title}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{announcement.author}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{announcement.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-1">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {announcements.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 공지사항 상세 모달 */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAnnouncement.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>작성자: {selectedAnnouncement.author}</span>
                    <span>작성일: {selectedAnnouncement.date}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedAnnouncement.priority)}`}>
                      {selectedAnnouncement.priority === 'urgent' ? '긴급' :
                       selectedAnnouncement.priority === 'important' ? '중요' : '일반'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {selectedAnnouncement.content}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

  // 인증되지 않은 경우 로그인/회원가입/비밀번호 재설정 페이지 표시
  if (!isAuthenticated) {
    switch (authView) {
      case 'signup':
        return (
          <SignupPage 
            onSignupSuccess={handleSignupSuccess}
            onBackToLogin={() => setAuthView('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordPage 
            onBackToLogin={() => setAuthView('login')}
          />
        );
      default:
        return (
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onShowSignup={() => setAuthView('signup')}
            onShowForgotPassword={() => setAuthView('forgot-password')}
          />
        );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      
      {/* Work Order Detail Modal */}
      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">작업 상세 정보</h2>
                <button
                  onClick={() => setSelectedWorkOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">작업 번호</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상태</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWorkOrder?.status || '')}`}>
                      {selectedWorkOrder?.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">작업 제목</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">설비</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.equipment}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">설비명</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.equipmentName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">작업 내용</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedWorkOrder?.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">요청일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.requestDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">완료 예정일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.dueDate}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">담당자</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.assignee}</p>
                </div>
                
                {selectedWorkOrder?.completionNote && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">완료 메모</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedWorkOrder?.completionNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">공지사항 상세</h2>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedAnnouncement?.title}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAnnouncement?.priority || '')}`}>
                    {selectedAnnouncement?.priority === 'urgent' ? '긴급' :
                     selectedAnnouncement?.priority === 'important' ? '중요' : '일반'}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedAnnouncement?.content}</p>
                </div>
                
                <div className="border-t pt-4 text-sm text-gray-500">
                  <p>작성일: {selectedAnnouncement?.date}</p>
                  <p>작성자: {selectedAnnouncement?.author}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Work Order Detail Modal */}
      {selectedWorkOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">작업 상세 정보</h2>
                <button
                  onClick={() => setSelectedWorkOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">작업 번호</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상태</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWorkOrder?.status || '')}`}>
                      {selectedWorkOrder?.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">작업 제목</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.title}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">설비</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.equipment}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">설비명</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.equipmentName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">작업 내용</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedWorkOrder?.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">요청일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.requestDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">완료 예정일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.dueDate}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">담당자</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.assignee}</p>
                </div>
                
                {selectedWorkOrder?.completionNote && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">완료 메모</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedWorkOrder?.completionNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">공지사항 상세</h2>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedAnnouncement?.title}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedAnnouncement?.priority || '')}`}>
                    {selectedAnnouncement?.priority === 'urgent' ? '긴급' :
                     selectedAnnouncement?.priority === 'important' ? '중요' : '일반'}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{selectedAnnouncement?.content}</p>
                </div>
                
                <div className="border-t pt-4 text-sm text-gray-500">
                  <p>작성일: {selectedAnnouncement?.date}</p>
                  <p>작성자: {selectedAnnouncement?.author}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagementSystem;