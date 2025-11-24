import { useEffect } from 'react';

const DifyChatbot = () => {
  useEffect(() => {
    // 스크립트가 이미 로드되어 있는지 확인
    const existingScript = document.getElementById('LgVEnTaf3ncIaEct');
    if (existingScript) {
      return;
    }

    // 챗봇 설정 추가 (공식 매뉴얼 형식)
    (window as any).difyChatbotConfig = {
      token: 'LgVEnTaf3ncIaEct',
      inputs: {
        // Start node에서 정의된 입력값들을 여기서 설정할 수 있음
        // 키는 변수명
        // 예: name: "NAME"
      },
      systemVariables: {
        // user_id: 'YOU CAN DEFINE USER ID HERE',
        // conversation_id: 'YOU CAN DEFINE CONVERSATION ID HERE, IT MUST BE A VALID UUID',
      },
      userVariables: {
        // avatar_url: 'YOU CAN DEFINE USER AVATAR URL HERE',
        // name: 'YOU CAN DEFINE USER NAME HERE',
      }
    };

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
      console.error('챗봇 토큰이 만료되었거나 잘못된 것 같습니다. Dify에서 새 토큰을 확인해주세요.');
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