import { useEffect } from 'react';

const DifyChatbot = () => {
  useEffect(() => {
    // 스크립트가 이미 로드되어 있는지 확인
    const existingScript = document.getElementById('LgVEnTaf3ncIaEct');
    if (existingScript) {
      return;
    }

    // 스크립트 추가
    const script = document.createElement('script');
    script.src = 'https://udify.app/embed.min.js';
    script.id = 'LgVEnTaf3ncIaEct';
    script.defer = true;
    
    script.onload = () => {
      console.log('Dify script loaded successfully');
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Dify script:', error);
    };

    document.body.appendChild(script);

    // 클린업 함수
    return () => {
      const scriptToRemove = document.getElementById('LgVEnTaf3ncIaEct');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
      
      // 챗봇 UI 요소들 제거
      const chatbotButton = document.querySelector('#dify-chatbot-bubble-button, [id*="dify"]');
      if (chatbotButton) {
        chatbotButton.remove();
      }
      
      const chatbotWindow = document.querySelector('#dify-chatbot-bubble-window, [id*="dify-chat"]');
      if (chatbotWindow) {
        chatbotWindow.remove();
      }
    };
  }, []);

  return null;
};

export default DifyChatbot;