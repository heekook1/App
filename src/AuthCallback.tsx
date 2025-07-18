import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const AuthCallback: React.FC = () => {
  const [message, setMessage] = useState('인증 처리 중...');
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URL에서 인증 코드 확인
        const { data, error } = await supabase.auth.getSession();
        
        if (!data.session) {
          // 세션이 없으면 URL의 코드로 세션 교환 시도
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);

          if (exchangeError) {
            setError(true);
            setMessage('이메일 인증에 실패했습니다. 링크가 만료되었거나 유효하지 않습니다.');
          } else {
            setMessage('이메일 인증이 완료되었습니다! 잠시 후 로그인 페이지로 이동합니다.');
            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          }
        } else {
          setMessage('이메일 인증이 완료되었습니다! 잠시 후 로그인 페이지로 이동합니다.');
          // 3초 후 로그인 페이지로 리다이렉트
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError(true);
        setMessage('인증 처리 중 오류가 발생했습니다.');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/wideincheon-logo.png" alt="위드인천에너지" className="h-8 w-auto" />
          <span className="text-gray-400 text-lg">×</span>
          <img src="/youngjin-logo.png" alt="영진" className="h-8 w-auto" />
        </div>
        
        <div className={`text-lg ${error ? 'text-red-600' : 'text-gray-800'}`}>
          {message}
        </div>
        
        {error && (
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            로그인 페이지로 이동
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;