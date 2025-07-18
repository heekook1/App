import React, { useState } from 'react';
import { supabase } from './supabaseClient';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Try Supabase Auth first
      const email = loginForm.username.includes('@') 
        ? loginForm.username 
        : `${loginForm.username}@example.com`;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: loginForm.password
      });
      
      if (authError) {
        // Fallback to custom users table for backward compatibility
        const passwordHash = simpleHash(loginForm.password);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', loginForm.username)
          .eq('password_hash', passwordHash)
          .eq('is_active', true)
          .single();
          
        if (error || !data) {
          setError('아이디 또는 비밀번호가 틀렸습니다.');
          setIsLoading(false);
          return;
        }
        
        // 로그인 성공 (legacy user)
        const user = {
          id: data.id,
          username: data.username,
          fullName: data.full_name,
          role: data.role
        };
        
        onLoginSuccess(user);
      } else {
        // Supabase Auth login success
        const user = {
          id: authData.user?.id || '',
          username: authData.user?.user_metadata?.username || loginForm.username,
          fullName: authData.user?.user_metadata?.full_name || '사용자',
          role: authData.user?.user_metadata?.role || 'user'
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
          <h1 className="text-3xl font-bold text-gray-800">정비 관리 시스템</h1>
          <p className="text-gray-600 mt-2">로그인하여 시스템에 접속하세요</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              아이디
            </label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="아이디를 입력하세요"
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
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>테스트 계정</p>
          <p className="font-mono mt-1">ID: admin / PW: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;