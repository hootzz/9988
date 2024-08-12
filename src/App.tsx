import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Home, Leaf, Brain, Users, Sun, ChevronRight, Mic, Calendar } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UserInfo {
  name: string;
  age: number;
  interests: string[];
  cognitiveScore: number;
}

interface HomePageProps {
  userInfo: UserInfo;
  startVoiceChat: () => void;
}

const EcoCognitiveApp = () => {
  const [activeTab, setActiveTab] = useState('홈');
  const [isListening, setIsListening] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '김지훈',
    age: 65,
    interests: ['정원 가꾸기', '친환경 요리'],
    cognitiveScore: 85
  });
  const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case '홈':
        return <HomePage userInfo={userInfo} startVoiceChat={startVoiceChat} />;
      case '상태':
        return <StatusPage userInfo={userInfo} />;
      case '활동':
        return <ActivitiesPage userInfo={userInfo} />;
      case '모니터링':
        return <MonitoringPage userInfo={userInfo} />;
      case '대화':
        return <ChatPage chatHistory={chatHistory} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  const startVoiceChat = () => {
    setActiveTab('대화');
    toggleVoiceRecognition();
  };

  const toggleVoiceRecognition = async () => {
    setIsListening(!isListening);

    if (!isListening) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          throw new Error('Speech recognition is not supported in this browser');
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';

        recognition.onstart = () => {
          console.log('Speech recognition started');
        };

        recognition.onresult = async (event: any) => {
          const speechResult = event.results[0][0].transcript;
          console.log('Recognized speech:', speechResult);
          setChatHistory(prev => [...prev, { role: 'user', content: speechResult }]);
          await handleGPTResponse(speechResult);
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setIsListening(false);
      }
    }
  };

  const handleGPTResponse = async (text: string) => {
    setIsLoading(true);
    try {
      // GPT-4 API 호출
      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': ``,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: '당신은 [9988] 앱의 AI 도우미입니다. 이 앱은 노인들의 인지 건강을 증진시키면서 동시에 환경 보호 의식을 고취시키는 것을 목표로 합니다. 당신의 역할은 65세 이상의 노인들을 주 대상으로 하는 친절하고 인내심 있는 AI 도우미입니다. 항상 존중과 공감의 태도를 유지하며, 사용자를 [~님]으로 호칭하세요. 명확하고 간단한 언어를 사용하되, 사용자를 어린아이 대하듯 하지 않도록 주의하세요. 긍정적이고 격려하는 톤을 유지하며, 사용자의 노력을 항상 인정하고 칭찬하세요. 주요 기능으로는 인지 건강 증진, 환경 보호 활동 안내, 인지 건강과 환경 보호의 연계, 사회적 상호작용 촉진, 안전과 웰빙 고려가 있습니다. 인지 건강 증진을 위해 기억력, 집중력, 문제 해결 능력을 향상시키는 활동을 제안하고, 인지 기능 저하의 초기 징후에 대해 설명하며, 필요시 전문의 상담을 권하세요. 또한 뇌 건강에 좋은 식습관, 운동 방법 등을 제안하세요. 환경 보호 활동으로는 일상에서 실천할 수 있는 친환경 활동을 소개하고, 환경 보호가 건강과 삶의 질에 미치는 긍정적 영향을 설명하며, 지역 환경 단체나 활동에 대한 정보를 제공하세요. 인지 건강과 환경 보호를 연계하여 정원 가꾸기, 친환경 요리 등 두 가지를 동시에 촉진하는 활동을 제안하고, 자연 속에서의 활동이 인지 건강에 미치는 긍정적 영향을 강조하세요. 사회적 상호작용을 촉진하기 위해 환경 보호 활동을 통한 사회적 교류의 기회를 제안하고, 가족, 친구들과 함께할 수 있는 친환경 활동을 추천하세요. 안전과 웰빙을 위해 모든 활동에서 노인의 안전을 최우선으로 고려하고, 과도한 활동은 피하며 적절한 휴식의 중요성을 강조하세요. 상호작용 시 사용자의 질문이나 문제에 대해 단계별로 설명하고, 복잡한 개념은 일상생활의 예시를 들어 설명하세요. 사용자의 개인정보를 기억하고 대화에 적절히 활용하며, 건강 상태나 환경에 대한 우려를 경청하고 공감적으로 응답하세요. 정보 제공 시 신뢰할 수 있는 출처를 인용하세요. 인지 기능 저하가 의심될 경우 부드럽게 전문의 상담을 권유하고, 환경 문제에 대해 지나치게 비관적이거나 불안감을 조성하지 않도록 주의하세요. 사용자의 신체적 한계를 고려하여 활동을 추천하고, 디지털 기기 사용에 어려움을 겪을 수 있음을 인지하고 필요시 자세한 설명을 제공하세요. 의학적 조언이나 진단을 제공하지 말고, 건강 문제는 항상 전문의와 상담을 권유하세요. 환경 문제에 대해 과도한 책임감이나 죄책감을 느끼지 않도록 하고, 사용자의 개인정보를 항상 존중하며 민감한 정보를 요구하지 마세요. 정치적으로 편향된 발언을 하지 마세요. 이 지침을 따라 사용자와 상호작용하면서, 노인들의 인지 건강 증진과 환경 보호 의식 고취라는 앱의 목표를 달성하는 데 도움을 주세요. 항상 친절하고, 이해하기 쉬우며, 격려하는 태도로 응답해 주세요.' },
            ...chatHistory,
            { role: 'user', content: text }
          ],
        }),
      });

      if (!gptResponse.ok) {
        throw new Error('Failed to get response from GPT API');
      }

      const gptData = await gptResponse.json();
      const gptReply = gptData.choices[0].message.content;

      setChatHistory(prev => [...prev, { role: 'assistant', content: gptReply }]);

      // 텍스트를 음성으로 변환
      const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: gptReply,
          voice: 'shimmer',
        }),
      });

      if (!speechResponse.ok) {
        throw new Error('Failed to get speech from OpenAI API');
      }

      const audioBlob = await speechResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }

    } catch (error) {
      console.error('Error in GPT response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen font-sans text-gray-800">
      <header className="bg-white shadow-lg p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-700">9988</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoiceRecognition}
          className={`rounded-full p-4 ${isListening ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}
        >
          <Mic size={32} />
        </Button>
      </header>
      
      <main className="p-6 pb-24">
        {renderContent()}
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-4 shadow-lg">
        {['홈', '상태', '활동', '모니터링', '대화'].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col items-center ${activeTab === tab ? 'text-green-600' : 'text-gray-600'}`}
          >
            {tab === '홈' && <Home size={32} />}
            {tab === '상태' && <Users size={32} />}
            {tab === '활동' && <Leaf size={32} />}
            {tab === '모니터링' && <Brain size={32} />}
            {tab === '대화' && <Mic size={32} />}
            <span className="text-lg mt-2">{tab}</span>
          </Button>
        ))}
      </nav>
      <audio ref={audioRef} />
    </div>
  );
};

