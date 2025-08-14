import { useState, useEffect } from 'react';
import * as React from 'react';
import { Calendar, Users, Settings, FileText, MessageSquare, Wrench, Home, Plus, Edit, Trash2, X, Download, Upload, Eye, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { supabase } from './supabaseClient';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import AuthCallback from './AuthCallback';
import ResetPasswordPage from './ResetPasswordPage';
import WeatherWidget from './components/WeatherWidget';
import { WeatherProvider } from './contexts/WeatherContext';
import { 
  loadPersonnelFromSupabase, 
  loadWorkOrdersFromSupabase, 
  loadSchedulesFromSupabase, 
  loadAnnouncementsFromSupabase, 
  loadEquipmentFromSupabase, 
  loadAttendancesFromSupabase, 
  loadDailyReportsFromSupabase,
  loadTMStatusFromSupabase,
  loadAssigneesFromSupabase
} from './utils/dataSync';

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
  assignee: string[];
  completionNote: string;
  attachments: any[];
  type: string[];
  tmNo?: string;
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

interface Attendance {
  id: string;
  personnelId: number;
  personnelName: string;
  date: string;
  type: '연차' | '반차(오전)' | '반차(오후)' | '공가' | '병가' | '교육';
  note?: string;
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

interface DailyReport {
  id: string;
  date: string;
  mechanical: {
    today: string;
    tomorrow: string;
  };
  youngjinMechanical: {
    today: string;
    tomorrow: string;
  };
  electrical: {
    today: string;
    tomorrow: string;
  };
  youngjinElectrical: {
    today: string;
    tomorrow: string;
  };
  control: {
    today: string;
    tomorrow: string;
  };
  youngjinControl: {
    today: string;
    tomorrow: string;
  };
  attendanceStatus: string;
  safetySlogan: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// TM 현황 메인 데이터 (리스트: 9개 필드, 상세: 모든 필드)
interface TMStatus {
  // 리스트 표시 필드들
  id: string;              // 내부 ID  
  tmNo: string;            // TM NO.
  createdDate: string;     // 작성일
  equipmentName: string;   // 기기명
  description: string;     // 상세설명
  status: string;          // 진행상태
  createdBy: string;       // 만든 사람
  assignee: string;        // 담당자
  images: string[];        // 이미지
  pidLink?: string;        // P&ID
  drawingLink?: string;    // 도면링크
  // 상세 모달 추가 필드들
  faultCode?: string;      // 고장코드
  priority: string;        // 우선순위
  changeManagementTask?: string; // 변경관리대상여부
  workRequest?: string;    // 작업시작
  workDescription?: string; // 작업사항
  workSchedule?: string;   // 작업완료
}




// Convert description to bullet points
const formatDescriptionAsBulletPoints = (description: string | undefined): React.ReactElement => {
  if (!description) return <span className="text-gray-500">내용 없음</span>;
  
  // Split by various delimiters: bullet points (•), periods followed by space, hyphens, or newlines
  const lines = description
    .split(/[•\n]|(?<=\.)\s+(?=[가-힣A-Za-z])|^\s*[-]\s*|^\s*\d+\.\s*/m)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // If no meaningful lines after splitting, show the original text
  if (lines.length === 0 || (lines.length === 1 && lines[0] === description.trim())) {
    // For single line text without clear separators, check if it contains multiple sentences
    const sentences = description.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 1) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {sentences.map((sentence, index) => (
            <li key={index} className="text-sm text-gray-900">
              {sentence.trim()}
            </li>
          ))}
        </ul>
      );
    }
    // Otherwise show as single paragraph
    return <p className="text-sm text-gray-900 whitespace-pre-line">{description}</p>;
  }
  
  return (
    <ul className="list-disc list-inside space-y-1">
      {lines.map((line, index) => (
        <li key={index} className="text-sm text-gray-900">
          {line}
        </li>
      ))}
    </ul>
  );
};

