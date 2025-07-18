import React, { useState } from 'react';
import { supabase } from './supabaseClient';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
  onShowSignup: () => void;
  onShowForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onShowSignup, onShowForgotPassword }) => {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // 이메일 유효성 검사
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginForm.email)) {
        setError('올바른 이메일 형식을 입력해주세요.');
        setIsLoading(false);
        return;
      }

      // Supabase Auth로 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });
      
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('이메일 인증이 필요합니다. 가입 시 발송된 인증 메일을 확인해주세요.');
        } else if (authError.message.includes('Too many requests')) {
          setError('너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.');
        } else {
          setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }
        setIsLoading(false);
        return;
      }

      if (authData?.user) {
        // 로그인 성공
        const user = {
          id: authData.user.id,
          email: authData.user.email,
          fullName: authData.user.user_metadata?.full_name || '사용자',
          role: authData.user.user_metadata?.role || 'user',
          company: authData.user.user_metadata?.company || '',
          phone: authData.user.user_metadata?.phone || ''
        };
        
        onLoginSuccess(user);
      }
      
    } catch (error) {
      console.error('로그인 에러:', error);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/wideincheon-logo.png" alt="위드인천에너지" className="h-8 w-auto" />
            <span className="text-gray-400 text-lg">×</span>
            <img src="/youngjin-logo.png" alt="영진" className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">정비업체 관리 시스템</h1>
          <p className="text-gray-600 mt-2">로그인하여 시스템에 접속하세요</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onShowForgotPassword}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">계정이 없으신가요? </span>
          <button
            onClick={onShowSignup}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;