const HomePage = ({ userInfo, startVoiceChat }: HomePageProps) => (
  <div className="flex flex-col items-center justify-center h-full">
    <h2 className="text-3xl font-semibold mb-8 text-center mt-60">안녕하세요, {userInfo.name} 님! </h2>
    <h1 className="text-4xl font-semibold mb-8 text-center">오늘은 무엇을 하시겠어요? </h1>
    <Button onClick={startVoiceChat} className="w-full max-w-md bg-blue-500 hover:bg-blue-600 mt-8 text-white py-4 rounded-lg shadow-md py-8 font-semibold text-xl">
      대화하기
    </Button>
  </div>
);

const ChatPage = ({ chatHistory, isLoading }: { chatHistory: { role: string, content: string }[], isLoading: boolean }) => (
  <div className="space-y-4">
    {chatHistory.map((msg, index) => (
      <div key={index} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
        <p className="font-semibold">{msg.role === 'user' ? '사용자' : 'AI'}</p>
        <p>{msg.content}</p>
      </div>
    ))}
    {isLoading && <div className="text-center">AI가 응답을 생성 중입니다...</div>}
  </div>
);

const StatusPage = ({ userInfo }: {userInfo: UserInfo}) => (
  <>
    <Card className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 p-8 text-white">
        <h2 className="text-2xl font-semibold mb-4">오늘의 상태</h2>
        <div className="flex justify-between">
          <div>
            <p className="text-lg opacity-75">인지 점수</p>
            <p className="text-5xl font-bold">{userInfo.cognitiveScore}</p>
          </div>
          <div>
            <p className="text-lg opacity-75">자연의 영향</p>
            <p className="text-5xl font-bold">+12</p>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">오늘의 목표</h3>
        <ul className="space-y-4">
          <li className="flex items-center bg-green-50 p-4 rounded-lg">
            <Sun size={24} className="text-yellow-500 mr-4" />
            <span className="text-lg">30분 자연 산책하기</span>
          </li>
          <li className="flex items-center bg-blue-50 p-4 rounded-lg">
            <Leaf size={24} className="text-green-500 mr-4" />
            <span className="text-lg">재활용품 20개 분리수거하기</span>
          </li>
          <li className="flex items-center bg-purple-50 p-4 rounded-lg">
            <Brain size={24} className="text-purple-500 mr-4" />
            <span className="text-lg">명상 앱으로 10분 집중하기</span>
          </li>
        </ul>
      </CardContent>
    </Card>
    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-8 rounded-lg shadow-md font-semibold text-xl">
      목표 달성하기
    </Button>
    <div className="space-y-6 mt-6">
      
    </div>
  </>
);