// Convert description to Excel-friendly bullet points
const convertToExcelBulletText = (description: string | undefined): string => {
  if (!description) return '내용 없음';
  
  // Split by various delimiters
  const lines = description
    .split(/[•\n]|(?<=\.)\s+(?=[가-힣A-Za-z])|^\s*[-]\s*|^\s*\d+\.\s*/m)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // If no meaningful lines after splitting, check for sentences
  if (lines.length === 0 || (lines.length === 1 && lines[0] === description.trim())) {
    const sentences = description.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 1) {
      return sentences.map(sentence => `• ${sentence.trim()}`).join('\n');
    }
    return description;
  }
  
  // Return as bullet points with newlines
  return lines.map(line => `• ${line}`).join('\n');
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(() => {
    // 새로고침 시 현재 페이지 기억하기
    return localStorage.getItem('currentPage') || 'dashboard';
  });

  // 페이지 변경 함수 (localStorage에도 저장)
  const handlePageChange = (pageId: string) => {
    setCurrentPage(pageId);
    localStorage.setItem('currentPage', pageId);
  };
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // 문서 관리 상태
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadCategory, setUploadCategory] = useState('매뉴얼');
  const [uploadDescription, setUploadDescription] = useState('');

  // Personnel data
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  // TM 현황 데이터
  const [tmStatusList, setTmStatusList] = useState<TMStatus[]>([]);
  const [selectedTMStatus, setSelectedTMStatus] = useState<TMStatus | null>(null);
  const [showTMDetailModal, setShowTMDetailModal] = useState(false);

  // Attendance Management State
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>('');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [attendanceForm, setAttendanceForm] = useState({
    personnelId: 0,
    personnelName: '',
    type: '연차' as '연차' | '반차(오전)' | '반차(오후)' | '공가' | '병가' | '교육'
  });

  // 한국 시간 헬퍼 함수
  const getKoreanDate = () => {
    const now = new Date();
    const koreanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    return koreanTime.toISOString().split('T')[0];
  };

  const getKoreanDateTime = () => {
    const now = new Date();
    const koreanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    return koreanTime.toISOString();
  };

  // 음력 공휴일 데이터 (매년 업데이트 필요)
  const lunarHolidays: { [key: string]: string } = {
    // 2025년
    '2025-01-28': '설날 연휴',
    '2025-01-29': '설날',
    '2025-01-30': '설날 연휴',
    '2025-10-05': '추석 연휴',
    '2025-10-06': '추석',
    '2025-10-07': '추석 연휴',
    // 2026년
    '2026-02-16': '설날 연휴',
    '2026-02-17': '설날',
    '2026-02-18': '설날 연휴',
    '2026-09-24': '추석 연휴',
    '2026-09-25': '추석',
    '2026-09-26': '추석 연휴',
    // 2027년 (예시)
    '2027-02-06': '설날 연휴',
    '2027-02-07': '설날',
    '2027-02-08': '설날 연휴',
    '2027-09-14': '추석 연휴',
    '2027-09-15': '추석',
    '2027-09-16': '추석 연휴'
  };

  // 양력 공휴일 (매년 동일)
  const solarHolidays: { month: number; day: number; name: string }[] = [
    { month: 1, day: 1, name: '신정' },
    { month: 3, day: 1, name: '삼일절' },
    { month: 5, day: 5, name: '어린이날' },
    { month: 6, day: 6, name: '현충일' },
    { month: 8, day: 15, name: '광복절' },
    { month: 10, day: 3, name: '개천절' },
    { month: 10, day: 9, name: '한글날' },
    { month: 12, day: 25, name: '크리스마스' }
  ];

  // 대체공휴일 계산 함수
  const getSubstituteHoliday = (year: number, month: number, day: number): Date | null => {
    const holiday = new Date(year, month - 1, day);
    const dayOfWeek = holiday.getDay();
    
    // 어린이날(5/5)이 토요일(6) 또는 일요일(0)인 경우
    if (month === 5 && day === 5 && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return new Date(year, month - 1, dayOfWeek === 6 ? 7 : 6); // 토요일이면 월요일(7일), 일요일이면 월요일(6일)
    }
    
    return null;
  };

  // 공휴일 여부 확인 함수
  const isHoliday = (date: Date): boolean => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // 음력 공휴일 체크
    if (dateString in lunarHolidays) return true;
    
    // 양력 공휴일 체크
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    
    // 일반 양력 공휴일
    if (solarHolidays.some(h => h.month === month && h.day === day)) return true;
    
    // 대체공휴일 체크
    const substituteHoliday = getSubstituteHoliday(year, 5, 5);
    if (substituteHoliday && 
        substituteHoliday.getFullYear() === year && 
        substituteHoliday.getMonth() === date.getMonth() && 
        substituteHoliday.getDate() === day) {
      return true;
    }
    
    return false;
  };

  // 공휴일 이름 가져오기 함수
  const getHolidayName = (date: Date): string | null => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    // 음력 공휴일 체크
    if (dateString in lunarHolidays) {
      return lunarHolidays[dateString];
    }
    
    // 양력 공휴일 체크
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    
    // 일반 양력 공휴일
    const solarHoliday = solarHolidays.find(h => h.month === month && h.day === day);
    if (solarHoliday) return solarHoliday.name;
    
    // 대체공휴일 체크
    const substituteHoliday = getSubstituteHoliday(year, 5, 5);
    if (substituteHoliday && 
        substituteHoliday.getFullYear() === year && 
        substituteHoliday.getMonth() === date.getMonth() && 
        substituteHoliday.getDate() === day) {
      return '대체공휴일';
    }
    
    return null;
  };

  // 업무일지 상태
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [selectedDailyReport, setSelectedDailyReport] = useState<DailyReport | null>(null);
  const [dailyReportForm, setDailyReportForm] = useState<DailyReport>({
    id: '',
    date: getKoreanDate(),
    mechanical: { today: '', tomorrow: '' },
    youngjinMechanical: { today: '', tomorrow: '' },
    electrical: { today: '', tomorrow: '' },
    youngjinElectrical: { today: '', tomorrow: '' },
    control: { today: '', tomorrow: '' },
    youngjinControl: { today: '', tomorrow: '' },
    attendanceStatus: '',
    safetySlogan: '',
    createdBy: '',
    createdAt: '',
    updatedAt: ''
  });
  const [dailyReportSearchDate, setDailyReportSearchDate] = useState('');
  const [dailyReportSelectedMonth, setDailyReportSelectedMonth] = useState(getKoreanDate().slice(0, 7));

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [equipment, setEquipment] = useState<Equipment[]>([]);

  // Generate work order number based on current year
  const generateWorkOrderId = () => {
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // 25, 26, etc.
    
    // Find existing work orders for current year
    const currentYearOrders = workOrders.filter(order => 
      order.id.startsWith(`${yearSuffix}-`)
    );
    
    // 가장 큰 번호를 찾아서 +1
    let maxNumber = 0;
    currentYearOrders.forEach(order => {
      const numberPart = parseInt(order.id.split('-')[1]);
      if (numberPart > maxNumber) {
        maxNumber = numberPart;
      }
    });
    
    const nextNumber = maxNumber + 1;
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

  // Check authentication on mount
  React.useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 추적

    const checkAuth = async () => {
      try {
        console.log('🔄 인증 상태 확인 중...');
        // First check Supabase Auth session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ 세션 확인 오류:', error);
          return;
        }
        
        if (!isMounted) return; // 컴포넌트 언마운트된 경우 중단
        
        if (session) {
          console.log('✅ 유효한 세션 발견:', session.user.email);
          console.log('🔑 사용자 UUID:', session.user.id);
          console.log('📋 사용자 메타데이터:', session.user.user_metadata);
          console.log('🎫 Access Token 길이:', session.access_token?.length);
          console.log('🎫 Access Token 미리보기:', session.access_token?.substring(0, 100) + '...');
          console.log('⏰ Token 만료시간:', new Date(session.expires_at! * 1000));
          // User is authenticated with Supabase Auth
          const user = {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
            fullName: session.user.user_metadata?.full_name || '사용자',
            role: session.user.user_metadata?.role || 'user'
          };
          
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          // Body 클래스 추가
          document.body.classList.add('authenticated');
          document.body.classList.remove('unauthenticated');
          
          // 인증 성공 시 데이터 로드 - setTimeout으로 약간의 지연 추가
          console.log('📥 초기 데이터 로드 시작...');
          setTimeout(async () => {
            if (isMounted) {
              await loadAllDataFromSupabase();
            }
          }, 100);
        } else {
          console.log('❌ 세션 없음 - 로그인 필요');
          // No auth session found
          setIsAuthenticated(false);
          setCurrentUser(null);
          
          // Body 클래스 추가
          document.body.classList.add('unauthenticated');
          document.body.classList.remove('authenticated');
        }
      } catch (error) {
        console.error('❌ 인증 확인 중 오류:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
        document.body.classList.add('unauthenticated');
        document.body.classList.remove('authenticated');
      }
    };
    
    checkAuth();
    
    // Supabase Auth 상태 변화 감지 (로그인/로그아웃 감지)
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth 상태 변화:', event, session?.user?.email || 'no session');
      
      if (!isMounted) return; // 컴포넌트 언마운트된 경우 중단
      
      if (session) {
        const user = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
          fullName: session.user.user_metadata?.full_name || '사용자',
          role: session.user.user_metadata?.role || 'user'
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        document.body.classList.add('authenticated');
        document.body.classList.remove('unauthenticated');
        
        // 로그인 이벤트 또는 토큰 갱신 시 데이터 로드
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('📥 데이터 로드 중... (이벤트:', event, ')');
          setTimeout(async () => {
            if (isMounted) {
              await loadAllDataFromSupabase();
            }
          }, 100);
        }
      } else if (!session) {
        console.log('🚪 로그아웃 처리...');
        setCurrentUser(null);
        setIsAuthenticated(false);
        document.body.classList.add('unauthenticated');
        document.body.classList.remove('authenticated');
        
        // 상태 초기화
        setPersonnel([]);
        setWorkOrders([]);
        setSchedules([]);
        setAnnouncements([]);
        setEquipment([]);
        setAttendances([]);
        setDailyReports([]);
      }
    });
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
    };
    
  }, []);



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

  // Excel 시트명 안전하게 변환하는 함수
  const sanitizeSheetName = (name: string): string => {
    // Excel에서 금지된 문자들을 안전한 문자로 변환
    return name
      .replace(/[:\\\/\?\*\[\]]/g, '_')  // 금지된 문자를 '_'로 변환
      .substring(0, 31);  // Excel 시트명 최대 길이 31자로 제한
  };

  // Excel download functions
  const downloadWorkOrdersExcel = () => {
    try {
      console.log('📊 Excel 다운로드 시작...');
      console.log('작업 지시서 개수:', workOrders.length);
      
      if (workOrders.length === 0) {
        alert('다운로드할 작업 데이터가 없습니다.');
        return;
      }
      
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
        'TM NO.': order.tmNo || '해당 없음',
        '작업내용': convertToExcelBulletText(order.description),
        '작업일': order.dueDate, // 완료예정일을 작업일로 사용
        '담당자': Array.isArray(order.assignee) ? order.assignee.join(', ') : order.assignee || '-',
        '작업결과': order.workResult || '-'  // 작업결과 추가
      });
      return groups;
    }, {} as Record<string, any[]>);

    const workbook = XLSX.utils.book_new();
    
    // 각 설비별로 시트 생성
    Object.keys(equipmentGroups).forEach(equipmentName => {
      const worksheet = XLSX.utils.json_to_sheet(equipmentGroups[equipmentName]);
      
      // 열 너비 설정
      const colWidths = [
        { wch: 10 }, // 작업번호
        { wch: 30 }, // 작업명
        { wch: 15 }, // 설비명
        { wch: 15 }, // 기기명
        { wch: 12 }, // TM NO.
        { wch: 50 }, // 작업내용
        { wch: 12 }, // 작업일
        { wch: 10 }, // 담당자
        { wch: 50 }  // 작업결과
      ];
      worksheet['!cols'] = colWidths;
      
      // 작업내용 열에 wrapText 적용 및 행 높이 설정
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // 모든 행에 대한 높이 설정
      if (!worksheet['!rows']) worksheet['!rows'] = [];
      
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        // 작업내용 열 (F열, 인덱스 5)
        const contentCell = XLSX.utils.encode_cell({ r: row, c: 5 });
        // 작업결과 열 (I열, 인덱스 8)
        const resultCell = XLSX.utils.encode_cell({ r: row, c: 8 });
        
        let maxLineCount = 1;
        
        // 작업내용 열 wrapText 적용
        if (worksheet[contentCell]) {
          if (!worksheet[contentCell].s) worksheet[contentCell].s = {};
          if (!worksheet[contentCell].s.alignment) worksheet[contentCell].s.alignment = {};
          worksheet[contentCell].s.alignment.wrapText = true;
          worksheet[contentCell].s.alignment.vertical = 'top';
          
          const content = worksheet[contentCell].v || '';
          const contentLineCount = (content.toString().match(/\n/g) || []).length + 1;
          maxLineCount = Math.max(maxLineCount, contentLineCount);
        }
        
        // 작업결과 열 wrapText 적용
        if (worksheet[resultCell]) {
          if (!worksheet[resultCell].s) worksheet[resultCell].s = {};
          if (!worksheet[resultCell].s.alignment) worksheet[resultCell].s.alignment = {};
          worksheet[resultCell].s.alignment.wrapText = true;
          worksheet[resultCell].s.alignment.vertical = 'top';
          
          const result = worksheet[resultCell].v || '';
          const resultLineCount = (result.toString().match(/\n/g) || []).length + 1;
          maxLineCount = Math.max(maxLineCount, resultLineCount);
        }
        
        // 행 높이 설정 (작업내용과 작업결과 중 더 긴 것 기준)
        worksheet['!rows'][row] = {
          hpx: maxLineCount * 18,  // hpx (height in pixels)
          hidden: false
        };
      }
      
      const safeSheetName = sanitizeSheetName(equipmentName);
      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
    });
    
    console.log('✅ Excel 파일 생성 중...');
    XLSX.writeFile(workbook, '설비별_작업이력.xlsx');
    console.log('✅ Excel 다운로드 완료!');
    } catch (error) {
      console.error('❌ Excel 다운로드 오류:', error);
      alert('Excel 파일 생성 중 오류가 발생했습니다.');
    }
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
      // Documents now stored in Supabase only
      
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
      // Documents now stored in Supabase only
      alert('문서가 삭제되었습니다.');
    } catch (error) {
      console.error('문서 삭제 중 오류:', error);
      alert('문서 삭제 중 오류가 발생했습니다.');
    }
  };

  // Documents are now managed through Supabase only
  
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
          // Use only Supabase documents
          setDocuments(supabaseDocuments);
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
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">정비 업체 관리 시스템</h1>
            <div className="flex items-center gap-1 justify-center">
              <img src="/wideincheon-logo.png" alt="위드인천에너지" className="h-6 w-auto" />
              <span className="text-gray-400 text-sm">×</span>
              <img src="/youngjin-logo.png" alt="영진" className="h-6 w-auto" />
            </div>
          </div>
          
          <div className="flex justify-center flex-1">
            <div className="flex space-x-2">
              {[
                { id: 'dashboard', label: '대시보드', icon: Home },
                { id: 'tm-status', label: 'TM 현황', icon: ClipboardList },
                { id: 'announcements', label: '공지사항', icon: MessageSquare },
                { id: 'workorder', label: '작업 관리', icon: Wrench },
                { id: 'schedule', label: '작업 일정', icon: Calendar },
                { id: 'equipment', label: '설비관리', icon: Settings },
                { id: 'documents', label: '문서관리', icon: FileText },
                { id: 'personnel', label: '인력관리', icon: Users },
                { id: 'attendance', label: '근태관리', icon: Calendar },
                { id: 'dailyreport', label: '업무일지', icon: FileText }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === item.id 
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md'
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

  // Supabase에서 모든 데이터 로드
  const loadAllDataFromSupabase = async () => {
    // 로딩 중이면 중복 로드 방지 (hasInitialDataLoaded는 제거)
    if (isLoadingData) {
      console.log('⚠️ 데이터 로드 중 - 중복 로드 방지');
      return;
    }

    try {
      // 로딩 시작 및 이전 에러 초기화
      setIsLoadingData(true);
      setDataLoadError(null);
      console.log('🔄 Supabase에서 데이터 로드 중...');
      
      // 세션 확인
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ 세션이 없어 데이터를 로드할 수 없습니다.');
        setIsLoadingData(false);
        return;
      }
      
      console.log('🔑 데이터 로드용 세션 확인됨:', session.user.email);
      
      // 실패한 데이터 소스 추적
      const failedSources: string[] = [];
      
      // 모든 데이터를 병렬로 로드 (빈 데이터도 정상 처리)
      const [
        personnelData,
        workOrdersData,
        schedulesData,
        announcementsData,
        equipmentData,
        attendancesData,
        dailyReportsData,
        tmStatusData,
        assigneesData
      ] = await Promise.all([
        loadPersonnelFromSupabase().catch(err => { 
          console.error('인력 데이터 로드 실패:', err); 
          failedSources.push('인력 데이터');
          return []; 
        }),
        loadWorkOrdersFromSupabase().catch(err => { 
          console.error('작업지시서 로드 실패:', err); 
          failedSources.push('작업지시서');
          return []; 
        }),
        loadSchedulesFromSupabase().catch(err => { 
          console.error('일정 로드 실패:', err); 
          failedSources.push('일정');
          return []; 
        }),
        loadAnnouncementsFromSupabase().catch(err => { 
          console.error('공지사항 로드 실패:', err); 
          failedSources.push('공지사항');
          return []; 
        }),
        loadEquipmentFromSupabase().catch(err => { 
          console.error('설비 로드 실패:', err); 
          failedSources.push('설비');
          return []; 
        }),
        loadAttendancesFromSupabase().catch(err => { 
          console.error('근태 로드 실패:', err); 
          failedSources.push('근태');
          return []; 
        }),
        loadDailyReportsFromSupabase().catch(err => { 
          console.error('업무일지 로드 실패:', err); 
          failedSources.push('업무일지');
          return []; 
        }),
        loadTMStatusFromSupabase().catch(err => { 
          console.error('TM 현황 로드 실패:', err); 
          failedSources.push('TM 현황');
          return []; 
        }),
        loadAssigneesFromSupabase().catch(err => { 
          console.error('담당자 목록 로드 실패:', err); 
          failedSources.push('담당자 목록');
          return []; 
        })
      ]);
      
      console.log('📊 데이터 로드 결과:');
      console.log('- 인력:', personnelData.length, '건');
      console.log('- 작업지시서:', workOrdersData.length, '건');
      console.log('- 일정:', schedulesData.length, '건');
      console.log('- 공지사항:', announcementsData.length, '건');
      console.log('- 설비:', equipmentData.length, '건');
      console.log('- 근태:', attendancesData.length, '건');
      console.log('- 업무일지:', dailyReportsData.length, '건');
      console.log('- TM 현황:', tmStatusData.length, '건');
      console.log('- 담당자:', assigneesData.length, '명');

      setPersonnel(personnelData);
      setWorkOrders(workOrdersData);
      setSchedules(schedulesData);
      setAnnouncements(announcementsData);
      setEquipment(equipmentData);
      setAttendances(attendancesData);
      setDailyReports(dailyReportsData);
      setTmStatusList(tmStatusData);
      setFixedAssignees(assigneesData);
      
      // 실패한 데이터 소스가 있는 경우 에러 메시지 설정
      if (failedSources.length > 0) {
        const errorMessage = `다음 데이터 로드에 실패했습니다: ${failedSources.join(', ')}`;
        setDataLoadError(errorMessage);
        console.warn('⚠️', errorMessage);
      }
      
      console.log('✅ Supabase 데이터 로드 완료');
      
      // Realtime 구독 설정
      setupRealtimeSubscriptions();
    } catch (error: any) {
      console.error('❌ Supabase 데이터 로드 오류:', error);
      
      // 세션 만료 또는 인증 오류 처리
      if (error?.message?.includes('JWT') || error?.message?.includes('expired') || error?.message?.includes('401')) {
        console.log('🔄 세션 만료 감지, 재인증 시도...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setDataLoadError('세션이 만료되었습니다. 다시 로그인해주세요.');
          setIsAuthenticated(false);
          setCurrentUser(null);
          return;
        }
      }
      
      setDataLoadError('데이터를 로드하는 중 오류가 발생했습니다.');
    } finally {
      // 로딩 완료
      setIsLoadingData(false);
    }
  };

  // Realtime 구독 설정 함수
  const setupRealtimeSubscriptions = () => {
    console.log('🔴 Realtime 구독 설정 중...');
    
    // 공지사항 실시간 구독
    const announcementsSubscription = supabase
      .channel('announcements_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, async (payload) => {
        console.log('📢 공지사항 변경 감지:', payload);
        const newData = await loadAnnouncementsFromSupabase();
        setAnnouncements(newData);
      })
      .subscribe();

    // 작업지시서 실시간 구독
    const workOrdersSubscription = supabase
      .channel('work_orders_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'work_orders'
      }, async (payload) => {
        console.log('🔧 작업지시서 변경 감지:', payload);
        const newData = await loadWorkOrdersFromSupabase();
        setWorkOrders(newData);
      })
      .subscribe();

    // 인력관리 실시간 구독
    const personnelSubscription = supabase
      .channel('personnel_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'personnel'
      }, async (payload) => {
        console.log('👥 인력 변경 감지:', payload);
        const newData = await loadPersonnelFromSupabase();
        setPersonnel(newData);
      })
      .subscribe();

    // 일정관리 실시간 구독
    const schedulesSubscription = supabase
      .channel('schedules_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'schedules'
      }, async (payload) => {
        console.log('📅 일정 변경 감지:', payload);
        const newData = await loadSchedulesFromSupabase();
        setSchedules(newData);
      })
      .subscribe();

    // 설비관리 실시간 구독
    const equipmentSubscription = supabase
      .channel('equipment_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'equipment'
      }, async (payload) => {
        console.log('⚙️ 설비 변경 감지:', payload);
        const newData = await loadEquipmentFromSupabase();
        setEquipment(newData);
      })
      .subscribe();

    // 근태관리 실시간 구독
    const attendancesSubscription = supabase
      .channel('attendances_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'attendances'
      }, async (payload) => {
        console.log('📊 근태 변경 감지:', payload);
        const newData = await loadAttendancesFromSupabase();
        setAttendances(newData);
      })
      .subscribe();

    // 업무일지 실시간 구독
    const dailyReportsSubscription = supabase
      .channel('daily_reports_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_reports'
      }, async (payload) => {
        console.log('📝 업무일지 변경 감지:', payload);
        const newData = await loadDailyReportsFromSupabase();
        setDailyReports(newData);
      })
      .subscribe();

    // 담당자 목록 실시간 구독
    const assigneesSubscription = supabase
      .channel('assignees_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'assignees'
      }, async (payload) => {
        console.log('👤 담당자 변경 감지:', payload);
        const newData = await loadAssigneesFromSupabase();
        setFixedAssignees(newData);
      })
      .subscribe();

    console.log('🟢 모든 Realtime 구독 완료! 이제 실시간 동기화가 활성화되었습니다! 🎉');
  };

  // Dashboard
  const renderDashboard = () => (
    <div className="space-y-4">
      {/* 상단 카운터 위젯 4개 - 한 줄로 배치 */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { title: '전체 작업', value: workOrders.length, color: 'bg-blue-500' },
          { title: '진행중 작업', value: workOrders.filter(w => w.status === '진행중').length, color: 'bg-yellow-500' },
          { title: '완료된 작업', value: workOrders.filter(w => w.status === '완료').length, color: 'bg-green-500' },
          { title: '전체 인력', value: personnel.length, color: 'bg-purple-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border h-24">
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
      
      {/* 하단 4개 위젯 - 상단 카운터 위젯과 컬럼 정렬 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border h-[680px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">최근 작업</h3>
          <div className="space-y-3">
            {workOrders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => handleWorkOrderClick(order)}>
                <div className="flex-1">
                  <p className="font-medium text-sm">{order.title}</p>
                  <p className="text-xs text-gray-500">담당자 : {Array.isArray(order.assignee) ? order.assignee.join(', ') : order.assignee}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border h-[680px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">근태 현황</h3>
          <div className="space-y-3">
            {personnel.map(person => {
              const today = new Date(new Date().getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0]; // 한국 시간(UTC+9)
              const todayAttendance = attendances.find(
                att => att.date === today && att.personnelId === person.id
              );
              const attendanceStatus = todayAttendance?.type || '출근';
              
              // 디버깅용 로그 (임시)
              if (person.id === 1) { // 한희명만 로그 출력하여 중복 방지
                console.log(`Debug - Person: ${person.name}, ID: ${person.id}, Today: ${today}`);
                console.log('All attendances array:', attendances);
                console.log('Found Attendance:', todayAttendance);
                console.log(`Status: ${attendanceStatus}`);
              }
              
              return (
                <div key={`${person.id}-${attendances.length}`} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{person.name}</p>
                    <p className="text-xs text-gray-500">{person.position} - {person.field}</p>
                    <p className="text-xs text-gray-500">{person.phone}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    attendanceStatus === '연차' ? 'bg-red-100 text-red-800' :
                    attendanceStatus === '반차(오전)' ? 'bg-yellow-100 text-yellow-800' :
                    attendanceStatus === '반차(오후)' ? 'bg-orange-100 text-orange-800' :
                    attendanceStatus === '공가' ? 'bg-blue-100 text-blue-800' :
                    attendanceStatus === '병가' ? 'bg-purple-100 text-purple-800' :
                    attendanceStatus === '교육' ? 'bg-green-100 text-green-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {attendanceStatus}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border h-[680px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">최근 공지사항</h3>
          <div className="space-y-3">
            {announcements.slice(0, 6).map(announcement => (
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
        
        {/* 날씨 위젯 - 자연스러운 높이 유지 */}
        <div>
          <WeatherWidget />
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
      calendarDays.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatCalendarDate(year, month, day);
      const daySchedules = getSchedulesForDate(dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const currentDate = new Date(year, month, day);
      const isHolidayDate = isHoliday(currentDate);
      const holidayName = getHolidayName(currentDate);
      const isSunday = currentDate.getDay() === 0;
      const isSaturday = currentDate.getDay() === 6;
      
      calendarDays.push(
        <div key={day} className={`h-24 border border-gray-200 p-1 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-sm font-medium mb-1 ${
            isToday ? 'text-blue-600' : 
            isHolidayDate || isSunday ? 'text-red-600' : 
            isSaturday ? 'text-blue-600' : 
            'text-gray-900'
          }`}>
            {day}
            {holidayName && (
              <span className="block text-[11px] font-normal">{holidayName}</span>
            )}
          </div>
          <div className={`${daySchedules.length > 2 ? 'overflow-y-auto max-h-12' : ''} space-y-1`}>
            {daySchedules.map((schedule, index) => (
              <div
                key={schedule.id}
                className={`text-xs px-1 py-0.5 rounded truncate ${getTypeColor(Array.isArray(schedule.type) ? schedule.type[0] : schedule.type)}`}
                title={`${schedule.title} - ${schedule.assignee} (${schedule.type})`}
              >
                {schedule.title}
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-center p-4 border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold min-w-[150px] text-center">
              {year}년 {monthNames[month]}
            </h3>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
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
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-lg font-semibold">작업 일정</h2>
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
          <h3 className="font-medium text-lg mb-3">
            {currentCalendarMonth.getFullYear()}년 {currentCalendarMonth.getMonth() + 1}월 작업 목록
          </h3>
          <div className="space-y-4">
            {workOrders.filter(order => {
              // 현재 선택된 월의 작업만 필터링
              const orderDate = new Date(order.dueDate);
              return orderDate.getFullYear() === currentCalendarMonth.getFullYear() && 
                     orderDate.getMonth() === currentCalendarMonth.getMonth();
            }).map(order => (
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
                    <p className="text-sm text-gray-500">{order.equipment} ({order.equipmentName}) - {Array.isArray(order.assignee) ? order.assignee.join(', ') : order.assignee}</p>
                    <p className="text-sm text-gray-500">작업일: {order.dueDate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    {Array.isArray(order.type) ? order.type.map((t, idx) => (
                      <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(t)}`}>
                        {t}
                      </span>
                    )) : (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(order.type)}`}>
                        {order.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {workOrders.filter(order => {
              const orderDate = new Date(order.dueDate);
              return orderDate.getFullYear() === currentCalendarMonth.getFullYear() && 
                     orderDate.getMonth() === currentCalendarMonth.getMonth();
            }).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {currentCalendarMonth.getFullYear()}년 {currentCalendarMonth.getMonth() + 1}월에는 예정된 작업이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Work Order Management
  const [showWorkOrderForm, setShowWorkOrderForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [fixedAssignees, setFixedAssignees] = useState<string[]>([]);
  const [showAssigneeModal, setShowAssigneeModal] = useState(false);
  const [newAssigneeName, setNewAssigneeName] = useState('');
  const [workOrderForm, setWorkOrderForm] = useState({
    title: '',
    equipment: '',
    equipmentName: '',
    description: '',
    dueDate: '',
    workResult: '',
    assignee: [] as string[],
    type: [] as string[],
    tmNo: ''
  });
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState('');
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  // 클릭 외부 감지하여 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.equipment-search-container')) {
        setShowEquipmentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleWorkOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWorkOrder) {
        // 수정
        const updatedOrder = { 
          ...editingWorkOrder, 
          ...workOrderForm,
          requestDate: editingWorkOrder.requestDate // 기존 요청일 유지
        };
        
        // Supabase 업데이트
        const { error } = await supabase
          .from('work_orders')
          .update({
            title: updatedOrder.title,
            equipment: updatedOrder.equipment,
            equipment_name: updatedOrder.equipmentName,
            description: updatedOrder.description,
            request_date: updatedOrder.requestDate,
            due_date: updatedOrder.dueDate,
            work_result: updatedOrder.workResult,
            status: updatedOrder.status,
            assignee: updatedOrder.assignee,
            completion_note: updatedOrder.completionNote,
            attachments: updatedOrder.attachments,
            type: updatedOrder.type,
            tm_no: updatedOrder.tmNo
          })
          .eq('id', editingWorkOrder.id);
          
        if (error) {
          console.error('작업 지시서 수정 오류:', error);
          alert('작업 지시서 수정 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        setWorkOrders(prev => prev.map(order => 
          order.id === editingWorkOrder.id ? updatedOrder : order
        ));
        setEditingWorkOrder(null);
      } else {
        // 추가
        const newOrderData = {
          id: generateWorkOrderId(),
          title: workOrderForm.title,
          equipment: workOrderForm.equipment,
          equipment_name: workOrderForm.equipmentName,
          description: workOrderForm.description,
          request_date: new Date().toISOString().split('T')[0],
          due_date: workOrderForm.dueDate,
          work_result: workOrderForm.workResult,
          status: '대기',
          assignee: workOrderForm.assignee,
          completion_note: '',
          attachments: [],
          type: workOrderForm.type,
          tm_no: workOrderForm.tmNo
        };
        
        // Supabase 추가
        const { data, error } = await supabase
          .from('work_orders')
          .insert(newOrderData)
          .select()
          .single();
          
        if (error) {
          console.error('작업 지시서 추가 오류:', error);
          alert('작업 지시서 추가 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        const newOrder: WorkOrder = {
          id: data.id,
          title: data.title,
          equipment: data.equipment,
          equipmentName: data.equipment_name,
          description: data.description,
          requestDate: data.request_date,
          dueDate: data.due_date,
          workResult: data.work_result,
          status: data.status,
          assignee: data.assignee,
          completionNote: data.completion_note,
          attachments: data.attachments || [],
          type: data.type,
          tmNo: data.tm_no
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
        assignee: [],
        type: [],
        tmNo: ''
      });
      setEquipmentSearchTerm(''); // 검색어 초기화
    } catch (error) {
      console.error('작업 지시서 관리 오류:', error);
      alert('작업 지시서 관리 중 오류가 발생했습니다.');
    }
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
      type: order.type,
      tmNo: order.tmNo || ''
    });
    setEquipmentSearchTerm(order.equipment); // 설비명을 검색창에 표시
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
    // Authentication state managed by Supabase
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
      // Local storage cleanup no longer needed
      handlePageChange('dashboard');
      
      // Body 클래스 추가
      document.body.classList.add('unauthenticated');
      document.body.classList.remove('authenticated');
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      alert('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteWorkOrder = async (id: string) => {
    try {
      // Supabase에서 삭제
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('작업 지시서 삭제 오류:', error);
        alert('작업 지시서 삭제 중 오류가 발생했습니다.');
        return;
      }
      
      // 로컬 상태에서 삭제
      const updatedOrders = workOrders.filter(order => order.id !== id);
      
      // 번호 재정렬 - 같은 연도의 작업들만 재정렬
      const deletedYear = id.split('-')[0];
      const deletedNumber = parseInt(id.split('-')[1]);
      
      // 재정렬이 필요한 작업들을 찾아서 Supabase에서 ID 업데이트
      const reorderPromises = updatedOrders
        .filter(order => {
          if (order.id.startsWith(deletedYear + '-')) {
            const orderNumber = parseInt(order.id.split('-')[1]);
            return orderNumber > deletedNumber;
          }
          return false;
        })
        .map(async order => {
          const oldNumber = parseInt(order.id.split('-')[1]);
          const newId = `${deletedYear}-${oldNumber - 1}`;
          
          // Supabase에서 ID 업데이트
          const { error: updateError } = await supabase
            .from('work_orders')
            .update({ id: newId })
            .eq('id', order.id);
            
          if (updateError) {
            console.error(`작업 지시서 ID 업데이트 오류 (${order.id} → ${newId}):`, updateError);
            throw updateError;
          }
          
          return { ...order, id: newId };
        });
      
      try {
        // 모든 업데이트가 완료될 때까지 대기
        await Promise.all(reorderPromises);
        
        // 로컬 상태 업데이트 - 재정렬된 ID 반영
        const reorderedOrders = updatedOrders.map(order => {
          if (order.id.startsWith(deletedYear + '-')) {
            const orderNumber = parseInt(order.id.split('-')[1]);
            if (orderNumber > deletedNumber) {
              return { ...order, id: `${deletedYear}-${orderNumber - 1}` };
            }
          }
          return order;
        });
        
        setWorkOrders(reorderedOrders);
      } catch (updateError) {
        console.error('작업 지시서 재정렬 중 오류:', updateError);
        alert('작업 지시서 번호 재정렬 중 오류가 발생했습니다. 새로고침을 해주세요.');
      }
    } catch (error) {
      console.error('작업 지시서 삭제 오류:', error);
      alert('작업 지시서 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAddAssignee = async () => {
    if (newAssigneeName.trim() && !fixedAssignees.includes(newAssigneeName.trim())) {
      try {
        // Supabase에 추가
        const { data, error } = await supabase
          .from('assignees')
          .insert({ 
            name: newAssigneeName.trim(),
            is_active: true 
          })
          .select()
          .single();
          
        if (error) {
          console.error('담당자 추가 오류:', error);
          alert('담당자 추가 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        const updatedAssignees = [...fixedAssignees, newAssigneeName.trim()];
        setFixedAssignees(updatedAssignees);
        setNewAssigneeName('');
      } catch (error) {
        console.error('담당자 추가 오류:', error);
        alert('담당자 추가 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteAssignee = async (name: string) => {
    try {
      // Supabase에서 완전히 삭제
      const { error } = await supabase
        .from('assignees')
        .delete()
        .eq('name', name);
        
      if (error) {
        console.error('담당자 삭제 오류:', error);
        alert('담당자 삭제 중 오류가 발생했습니다.');
        return;
      }
      
      // 로컬 상태 업데이트
      const updatedAssignees = fixedAssignees.filter(a => a !== name);
      setFixedAssignees(updatedAssignees);
      
      // 현재 선택된 담당자에서도 제거
      setWorkOrderForm(prev => ({
        ...prev,
        assignee: prev.assignee.filter(a => a !== name)
      }));
    } catch (error) {
      console.error('담당자 삭제 오류:', error);
      alert('담당자 삭제 중 오류가 발생했습니다.');
    }
  };

  // Attendance Management Functions
  const handleAttendanceDelete = async (attendanceId: string) => {
    try {
      // Supabase에서 삭제
      const { error } = await supabase
        .from('attendances')
        .delete()
        .eq('id', attendanceId);
        
      if (error) {
        console.error('근태 삭제 오류:', error);
        alert('근태 삭제 중 오류가 발생했습니다.');
        return;
      }
      
      // 로컬 상태 업데이트
      const updatedAttendances = attendances.filter(att => att.id !== attendanceId);
      setAttendances(updatedAttendances);
    } catch (error) {
      console.error('근태 삭제 오류:', error);
      alert('근태 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 담당자 선택 필수 검증
    if (attendanceForm.personnelId === 0) {
      alert('담당자를 선택해주세요.');
      return;
    }

    try {
      // 기존 근태 기록 삭제 (같은 날짜, 같은 사람)
      await supabase
        .from('attendances')
        .delete()
        .eq('date', selectedAttendanceDate)
        .eq('personnel_id', attendanceForm.personnelId);

      // 새 근태 기록 추가
      const newAttendance = {
        personnel_id: attendanceForm.personnelId,
        personnel_name: attendanceForm.personnelName,
        date: selectedAttendanceDate,
        type: attendanceForm.type
      };

      const { data, error } = await supabase
        .from('attendances')
        .insert(newAttendance)
        .select()
        .single();

      if (error) {
        console.error('근태 등록 오류:', error);
        alert('근태 등록 중 오류가 발생했습니다.');
        return;
      }

      // 로컬 상태 업데이트
      const newAttendanceWithId: Attendance = {
        id: data.id,
        personnelId: data.personnel_id,
        personnelName: data.personnel_name,
        date: data.date,
        type: data.type
      };

      // 기존 데이터에서 같은 날짜, 같은 사람 제거 후 새 데이터 추가
      const filteredAttendances = attendances.filter(
        att => !(att.date === selectedAttendanceDate && att.personnelId === attendanceForm.personnelId)
      );
      
      const updatedAttendances = [...filteredAttendances, newAttendanceWithId];
      setAttendances(updatedAttendances);
      
      setShowAttendanceModal(false);
      setAttendanceForm({
        personnelId: 0,
        personnelName: '',
        type: '연차'
      });
    } catch (error) {
      console.error('근태 등록 오류:', error);
      alert('근태 등록 중 오류가 발생했습니다.');
    }
  };

  const getAttendanceForDate = (date: string) => {
    return attendances.filter(att => att.date === date);
  };

  const getTodayAttendanceStatus = (personnelId: number) => {
    const today = getKoreanDate(); // 한국 시간(UTC+9)
    const todayAttendance = attendances.find(
      att => att.date === today && att.personnelId === personnelId
    );
    return todayAttendance?.type || '출근';
  };

  // 업무일지 관리 함수들
  const handleDailyReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 중복 체크: 같은 날짜에 이미 등록된 업무일지가 있는지 확인
      if (!selectedDailyReport) {
        const existingReport = dailyReports.find(report => report.date === dailyReportForm.date);
        if (existingReport) {
          alert('해당 날짜에 이미 업무일지가 등록되어 있습니다.\n수정하시려면 해당 업무일지를 선택하여 수정해주세요.');
          return;
        }
      }
      
      const now = getKoreanDateTime();
      
      if (selectedDailyReport) {
        // 수정
        const updatedReport = {
          ...dailyReportForm,
          updatedAt: now
        };
        
        // Supabase 업데이트
        const { error } = await supabase
          .from('daily_reports')
          .update({
            date: updatedReport.date,
            mechanical_today: updatedReport.mechanical.today,
            mechanical_tomorrow: updatedReport.mechanical.tomorrow,
            youngjin_mechanical_today: updatedReport.youngjinMechanical.today,
            youngjin_mechanical_tomorrow: updatedReport.youngjinMechanical.tomorrow,
            electrical_today: updatedReport.electrical.today,
            electrical_tomorrow: updatedReport.electrical.tomorrow,
            youngjin_electrical_today: updatedReport.youngjinElectrical.today,
            youngjin_electrical_tomorrow: updatedReport.youngjinElectrical.tomorrow,
            control_today: updatedReport.control.today,
            control_tomorrow: updatedReport.control.tomorrow,
            youngjin_control_today: updatedReport.youngjinControl.today,
            youngjin_control_tomorrow: updatedReport.youngjinControl.tomorrow,
            attendance_status: updatedReport.attendanceStatus,
            safety_slogan: updatedReport.safetySlogan,
            updated_at: now
          })
          .eq('id', selectedDailyReport.id);
          
        if (error) {
          console.error('업무일지 수정 오류:', error);
          alert('업무일지 수정 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        setDailyReports(prev => prev.map(report =>
          report.id === selectedDailyReport.id ? updatedReport : report
        ));
      } else {
        // 새로 추가
        const newReportData = {
          date: dailyReportForm.date,
          mechanical_today: dailyReportForm.mechanical.today,
          mechanical_tomorrow: dailyReportForm.mechanical.tomorrow,
          youngjin_mechanical_today: dailyReportForm.youngjinMechanical.today,
          youngjin_mechanical_tomorrow: dailyReportForm.youngjinMechanical.tomorrow,
          electrical_today: dailyReportForm.electrical.today,
          electrical_tomorrow: dailyReportForm.electrical.tomorrow,
          youngjin_electrical_today: dailyReportForm.youngjinElectrical.today,
          youngjin_electrical_tomorrow: dailyReportForm.youngjinElectrical.tomorrow,
          control_today: dailyReportForm.control.today,
          control_tomorrow: dailyReportForm.control.tomorrow,
          youngjin_control_today: dailyReportForm.youngjinControl.today,
          youngjin_control_tomorrow: dailyReportForm.youngjinControl.tomorrow,
          attendance_status: dailyReportForm.attendanceStatus,
          safety_slogan: dailyReportForm.safetySlogan,
          created_by: currentUser?.fullName || '사용자',
          created_at: now,
          updated_at: now
        };
        
        // Supabase 추가
        const { data, error } = await supabase
          .from('daily_reports')
          .insert(newReportData)
          .select()
          .single();
          
        if (error) {
          console.error('업무일지 추가 오류:', error);
          alert('업무일지 추가 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        const newReport: DailyReport = {
          id: data.id,
          date: data.date,
          mechanical: {
            today: data.mechanical_today || '',
            tomorrow: data.mechanical_tomorrow || ''
          },
          youngjinMechanical: {
            today: data.youngjin_mechanical_today || '',
            tomorrow: data.youngjin_mechanical_tomorrow || ''
          },
          electrical: {
            today: data.electrical_today || '',
            tomorrow: data.electrical_tomorrow || ''
          },
          youngjinElectrical: {
            today: data.youngjin_electrical_today || '',
            tomorrow: data.youngjin_electrical_tomorrow || ''
          },
          control: {
            today: data.control_today || '',
            tomorrow: data.control_tomorrow || ''
          },
          youngjinControl: {
            today: data.youngjin_control_today || '',
            tomorrow: data.youngjin_control_tomorrow || ''
          },
          attendanceStatus: data.attendance_status || '',
          safetySlogan: data.safety_slogan || '',
          createdBy: data.created_by || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
        setDailyReports(prev => [...prev, newReport]);
      }
      
      // 폼 초기화
      setShowDailyReportModal(false);
      setSelectedDailyReport(null);
      setDailyReportForm({
        id: '',
        date: getKoreanDate(),
        mechanical: { today: '', tomorrow: '' },
        youngjinMechanical: { today: '', tomorrow: '' },
        electrical: { today: '', tomorrow: '' },
        youngjinElectrical: { today: '', tomorrow: '' },
        control: { today: '', tomorrow: '' },
        youngjinControl: { today: '', tomorrow: '' },
        attendanceStatus: '',
        safetySlogan: '',
        createdBy: '',
        createdAt: '',
        updatedAt: ''
      });
    } catch (error) {
      console.error('업무일지 관리 오류:', error);
      alert('업무일지 관리 중 오류가 발생했습니다.');
    }
  };

  const handleDailyReportEdit = (report: DailyReport) => {
    setSelectedDailyReport(report);
    setDailyReportForm(report);
    setShowDailyReportModal(true);
  };

  const handleDailyReportDelete = async (reportId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        // Supabase에서 삭제
        const { error } = await supabase
          .from('daily_reports')
          .delete()
          .eq('id', reportId);
          
        if (error) {
          console.error('업무일지 삭제 오류:', error);
          alert('업무일지 삭제 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        const updatedReports = dailyReports.filter(report => report.id !== reportId);
        setDailyReports(updatedReports);
      } catch (error) {
        console.error('업무일지 삭제 오류:', error);
        alert('업무일지 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const exportDailyReportsToExcel = async (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthReports = dailyReports.filter(report => 
      report.date.startsWith(month)
    ).sort((a, b) => a.date.localeCompare(b.date));

    if (monthReports.length === 0) {
      alert('해당 월에 작성된 업무일지가 없습니다.');
      return;
    }

    // ExcelJS 워크북 생성
    const workbook = new ExcelJS.Workbook();
    
    // 각 일자별로 시트 생성
    monthReports.forEach(report => {
      const date = new Date(report.date);
      const dayNum = date.getDate();
      const sheetName = `${date.getMonth() + 1}.${dayNum}`;
      
      // 날짜 포맷팅
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      
      // 워크시트 생성
      const worksheet = workbook.addWorksheet(sheetName);
      
      // 열 너비 설정
      worksheet.getColumn(1).width = 15;  // 구분
      worksheet.getColumn(2).width = 40;  // 금일 첫번째
      worksheet.getColumn(3).width = 10;  // 금일 두번째 (병합용)
      worksheet.getColumn(4).width = 40;  // 명일 첫번째
      worksheet.getColumn(5).width = 10;  // 명일 두번째 (병합용)
      
      // 데이터 입력
      // 제목
      worksheet.mergeCells('A1:E1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = '일 일 업 무 현 황';
      titleCell.font = { bold: true, size: 16 };
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      
      // 2행 전체 병합 및 날짜 표시
      worksheet.mergeCells('A2:E2');  // A2부터 E2까지 전체 병합
      const dateCell = worksheet.getCell('A2');
      dateCell.value = dateStr;
      dateCell.font = { bold: true, color: { argb: 'FF0000FF' } };  // 파란색
      dateCell.alignment = { vertical: 'middle', horizontal: 'right' };  // 오른쪽 정렬
      
      // 구분 헤더
      worksheet.getCell('A3').value = '구분';
      worksheet.mergeCells('B3:C3');
      worksheet.getCell('B3').value = '금일';
      worksheet.mergeCells('D3:E3');
      worksheet.getCell('D3').value = '명일';
      
      // 헤더 스타일 설정
      ['A3', 'B3', 'D3'].forEach(cell => {
        const c = worksheet.getCell(cell);
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
        c.font = { bold: true };
        c.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      
      // 섹션 데이터 (4행 삭제로 인해 모든 행 번호가 1씩 감소)
      const sections = [
        { title: '기 계', startRow: 4, endRow: 11, today: report.mechanical.today, tomorrow: report.mechanical.tomorrow },
        { title: '영진(기계)', startRow: 12, endRow: 17, today: report.youngjinMechanical.today, tomorrow: report.youngjinMechanical.tomorrow },
        { title: '제 어', startRow: 18, endRow: 25, today: report.control.today, tomorrow: report.control.tomorrow },
        { title: '영진(제어)', startRow: 26, endRow: 31, today: report.youngjinControl.today, tomorrow: report.youngjinControl.tomorrow },
        { title: '전기', startRow: 32, endRow: 39, today: report.electrical.today, tomorrow: report.electrical.tomorrow },
        { title: '영진(전기)', startRow: 40, endRow: 46, today: report.youngjinElectrical.today, tomorrow: report.youngjinElectrical.tomorrow }
      ];
      
      // 각 섹션 설정
      sections.forEach(section => {
        // 구분 컬럼 병합 및 설정
        worksheet.mergeCells(`A${section.startRow}:A${section.endRow}`);
        const titleCell = worksheet.getCell(`A${section.startRow}`);
        titleCell.value = section.title;
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
        titleCell.font = { bold: true };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        
        // 금일 병합 및 내용 설정
        worksheet.mergeCells(`B${section.startRow}:C${section.endRow}`);
        const todayCell = worksheet.getCell(`B${section.startRow}`);
        todayCell.value = section.today || '';
        todayCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        todayCell.font = { size: 10 };
        
        // 명일 병합 및 내용 설정
        worksheet.mergeCells(`D${section.startRow}:E${section.endRow}`);
        const tomorrowCell = worksheet.getCell(`D${section.startRow}`);
        tomorrowCell.value = section.tomorrow || '';
        tomorrowCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        tomorrowCell.font = { size: 10 };
      });
      
      // 근태현황 (안전구호와 같은 형식)
      worksheet.getCell('A47').value = '근태현황';
      worksheet.getCell('A47').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
      worksheet.getCell('A47').font = { bold: true };
      worksheet.getCell('A47').alignment = { vertical: 'middle', horizontal: 'center' };
      
      worksheet.mergeCells('B47:E47');
      const attendanceCell = worksheet.getCell('B47');
      attendanceCell.value = report.attendanceStatus || '';
      attendanceCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
      
      // 안전구호
      worksheet.getCell('A48').value = '안전구호';
      worksheet.getCell('A48').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } };
      worksheet.getCell('A48').font = { bold: true };
      worksheet.getCell('A48').alignment = { vertical: 'middle', horizontal: 'center' };
      
      worksheet.mergeCells('B48:E48');
      const safetyCell = worksheet.getCell('B48');
      safetyCell.value = report.safetySlogan || '';
      safetyCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
      
      // 모든 셀에 테두리 적용
      for (let row = 1; row <= 48; row++) {
        for (let col = 1; col <= 5; col++) {
          const cell = worksheet.getCell(row, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      }
      
      // 행 높이 설정
      worksheet.getRow(1).height = 25;  // 제목
      worksheet.getRow(3).height = 18;  // 구분 헤더
      worksheet.getRow(47).height = 20; // 근태현황
      worksheet.getRow(48).height = 20; // 안전구호
      
      // 나머지 행 높이
      for (let i = 4; i <= 46; i++) {
        worksheet.getRow(i).height = 18;
      }
    });

    // 파일 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `업무일지_${year}년${monthNum}월.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrevMonth = () => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleUpdateWorkOrderStatus = async (id: string, status: string) => {
    try {
      // 완료 상태로 변경하려는 경우 작업 결과가 있는지 확인
      if (status === '완료') {
        const order = workOrders.find(o => o.id === id);
        if (order && !order.workResult) {
          alert('작업 결과를 기입해주세요');
          return;
        }
      }
      
      // Supabase 업데이트
      const { error } = await supabase
        .from('work_orders')
        .update({ status })
        .eq('id', id);
      
      if (error) {
        console.error('상태 업데이트 오류:', error);
        alert('상태 업데이트 중 오류가 발생했습니다.');
        return;
      }
      
      // 로컬 상태 업데이트
      setWorkOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('상태 업데이트 오류:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  const renderWorkOrder = () => (
    <div className="space-y-4">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="작업 제목"
                  value={workOrderForm.title}
                  onChange={(e) => setWorkOrderForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                <div className="relative equipment-search-container">
                  <input
                    type="text"
                    placeholder="설비명을 입력하세요"
                    value={equipmentSearchTerm}
                    onChange={(e) => {
                      setEquipmentSearchTerm(e.target.value);
                      setShowEquipmentDropdown(true);
                      // 검색어가 정확히 일치하는 설비가 있으면 자동 선택
                      const exactMatch = equipment.find(eq => eq.name === e.target.value);
                      if (exactMatch) {
                        setWorkOrderForm(prev => ({ ...prev, equipment: exactMatch.name }));
                      } else {
                        setWorkOrderForm(prev => ({ ...prev, equipment: '' }));
                      }
                    }}
                    onFocus={() => setShowEquipmentDropdown(true)}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  {showEquipmentDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {equipment
                        .filter(eq => 
                          eq.name.toLowerCase().includes(equipmentSearchTerm.toLowerCase())
                        )
                        .map(eq => (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => {
                              setWorkOrderForm(prev => ({ ...prev, equipment: eq.name }));
                              setEquipmentSearchTerm(eq.name);
                              setShowEquipmentDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            <div className="font-medium">{eq.name}</div>
                            <div className="text-sm text-gray-500">
                              {eq.model} - {eq.location}
                            </div>
                          </button>
                        ))}
                      {equipment.filter(eq => 
                        eq.name.toLowerCase().includes(equipmentSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          검색 결과가 없습니다
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="기기명"
                  value={workOrderForm.equipmentName}
                  onChange={(e) => setWorkOrderForm(prev => ({ ...prev, equipmentName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">작업 날짜</label>
                    <input
                      type="date"
                      value={workOrderForm.dueDate}
                      onChange={(e) => setWorkOrderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-2 py-1 border rounded-lg text-sm h-9"
                      required
                      placeholder="작업일"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TM NO.</label>
                    <select
                      value={workOrderForm.tmNo}
                      onChange={(e) => setWorkOrderForm(prev => ({ ...prev, tmNo: e.target.value }))}
                      className="w-full px-2 py-1 border rounded-lg text-sm h-9"
                    >
                      <option value="">해당 없음</option>
                      {tmStatusList.map(tm => (
                        <option key={tm.id} value={tm.tmNo}>{tm.tmNo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">담당자 선택 (중복 가능)</label>
                    <button
                      type="button"
                      onClick={() => setShowAssigneeModal(true)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Plus className="h-3 w-3" />
                      관리
                    </button>
                  </div>
                  <div className="space-y-2 border rounded-lg p-3 max-h-40 overflow-y-auto">
                    {[...personnel.map(p => p.name), ...fixedAssignees]
                      .filter((name, index, self) => self.indexOf(name) === index)
                      .map((name, index) => (
                      <label key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={name}
                          checked={workOrderForm.assignee.includes(name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWorkOrderForm(prev => ({ ...prev, assignee: [...prev.assignee, name] }));
                            } else {
                              setWorkOrderForm(prev => ({ ...prev, assignee: prev.assignee.filter(a => a !== name) }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">분야 선택 (중복 가능)</label>
                  <div className="space-y-2 border rounded-lg p-3">
                    {['기계', '전기', '제어'].map((field) => (
                      <label key={field} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={field}
                          checked={workOrderForm.type.includes(field)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWorkOrderForm(prev => ({ ...prev, type: [...prev.type, field] }));
                            } else {
                              setWorkOrderForm(prev => ({ ...prev, type: prev.type.filter(t => t !== field) }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
                      assignee: [],
                      type: [],
                      tmNo: ''
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

        {/* 담당자 관리 모달 */}
        {showAssigneeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">담당자 관리</h3>
                <button
                  onClick={() => {
                    setShowAssigneeModal(false);
                    setNewAssigneeName('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAssigneeName}
                    onChange={(e) => setNewAssigneeName(e.target.value)}
                    placeholder="새 담당자 이름"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAssignee())}
                  />
                  <button
                    onClick={handleAddAssignee}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    추가
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 max-h-60 overflow-y-auto">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">영진 담당자</h4>
                  <div className="space-y-1">
                    {personnel.map((person) => (
                      <div key={person.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <span className="text-sm">{person.name}</span>
                        <button
                          onClick={() => {
                            if (window.confirm(`정말로 ${person.name}님을 삭제하시겠습니까?`)) {
                              setPersonnel(prev => prev.filter(p => p.id !== person.id));
                              // Personnel now managed through Supabase only
                              // 현재 선택된 담당자에서도 제거
                              setWorkOrderForm(prev => ({
                                ...prev,
                                assignee: prev.assignee.filter(a => a !== person.name)
                              }));
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">위드 담당자</h4>
                  <div className="space-y-1">
                    {fixedAssignees.map((name) => (
                      <div key={name} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <span className="text-sm">{name}</span>
                        <button
                          onClick={() => handleDeleteAssignee(name)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowAssigneeModal(false);
                    setNewAssigneeName('');
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200" style={{ minWidth: '1400px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '80px' }}>번호</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '200px', minWidth: '200px' }}>작업명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '80px', minWidth: '80px' }}>분류</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '150px', minWidth: '150px' }}>설비명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '120px', minWidth: '120px' }}>기기명</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '100px', minWidth: '100px' }}>TM NO.</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '250px', minWidth: '250px' }}>작업내용</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '100px' }}>등록일</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '100px' }}>작업일</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '250px', minWidth: '250px' }}>작업결과</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '80px' }}>상태</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '120px', minWidth: '120px' }}>담당자</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900" style={{ width: '80px' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {workOrders
                .sort((a, b) => {
                  // ID를 연도와 번호로 분리
                  const [yearA, numA] = a.id.split('-').map(Number);
                  const [yearB, numB] = b.id.split('-').map(Number);
                  
                  // 먼저 연도로 내림차순 정렬
                  if (yearA !== yearB) {
                    return yearB - yearA;
                  }
                  
                  // 같은 연도면 번호로 내림차순 정렬
                  return numB - numA;
                })
                .map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b text-sm font-mono whitespace-nowrap" style={{ width: '80px' }}>{order.id}</td>
                  <td className="px-4 py-2 border-b text-sm font-medium" style={{ width: '200px', minWidth: '200px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.title}</td>
                  <td className="px-4 py-2 border-b text-sm" style={{ width: '80px', minWidth: '80px' }}>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(order.type) ? order.type.map((t, idx) => (
                        <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(t)}`}>
                          {t}
                        </span>
                      )) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(order.type)}`}>
                          {order.type}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 border-b text-sm" style={{ width: '150px', minWidth: '150px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.equipment}</td>
                  <td className="px-4 py-2 border-b text-sm" style={{ width: '120px', minWidth: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.equipmentName}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap" style={{ width: '100px', minWidth: '100px' }}>{order.tmNo || '해당 없음'}</td>
                  <td className="px-4 py-2 border-b text-sm" style={{ width: '250px', minWidth: '250px', maxWidth: '250px', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{order.description}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap" style={{ width: '100px' }}>{order.requestDate}</td>
                  <td className="px-4 py-2 border-b text-sm whitespace-nowrap" style={{ width: '100px' }}>{order.dueDate}</td>
                  <td className="px-4 py-2 border-b text-sm" style={{ width: '250px', minWidth: '250px', maxWidth: '250px', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{order.workResult || '-'}</td>
                  <td className="px-4 py-2 border-b text-sm" style={{ width: '80px' }}>
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
                  <td className="px-4 py-2 border-b text-sm" style={{ width: '120px', minWidth: '120px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{Array.isArray(order.assignee) ? order.assignee.join(', ') : order.assignee}</td>
                  <td className="px-4 py-2 border-b text-sm" style={{ width: '80px' }}>
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

  const handlePersonnelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPersonnel) {
        // 수정
        const updatedPerson = { 
          ...editingPersonnel, 
          ...personnelForm, 
          accessHistory: editingPersonnel.accessHistory 
        };
        
        // Supabase 업데이트
        const { error } = await supabase
          .from('personnel')
          .update({
            name: updatedPerson.name,
            position: updatedPerson.position,
            field: updatedPerson.field,
            phone: updatedPerson.phone,
            hire_date: updatedPerson.hireDate,
            certifications: updatedPerson.certifications,
            access_history: updatedPerson.accessHistory
          })
          .eq('id', editingPersonnel.id);
          
        if (error) {
          console.error('인력 수정 오류:', error);
          alert('인력 정보 수정 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        setPersonnel(prev => prev.map(person => 
          person.id === editingPersonnel.id ? updatedPerson : person
        ));
        setEditingPersonnel(null);
      } else {
        // 추가
        const newPerson = {
          name: personnelForm.name,
          position: personnelForm.position,
          field: personnelForm.field,
          phone: personnelForm.phone,
          hire_date: personnelForm.hireDate,
          certifications: personnelForm.certifications,
          access_history: []
        };
        
        // Supabase 추가
        const { data, error } = await supabase
          .from('personnel')
          .insert(newPerson)
          .select()
          .single();
          
        if (error) {
          console.error('인력 추가 오류:', error);
          alert('인력 추가 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        const newPersonWithId: Personnel = {
          id: data.id,
          name: data.name,
          position: data.position,
          field: data.field,
          phone: data.phone,
          hireDate: data.hire_date,
          certifications: data.certifications || [],
          accessHistory: data.access_history || []
        };
        setPersonnel(prev => [...prev, newPersonWithId]);
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
    } catch (error) {
      console.error('인력 관리 오류:', error);
      alert('인력 관리 중 오류가 발생했습니다.');
    }
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

  const handleDeletePersonnel = async (id: number) => {
    try {
      // Supabase에서 삭제
      const { error } = await supabase
        .from('personnel')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('인력 삭제 오류:', error);
        alert('인력 삭제 중 오류가 발생했습니다.');
        return;
      }
      
      // 로컬 상태 업데이트
      setPersonnel(prev => prev.filter(person => person.id !== id));
    } catch (error) {
      console.error('인력 삭제 오류:', error);
      alert('인력 삭제 중 오류가 발생했습니다.');
    }
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
    <div className="space-y-4">
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

  // Attendance Management
  const renderAttendance = () => (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-lg font-semibold mb-3">근태 관리</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="font-medium text-lg min-w-[120px] text-center">
              {currentCalendarDate.getFullYear()}년 {currentCalendarDate.getMonth() + 1}월
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="text-center font-medium py-2 text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, i) => {
            const firstDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
            const lastDay = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            
            const dateStr = new Date(currentDate.getTime() + (9 * 60 * 60 * 1000)).toISOString().split('T')[0]; // 한국 시간(UTC+9)
            const isCurrentMonth = currentDate.getMonth() === currentCalendarDate.getMonth();
            const dayAttendances = getAttendanceForDate(dateStr);
            const isHolidayDate = isHoliday(currentDate);
            const holidayName = getHolidayName(currentDate);
            const isSunday = currentDate.getDay() === 0;
            const isSaturday = currentDate.getDay() === 6;
            
            return (
              <div
                key={i}
                onClick={() => {
                  setSelectedAttendanceDate(dateStr);
                  setShowAttendanceModal(true);
                }}
                className={`min-h-[80px] p-1 border rounded cursor-pointer hover:bg-blue-50 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-100'
                }`}
              >
                <div className={`text-xs mb-1 font-medium ${
                  isHolidayDate || isSunday ? 'text-red-600' : 
                  isSaturday ? 'text-blue-600' : 
                  'text-gray-600'
                }`}>
                  {currentDate.getDate()}
                  {holidayName && (
                    <span className="block text-[11px] font-normal">{holidayName}</span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayAttendances.map(att => (
                    <div key={att.id} className={`text-xs p-1 rounded group relative ${
                      att.type === '연차' ? 'bg-red-100 text-red-800' :
                      att.type === '반차(오전)' ? 'bg-yellow-100 text-yellow-800' :
                      att.type === '반차(오후)' ? 'bg-orange-100 text-orange-800' :
                      att.type === '공가' ? 'bg-blue-100 text-blue-800' :
                      att.type === '병가' ? 'bg-purple-100 text-purple-800' :
                      att.type === '교육' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{att.personnelName}: {att.type}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`${att.personnelName}의 ${att.type} 근태를 삭제하시겠습니까?`)) {
                              handleAttendanceDelete(att.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-red-500 hover:text-white rounded transition-all"
                          title="삭제"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 근태 등록 모달 */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">근태 등록</h3>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜: {selectedAttendanceDate}
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">담당자</label>
                <select
                  value={attendanceForm.personnelId}
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value);
                    const selectedPerson = personnel.find(p => p.id === selectedId);
                    setAttendanceForm(prev => ({
                      ...prev,
                      personnelId: selectedId,
                      personnelName: selectedPerson?.name || ''
                    }));
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value={0}>담당자 선택</option>
                  {personnel.map(person => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">근태 유형</label>
                <select
                  value={attendanceForm.type}
                  onChange={(e) => setAttendanceForm(prev => ({ 
                    ...prev, 
                    type: e.target.value as '연차' | '반차(오전)' | '반차(오후)' | '공가' | '병가' | '교육'
                  }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="연차">연차</option>
                  <option value="반차(오전)">반차(오전)</option>
                  <option value="반차(오후)">반차(오후)</option>
                  <option value="공가">공가</option>
                  <option value="병가">병가</option>
                  <option value="교육">교육</option>
                </select>
              </div>
              
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        // 수정
        const updatedEquipment = { 
          ...editingEquipment, 
          ...equipmentForm 
        };
        
        // Supabase 업데이트
        const { error } = await supabase
          .from('equipment')
          .update({
            name: updatedEquipment.name,
            model: updatedEquipment.model,
            manufacturer: updatedEquipment.manufacturer,
            status: updatedEquipment.status,
            location: updatedEquipment.location,
            specifications: updatedEquipment.specifications
          })
          .eq('id', editingEquipment.id);
          
        if (error) {
          console.error('설비 수정 오류:', error);
          alert('설비 정보 수정 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        setEquipment(prev => prev.map(eq => 
          eq.id === editingEquipment.id ? updatedEquipment : eq
        ));
        setEditingEquipment(null);
      } else {
        // 추가
        const newEquipmentData = {
          name: equipmentForm.name,
          model: equipmentForm.model,
          manufacturer: equipmentForm.manufacturer,
          status: equipmentForm.status,
          location: equipmentForm.location,
          specifications: equipmentForm.specifications
        };
        
        // Supabase 추가
        const { data, error } = await supabase
          .from('equipment')
          .insert(newEquipmentData)
          .select()
          .single();
          
        if (error) {
          console.error('설비 추가 오류:', error);
          alert('설비 추가 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        const newEquipment: Equipment = {
          id: data.id,
          name: data.name,
          model: data.model,
          manufacturer: data.manufacturer,
          status: data.status,
          location: data.location,
          specifications: data.specifications || {}
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
    } catch (error) {
      console.error('설비 관리 오류:', error);
      alert('설비 관리 중 오류가 발생했습니다.');
    }
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

  const handleDeleteEquipment = async (id: number) => {
    try {
      // Supabase에서 삭제
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('설비 삭제 오류:', error);
        alert('설비 삭제 중 오류가 발생했습니다.');
        return;
      }
      
      // 로컬 상태 업데이트
      setEquipment(prev => prev.filter(eq => eq.id !== id));
    } catch (error) {
      console.error('설비 삭제 오류:', error);
      alert('설비 삭제 중 오류가 발생했습니다.');
    }
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
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
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
                  <p><span className="font-medium">기기번호:</span> {selectedEquipment.model}</p>
                  <p><span className="font-medium">P&ID:</span> {selectedEquipment.manufacturer}</p>
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
                  <table className="w-full border border-gray-200" style={{ minWidth: '100%' }}>
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
                          <td className="px-4 py-2 border-b text-sm whitespace-nowrap w-24">{Array.isArray(order.assignee) ? order.assignee.join(', ') : order.assignee}</td>
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
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
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
                    placeholder="기기번호"
                    value={equipmentForm.model}
                    onChange={(e) => setEquipmentForm(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <input
                    type="text"
                    placeholder="P&ID"
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
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">기기번호</th>
                  <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">P&ID</th>
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
                  <option value="데이타 시트">데이타 시트</option>
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

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        // 수정
        const updatedAnnouncement = { ...editingAnnouncement, ...announcementForm };
        
        // Supabase 업데이트
        const { error } = await supabase
          .from('announcements')
          .update({
            title: updatedAnnouncement.title,
            content: updatedAnnouncement.content,
            priority: updatedAnnouncement.priority,
            author: updatedAnnouncement.author
          })
          .eq('id', editingAnnouncement.id);
          
        if (error) {
          console.error('공지사항 수정 오류:', error);
          alert('공지사항 수정 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        setAnnouncements(prev => prev.map(announcement => 
          announcement.id === editingAnnouncement.id ? updatedAnnouncement : announcement
        ));
        setEditingAnnouncement(null);
      } else {
        // 추가
        const newAnnouncement = {
          title: announcementForm.title,
          content: announcementForm.content,
          priority: announcementForm.priority,
          author: announcementForm.author,
          date: new Date().toISOString().split('T')[0]
        };
        
        // Supabase 추가
        const { data, error } = await supabase
          .from('announcements')
          .insert(newAnnouncement)
          .select()
          .single();
          
        if (error) {
          console.error('공지사항 추가 오류:', error);
          alert('공지사항 추가 중 오류가 발생했습니다.');
          return;
        }
        
        // 로컬 상태 업데이트
        const newAnnouncementWithId: Announcement = {
          id: data.id,
          title: data.title,
          content: data.content,
          date: data.date,
          author: data.author,
          priority: data.priority
        };
        setAnnouncements(prev => [...prev, newAnnouncementWithId]);
      }
      
      setShowAnnouncementForm(false);
      setAnnouncementForm({
        title: '',
        content: '',
        priority: 'normal',
        author: '관리자'
      });
    } catch (error) {
      console.error('공지사항 관리 오류:', error);
      alert('공지사항 관리 중 오류가 발생했습니다.');
    }
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

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      // Supabase에서 삭제
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('공지사항 삭제 오류:', error);
        alert('공지사항 삭제 중 오류가 발생했습니다.');
        return;
      }
      
      // 로컬 상태 업데이트
      setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
    } catch (error) {
      console.error('공지사항 삭제 오류:', error);
      alert('공지사항 삭제 중 오류가 발생했습니다.');
    }
  };

  const renderAnnouncements = () => (
    <div className="space-y-4">
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

  // 업무일지 관리
  const renderDailyReport = () => {
    const filteredReports = dailyReports.filter(report => 
      dailyReportSearchDate ? report.date.includes(dailyReportSearchDate) : true
    ).sort((a, b) => b.date.localeCompare(a.date));

    return (
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">업무일지 관리</h2>
              <p className="text-gray-600 mt-1">일일 업무 현황을 기록하고 관리합니다</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="month"
                value={dailyReportSelectedMonth}
                onChange={(e) => setDailyReportSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => exportDailyReportsToExcel(dailyReportSelectedMonth)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                월별 엑셀 다운로드
              </button>
              <button
                onClick={() => {
                  setSelectedDailyReport(null);
                  setDailyReportForm({
                    id: '',
                    date: getKoreanDate(),
                    mechanical: { today: '', tomorrow: '' },
                    youngjinMechanical: { today: '', tomorrow: '' },
                    electrical: { today: '', tomorrow: '' },
                    youngjinElectrical: { today: '', tomorrow: '' },
                    control: { today: '', tomorrow: '' },
                    youngjinControl: { today: '', tomorrow: '' },
                    attendanceStatus: '',
                    safetySlogan: '',
                    createdBy: '',
                    createdAt: '',
                    updatedAt: ''
                  });
                  setShowDailyReportModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                업무일지 등록
              </button>
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex gap-4">
            <input
              type="date"
              value={dailyReportSearchDate}
              onChange={(e) => setDailyReportSearchDate(e.target.value)}
              placeholder="날짜로 검색"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setDailyReportSearchDate('')}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>

        {/* 업무일지 목록 */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">안전구호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일시</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      등록된 업무일지가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(report.date).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.createdBy}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {report.safetySlogan || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleDailyReportEdit(report)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </button>
                        <button
                          onClick={() => handleDailyReportDelete(report.id)}
                          className="text-red-600 hover:text-red-800 inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 업무일지 등록/수정 모달 */}
        {showDailyReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  {selectedDailyReport ? '업무일지 수정' : '업무일지 등록'}
                </h3>
                <button
                  onClick={() => {
                    setShowDailyReportModal(false);
                    setSelectedDailyReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleDailyReportSubmit} className="p-6 space-y-6">
                {/* 날짜 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                  <input
                    type="date"
                    value={dailyReportForm.date}
                    onChange={(e) => setDailyReportForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 업무 현황 테이블 */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 w-32">구분</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">금일</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">명일</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="bg-green-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">기계</td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.mechanical.today}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              mechanical: { ...prev.mechanical, today: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.mechanical.tomorrow}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              mechanical: { ...prev.mechanical, tomorrow: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">영진(기계)</td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.youngjinMechanical.today}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              youngjinMechanical: { ...prev.youngjinMechanical, today: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.youngjinMechanical.tomorrow}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              youngjinMechanical: { ...prev.youngjinMechanical, tomorrow: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">제어</td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.control.today}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              control: { ...prev.control, today: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.control.tomorrow}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              control: { ...prev.control, tomorrow: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">영진(제어)</td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.youngjinControl.today}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              youngjinControl: { ...prev.youngjinControl, today: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.youngjinControl.tomorrow}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              youngjinControl: { ...prev.youngjinControl, tomorrow: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">전기</td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.electrical.today}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              electrical: { ...prev.electrical, today: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.electrical.tomorrow}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              electrical: { ...prev.electrical, tomorrow: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">영진(전기)</td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.youngjinElectrical.today}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              youngjinElectrical: { ...prev.youngjinElectrical, today: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <textarea
                            value={dailyReportForm.youngjinElectrical.tomorrow}
                            onChange={(e) => setDailyReportForm(prev => ({
                              ...prev,
                              youngjinElectrical: { ...prev.youngjinElectrical, tomorrow: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={8}
                          />
                        </td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">근태현황</td>
                        <td className="px-4 py-3" colSpan={2}>
                          <textarea
                            value={dailyReportForm.attendanceStatus}
                            onChange={(e) => setDailyReportForm(prev => ({ ...prev, attendanceStatus: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={1}
                            placeholder="근태 현황을 입력하세요"
                          />
                        </td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">안전구호</td>
                        <td className="px-4 py-3" colSpan={2}>
                          <textarea
                            value={dailyReportForm.safetySlogan}
                            onChange={(e) => setDailyReportForm(prev => ({ ...prev, safetySlogan: e.target.value }))}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                            rows={1}
                            placeholder="안전구호를 입력하세요"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDailyReportModal(false);
                      setSelectedDailyReport(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {selectedDailyReport ? '수정' : '등록'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Chat
  const renderChat = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">실시간 소통</h2>
        <p className="text-gray-500">실시간 채팅 기능이 여기에 표시됩니다.</p>
      </div>
    </div>
  );

  // TM 현황 렌더링 함수
  const renderTMStatus = () => {
    // Supabase 실제 데이터 사용
    const displayTMData = tmStatusList;

    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">TM 현황</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TM NO.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작성일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기기명</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상세설명</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">진행상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">만든사람</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이미지</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">도면링크</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayTMData.map((tm) => (
                <tr 
                  key={tm.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedTMStatus(tm);
                    setShowTMDetailModal(true);
                  }}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {tm.tmNo}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tm.createdDate}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tm.equipmentName}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {tm.description}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ 
                      tm.status.includes('진행중') ? 'bg-orange-100 text-orange-800' : 
                      tm.status.includes('완료') ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tm.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tm.createdBy}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tm.assignee}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tm.images.length > 0 ? (
                      <img src={tm.images[0]} alt="TM 이미지" className="h-8 w-8 object-cover rounded" />
                    ) : (
                      <span className="text-gray-400">없음</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tm.drawingLink ? (
                      <a href={tm.drawingLink} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:text-blue-800">링크</a>
                    ) : (
                      <span className="text-gray-400">없음</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TM 상세 모달 */}
        {showTMDetailModal && selectedTMStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  TM 상세정보 - {selectedTMStatus.tmNo}
                </h3>
                <button
                  onClick={() => setShowTMDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* 1. TM NO. */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">TM NO.</label>
                  <div className="text-sm text-gray-900">{selectedTMStatus.tmNo}</div>
                </div>
                
                {/* 2-3. 작성일, 작성자 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작성일</label>
                    <div className="text-sm text-gray-900">{selectedTMStatus.createdDate}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작성자</label>
                    <div className="text-sm text-gray-900">{selectedTMStatus.createdBy}</div>
                  </div>
                </div>
                
                {/* 4. 기기명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">기기명</label>
                  <div className="text-sm text-gray-900">{selectedTMStatus.equipmentName}</div>
                </div>
                
                {/* 5. 상세설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상세설명</label>
                  <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">{selectedTMStatus.description}</div>
                </div>
                
                {/* 6-7. 고장코드, 우선순위 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">고장코드</label>
                    <div className="text-sm text-gray-900">{selectedTMStatus.faultCode || '미입력'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedTMStatus.priority === '높음' ? 'bg-red-100 text-red-800' :
                      selectedTMStatus.priority === '낮음' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedTMStatus.priority}
                    </span>
                  </div>
                </div>
                
                {/* 8-9. P&ID, 담당자 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">P&ID</label>
                    <div className="text-sm text-gray-900">
                      {selectedTMStatus.pidLink || '미입력'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                    <div className="text-sm text-gray-900">{selectedTMStatus.assignee}</div>
                  </div>
                </div>
                
                {/* 10. 작업시작 */}
                {selectedTMStatus.workRequest && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작업시작</label>
                    <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      {selectedTMStatus.workRequest}
                    </div>
                  </div>
                )}
                
                {/* 11. 작업사항 */}
                {selectedTMStatus.workDescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작업사항</label>
                    <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      {selectedTMStatus.workDescription}
                    </div>
                  </div>
                )}
                
                {/* 12. 작업완료 */}
                {selectedTMStatus.workSchedule && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">작업완료</label>
                    <div className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      {selectedTMStatus.workSchedule}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main render function
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'tm-status': return renderTMStatus();
      case 'schedule': return renderSchedule();
      case 'workorder': return renderWorkOrder();
      case 'personnel': return renderPersonnel();
      case 'attendance': return renderAttendance();
      case 'equipment': return renderEquipment();
      case 'documents': return renderDocuments();
      case 'announcements': return renderAnnouncements();
      case 'dailyreport': return renderDailyReport();
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
    <WeatherProvider>
      <div className="min-h-screen bg-gray-50">
        {renderNavigation()}
      
      {/* Loading Indicator */}
      {isLoadingData && (
        <div className="w-full bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">데이터를 불러오는 중입니다...</p>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {dataLoadError && !isLoadingData && (
        <div className="w-full bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{dataLoadError}</p>
            </div>
            <button
              onClick={() => loadAllDataFromSupabase()}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
      
      <main className="w-full py-4 px-2 sm:px-4 lg:px-6">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">작업 제목</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">TM NO.</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.tmNo || '해당 없음'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">설비명</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.equipment}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">기기명</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.equipmentName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">작업 내용</label>
                  <div className="mt-1">{formatDescriptionAsBulletPoints(selectedWorkOrder?.description)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">등록일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.requestDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">완료 예정일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.dueDate}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">담당자</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.isArray(selectedWorkOrder?.assignee) 
                      ? selectedWorkOrder.assignee.join(', ') 
                      : selectedWorkOrder?.assignee}
                  </p>
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">작업 제목</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">TM NO.</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.tmNo || '해당 없음'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">설비명</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.equipment}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">기기명</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.equipmentName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">작업 내용</label>
                  <div className="mt-1">{formatDescriptionAsBulletPoints(selectedWorkOrder?.description)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">등록일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.requestDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">완료 예정일</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorkOrder?.dueDate}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">담당자</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.isArray(selectedWorkOrder?.assignee) 
                      ? selectedWorkOrder.assignee.join(', ') 
                      : selectedWorkOrder?.assignee}
                  </p>
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
    </WeatherProvider>
  );
};

export default MaintenanceManagementSystem;