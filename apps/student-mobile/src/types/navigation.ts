import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
  // Future tabs (preserved for reactivation):
  Tasks?: undefined;
  Progress?: undefined;
  Exams?: { initialTab?: 'schedule' | 'results' } | undefined;
  // Keep legacy for backward compat
  MyLearning?: undefined;
  Bookmarks?: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  StudentOnboarding: { isEdit?: boolean } | undefined;
  Home: undefined;
  Learn: undefined;
  Profile: undefined;
  // Future / dormant screens (preserved for instant reactivation):
  Tasks?: undefined;
  Progress?: undefined;
  Exams?: { initialTab?: 'schedule' | 'results' } | undefined;
  ExamSchedule?: undefined;
  ExamResults?: undefined;
  // Legacy screens (still accessible via navigation)
  MyLearning: undefined;
  Bookmarks: undefined;
  MainTabs?: NavigatorScreenParams<MainTabParamList> | undefined;
  ClassSubjects: { classId: string };
  SubjectIndex: { classId: string; subjectId: string };
  ChapterDetails: { classId: string; subjectId: string; chapterId: string };
  SectionDetails: { classId: string; subjectId: string; chapterId: string; sectionId: string };
  Quiz: { quizId: string; classId?: string; subjectId?: string; chapterId?: string };
  QuizResult: {
    quizId: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
    passed: boolean;
  };
  Notifications: undefined;
  NotificationDetail: { notificationId: string };
};
