import React, { useState } from 'react';
import { supabase } from './supabaseClient';

interface SignupPageProps {
  onSignupSuccess: () => void;
  onBackToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
    phone: ''
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [canResendEmail, setCanResendEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [lastSignupData, setLastSignupData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      setError('필수 항목을 모두 입력해주세요.');
      return false;
    }

    if (!agreeToTerms) {
      setError('개인정보 처리방침에 동의해주세요.');
      return false;
    }

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식이 아닙니다.');
      return false;
    }

    // 비밀번호 검사
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    return true;
  };

  const handleResendEmail = async () => {
    if (!lastSignupData) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: lastSignupData.email,
        options: lastSignupData.options
      });
      
      if (resendError) {
        setError('이메일 재전송 중 오류가 발생했습니다: ' + resendError.message);
      } else {
        setSuccessMessage('인증 메일이 다시 전송되었습니다! 이메일을 확인해주세요.');
        setCanResendEmail(false);
        setResendCooldown(60);
        
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResendEmail(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('이메일 재전송 에러:', error);
      setError('이메일 재전송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Supabase Auth로 회원가입
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        phone: formData.phone, // 기본 phone 필드에 저장
        options: {
          data: {
            full_name: formData.fullName,
            company: formData.company,
            phone: formData.phone,
            role: 'user' // 기본 역할은 user
          },
          emailRedirectTo: process.env.REACT_APP_EMAIL_REDIRECT_URL || `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('이미 등록된 이메일입니다.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data?.user) {
        setSuccessMessage('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 인증해주세요.');
        setLastSignupData({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              company: formData.company,
              phone: formData.phone,
              role: 'user'
            },
            emailRedirectTo: process.env.REACT_APP_EMAIL_REDIRECT_URL || `${window.location.origin}/auth/callback`
          }
        });
        
        // 60초 후 재전송 가능
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              setCanResendEmail(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/wideincheon-logo.png" alt="위드인천에너지" className="h-8 w-auto" />
            <span className="text-gray-400 text-lg">×</span>
            <img src="/youngjin-logo.png" alt="영진" className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">회원가입</h1>
          <p className="text-gray-600 mt-2">정비 관리 시스템 계정을 생성하세요</p>
        </div>

        {successMessage ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
              <p className="font-semibold mb-2">{successMessage}</p>
              <p className="text-sm">
                입력하신 이메일 주소로 인증 메일을 발송했습니다.<br />
                메일함을 확인하여 인증 링크를 클릭해주세요.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
              <p className="text-sm font-semibold mb-1">📧 이메일이 도착하지 않았나요?</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>스팸 메일함을 확인해주세요</li>
                <li>이메일 주소가 정확한지 확인해주세요</li>
                <li>몇 분 후에 다시 시도해주세요</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              {canResendEmail ? (
                <button
                  onClick={handleResendEmail}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  인증 메일 재전송
                </button>
              ) : resendCooldown > 0 ? (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
                >
                  재전송 가능까지 {resendCooldown}초
                </button>
              ) : null}
              
              <button
                onClick={onBackToLogin}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                로그인 페이지로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이메일을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회사명
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="회사명을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="연락처를 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력하세요 (최소 6자)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 mr-2"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                개인정보 처리방침에 동의합니다. <span className="text-red-500">*</span>
                <br />
                <span className="text-xs text-gray-500">
                  서비스 이용을 위해 필요한 최소한의 개인정보를 수집하며, 
                  수집된 정보는 서비스 제공 목적으로만 사용됩니다.
                </span>
              </label>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !agreeToTerms}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '처리 중...' : '회원가입'}
            </button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                로그인하기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;