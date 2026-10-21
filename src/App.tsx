import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab, USERS_LIST } from './components/Sidebar';
import { Header } from './components/Header';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AITutor } from './components/AITutor';
import { UnifiedDocumentAI } from './components/UnifiedDocumentAI';
import { RoadmapView } from './components/RoadmapView';
import { ProbabilityLab } from './components/ProbabilityLab';
import { WeeklyChallenge } from './components/WeeklyChallenge';
import { PersonalizedExam } from './components/PersonalizedExam';
import { PracticeSelfTest } from './components/PracticeSelfTest';
import { MindmapView } from './components/MindmapView';
import { Forum } from './components/Forum';
import { ErrorStatsAndReports } from './components/ErrorStatsAndReports';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { PlatformOverview } from './components/PlatformOverview';
import { UserProfile, StreakData, StudyActivity } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [currentUser, setCurrentUser] = useState<UserProfile>(USERS_LIST[0]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedKnowledgeChapter, setSelectedKnowledgeChapter] = useState<number>(1);

  // Streak & Activity State
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 3,
    longestStreak: 7,
    lastStudyDate: '',
    history: [],
  });
  const [recentActivities, setRecentActivities] = useState<StudyActivity[]>([]);

  // Fetch streak on mount & when currentUser changes
  const fetchStreak = async (userId: string) => {
    try {
      const res = await fetch(`/api/streak?userId=${userId}`);
      const data = await res.json();
      if (data.streak) setStreakData(data.streak);
      if (data.activities) setRecentActivities(data.activities);
    } catch (err) {
      console.error('Error fetching streak:', err);
    }
  };

  useEffect(() => {
    fetchStreak(currentUser.id);
  }, [currentUser.id]);

  // Handler when student completes any qualifying study activity with positive score
  const handleActivityCompleted = async (score: number, title: string) => {
    if (score <= 0) return;

    try {
      const res = await fetch('/api/streak/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type: 'assignment',
          title,
          score,
          maxScore: 10,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStreakData(data.streak);
        if (data.activity) {
          setRecentActivities((prev) => [data.activity, ...prev]);
        }
      }
    } catch (err) {
      console.error('Error recording streak:', err);
    }
  };

  const handleNavigateToChapter = (chapterId: number) => {
    setSelectedKnowledgeChapter(chapterId);
    setActiveTab('knowledge');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F3EC] text-slate-800 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        streakDays={streakData.currentStreak}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          currentUser={currentUser}
          streakData={streakData}
          recentActivities={recentActivities}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'overview' && (
            <PlatformOverview
              onNavigateTab={(tab) => setActiveTab(tab)}
              onNavigateChapter={handleNavigateToChapter}
              streakDays={streakData.currentStreak}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeBase
              currentUser={currentUser}
              initialChapterId={selectedKnowledgeChapter}
            />
          )}

          {activeTab === 'tutor' && (
            <AITutor
              currentUser={currentUser}
              onActivityCompleted={handleActivityCompleted}
            />
          )}

          {activeTab === 'unified_doc' && (
            <UnifiedDocumentAI
              currentUser={currentUser}
              onActivityCompleted={handleActivityCompleted}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapView
              currentUser={currentUser}
              onActivityCompleted={handleActivityCompleted}
              onNavigateToChapter={handleNavigateToChapter}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'lab' && (
            <ProbabilityLab
              currentUser={currentUser}
              onActivityCompleted={handleActivityCompleted}
            />
          )}

          {activeTab === 'weekly_challenge' && (
            <WeeklyChallenge
              currentUser={currentUser}
              onActivityCompleted={handleActivityCompleted}
            />
          )}

          {activeTab === 'custom_exam' && (
            <PersonalizedExam
              currentUser={currentUser}
              onActivityCompleted={handleActivityCompleted}
            />
          )}

          {activeTab === 'standard_exam' && (
            <PracticeSelfTest
              currentUser={currentUser}
              onActivityCompleted={handleActivityCompleted}
            />
          )}

          {activeTab === 'mindmap' && (
            <MindmapView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onNavigateChapter={handleNavigateToChapter}
            />
          )}

          {activeTab === 'forum' && <Forum currentUser={currentUser} />}

          {activeTab === 'reports' && <ErrorStatsAndReports currentUser={currentUser} />}
        </main>
      </div>

      {/* User Profile & Account Switcher Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={(u) => setCurrentUser(u)}
        streakData={streakData}
        activities={recentActivities}
      />

      {/* Realistic Authentication Modal (Google/Gmail & Phone OTP) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