const ActivitiesPage = ({ userInfo }: {userInfo: UserInfo}) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold mb-6">맞춤 활동 추천</h2>
    {[
      { icon: Leaf, color: 'bg-green-100 text-green-500', title: '도시 정원 가꾸기', desc: '인지기능: 계획, 집중력' },
      { icon: Brain, color: 'bg-purple-100 text-purple-500', title: '환경 소리 퀴즈', desc: '인지기능: 청각 기억, 집중력' },
      { icon: Sun, color: 'bg-yellow-100 text-yellow-500', title: '친환경 요리 워크샵', desc: '인지기능: 실행 기능, 계획' },
      { icon: Calendar, color: 'bg-blue-100 text-blue-500', title: '환경 관련 독서 모임', desc: '인지기능: 언어, 기억력' },
    ].map((activity, index) => (
      <Card key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center p-6">
          <div className={`${activity.color} p-4 rounded-full mr-6`}>
            <activity.icon size={32} />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
            <p className="text-lg text-gray-600">{activity.desc}</p>
          </div>
          <ChevronRight size={24} className="text-gray-400" />
        </div>
      </Card>
    ))}
    <p className="text-lg text-gray-600 mt-6">
      * 이 활동들은 {userInfo.name}님의 관심사({userInfo.interests.join(', ')})와 인지 상태를 고려하여 추천되었습니다.
    </p>
  </div>
);

const MonitoringPage = ({ userInfo }: {userInfo: UserInfo}) => (
  <Card className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 p-8 text-white">
      <h2 className="text-2xl font-semibold mb-4">인지 건강 모니터링</h2>
      <p className="text-lg opacity-75 mb-3">주간 인지 기능 변화</p>
      <div className="flex items-center">
        <Progress value={75} className="flex-grow mr-4 h-4 rounded-full" />
        <span className="font-bold text-2xl">75%</span>
      </div>
    </div>
    <CardContent className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
          <span className="text-lg">총점</span>
          <span className="text-2xl font-bold text-blue-600">{userInfo.cognitiveScore}/100</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '시공간/실행', score: 4, total: 5 },
            { label: '어휘력', score: 3, total: 3 },
            { label: '주의력', score: 5, total: 6 },
            { label: '문장력', score: 2, total: 3 },
            { label: '추상', score: 2, total: 2 },
            { label: '지연 회상', score: 3, total: 5 },
            { label: '지남력', score: 6, total: 6 },
          ].map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <p className="text-lg font-semibold mb-2">{item.label}</p>
              <div className="flex items-center">
                <Progress value={(item.score / item.total) * 100} className="flex-grow mr-3 h-3 rounded-full" />
                <span className="font-bold">{item.score}/{item.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-lg text-gray-600 mt-6">
        * 이 결과는 {userInfo.name}님의 최근 인지 건강 테스트 결과를 바탕으로 산출되었습니다.
      </p>
    </CardContent>
  </Card>
);


export default EcoCognitiveApp;