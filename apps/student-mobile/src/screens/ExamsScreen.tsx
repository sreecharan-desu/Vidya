import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { PageIntro, HoverCard } from '../components/common';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Exams' | 'ExamSchedule' | 'ExamResults'>;

type ExamCategory = 'sa1' | 'fa' | 'sa2' | 'all';
type AssessmentType = 'fa2' | 'fa1' | 'sa1_model' | 'prev_annual';

interface ExamItem {
  id: string;
  category: 'sa1' | 'fa' | 'sa2';
  subjectName: string;
  subjectCode: string;
  dateDay: string;
  dateMonth: string;
  dayOfWeek: string;
  fullDate: string;
  time: string;
  syllabusPortion: string;
  unitsSummary: string;
  isUpcoming: boolean;
  status: 'Next Up' | 'Upcoming' | 'Scheduled';
}

const EXAM_SCHEDULE: ExamItem[] = [
  {
    id: 'exam-1',
    category: 'sa1',
    subjectName: 'First Language (Telugu)',
    subjectCode: '01T',
    dateDay: '16',
    dateMonth: 'NOV',
    dayOfWeek: 'MON',
    fullDate: 'Nov 16, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: '5 Lessons: Matrubhoomi, Tyagam, Sandhulu & Grammar',
    syllabusPortion: 'Lessons 1 to 5: Matrubhoomi, Tyagam, Sandhulu, Samasalu, Alankaralu, and Letter Writing.',
    isUpcoming: true,
    status: 'Next Up',
  },
  {
    id: 'exam-2',
    category: 'sa1',
    subjectName: 'Mathematics',
    subjectCode: '02M',
    dateDay: '18',
    dateMonth: 'NOV',
    dayOfWeek: 'WED',
    fullDate: 'Nov 18, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: '5 Units: Rational Numbers to Square Roots',
    syllabusPortion: 'Units 1–5: Rational Numbers, Linear Equations in One Variable, Understanding Quadrilaterals, Data Handling, Squares and Square Roots.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-3',
    category: 'sa1',
    subjectName: 'Physical Science',
    subjectCode: '03PS',
    dateDay: '20',
    dateMonth: 'NOV',
    dayOfWeek: 'FRI',
    fullDate: 'Nov 20, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: '4 Units: Force & Pressure, Friction, Sound, Electric Current',
    syllabusPortion: 'Units 1–4: Force & Pressure, Friction, Sound, Chemical Effects of Electric Current.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-4',
    category: 'sa1',
    subjectName: 'Biological Science',
    subjectCode: '04BS',
    dateDay: '21',
    dateMonth: 'NOV',
    dayOfWeek: 'SAT',
    fullDate: 'Nov 21, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: '4 Units: Crop Production, Microorganisms, Cell Structure, Animals',
    syllabusPortion: 'Units 1–4: Crop Production & Management, Microorganisms: Friend and Foe, Cell Structure and Functions, Reproduction in Animals.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-5',
    category: 'sa1',
    subjectName: 'Social Studies',
    subjectCode: '05SS',
    dateDay: '23',
    dateMonth: 'NOV',
    dayOfWeek: 'MON',
    fullDate: 'Nov 23, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: 'Geography, History (Ch 1–4), Civics: Rule of Law',
    syllabusPortion: 'Resources and Development, Our Pasts III (Chapters 1–4), Rule of Law, Secularism, and Social Justice.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-6',
    category: 'sa1',
    subjectName: 'General English',
    subjectCode: '06E',
    dateDay: '24',
    dateMonth: 'NOV',
    dayOfWeek: 'TUE',
    fullDate: 'Nov 24, 2026',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: 'Honeydew Units 1–4, Supplementary Ch 1–3, Composition',
    syllabusPortion: 'Honeydew Units 1–4, It So Happened Chapters 1–3, Reading Comprehension, Formal Letter Writing, Story Writing.',
    isUpcoming: true,
    status: 'Upcoming',
  },
  {
    id: 'exam-7',
    category: 'fa',
    subjectName: 'Formative Assessment 3 (FA-3)',
    subjectCode: 'FA-03',
    dateDay: '08',
    dateMonth: 'JAN',
    dayOfWeek: 'THU',
    fullDate: 'Jan 08 – Jan 10, 2027',
    time: 'Classroom Hours',
    unitsSummary: 'Slip Tests, Lab Activities, Project Work (50 Marks)',
    syllabusPortion: 'Internal classroom slip tests, notebook evaluation, science project submissions, and student seminars.',
    isUpcoming: false,
    status: 'Scheduled',
  },
  {
    id: 'exam-8',
    category: 'sa2',
    subjectName: 'Summative Assessment 2 (Annual Final)',
    subjectCode: 'SA-02',
    dateDay: '22',
    dateMonth: 'MAR',
    dayOfWeek: 'MON',
    fullDate: 'Mar 22 – Mar 31, 2027',
    time: '09:30 AM – 12:15 PM',
    unitsSummary: 'Comprehensive Full Annual Syllabus (Classes 8)',
    syllabusPortion: 'Full academic year curriculum covering all 6 core subjects under Andhra Pradesh SCERT state board.',
    isUpcoming: false,
    status: 'Scheduled',
  },
];

interface SubjectResult {
  code: string;
  name: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  maxMarks: number;
  marksObtained: number;
  grade: string;
  points: number;
  remarks: string;
}

const ASSESSMENT_RESULTS: Record<AssessmentType, {
  title: string;
  shortTitle: string;
  term: string;
  date: string;
  status: string;
  gpa: string;
  totalMarks: number;
  maxTotal: number;
  percentage: string;
  overallGrade: string;
  teacherRemarks: string;
  conduct: string;
  subjects: SubjectResult[];
}> = {
  fa2: {
    title: 'Formative Assessment 2 (FA-2)',
    shortTitle: 'FA-2 Assessment',
    term: 'Academic Year 2026–2027',
    date: 'Published Sep 28, 2026',
    status: 'PASSED · DISTINCTION',
    gpa: '9.6',
    totalMarks: 335,
    maxTotal: 350,
    percentage: '95.7%',
    overallGrade: 'A1',
    conduct: 'Exemplary',
    teacherRemarks: 'Exceptional problem-solving skills in Mathematics and analytical logic in Science. Continues to demonstrate disciplined study habits.',
    subjects: [
      { code: '01T', name: 'First Language Telugu', icon: 'translate', maxMarks: 50, marksObtained: 47, grade: 'A1', points: 10, remarks: 'Excellent grammar and poetry analysis' },
      { code: '02H', name: 'Second Language Hindi', icon: 'menu-book', maxMarks: 50, marksObtained: 45, grade: 'A1', points: 9, remarks: 'Good vocabulary and neat presentation' },
      { code: '03E', name: 'General English', icon: 'language', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Strong reading comprehension and creative writing' },
      { code: '04M', name: 'Mathematics', icon: 'calculate', maxMarks: 50, marksObtained: 50, grade: 'A1', points: 10, remarks: 'Perfect score · Flawless proof derivation' },
      { code: '05PS', name: 'Physical Science', icon: 'science', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Clear understanding of force & pressure' },
      { code: '06BS', name: 'Biological Science', icon: 'biotech', maxMarks: 50, marksObtained: 49, grade: 'A1', points: 10, remarks: 'Accurate biological diagrams and labeling' },
      { code: '07SS', name: 'Social Studies', icon: 'public', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Thorough knowledge of resources & civic duties' },
    ],
  },
  fa1: {
    title: 'Formative Assessment 1 (FA-1)',
    shortTitle: 'FA-1 Assessment',
    term: 'Academic Year 2026–2027',
    date: 'Published Jul 30, 2026',
    status: 'PASSED · DISTINCTION',
    gpa: '9.4',
    totalMarks: 328,
    maxTotal: 350,
    percentage: '93.7%',
    overallGrade: 'A1',
    conduct: 'Very Good',
    teacherRemarks: 'Strong start to Class 8 syllabus. Active participation in classroom discussions and periodic slip tests.',
    subjects: [
      { code: '01T', name: 'First Language Telugu', icon: 'translate', maxMarks: 50, marksObtained: 46, grade: 'A1', points: 9, remarks: 'Good grasp of prose & grammar' },
      { code: '02H', name: 'Second Language Hindi', icon: 'menu-book', maxMarks: 50, marksObtained: 44, grade: 'A1', points: 9, remarks: 'Satisfactory comprehension' },
      { code: '03E', name: 'General English', icon: 'language', maxMarks: 50, marksObtained: 47, grade: 'A1', points: 10, remarks: 'Excellent written vocabulary' },
      { code: '04M', name: 'Mathematics', icon: 'calculate', maxMarks: 50, marksObtained: 49, grade: 'A1', points: 10, remarks: 'Outstanding analytical precision' },
      { code: '05PS', name: 'Physical Science', icon: 'science', maxMarks: 50, marksObtained: 46, grade: 'A1', points: 9, remarks: 'Good conceptual understanding' },
      { code: '06BS', name: 'Biological Science', icon: 'biotech', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Well-illustrated experiments' },
      { code: '07SS', name: 'Social Studies', icon: 'public', maxMarks: 50, marksObtained: 48, grade: 'A1', points: 10, remarks: 'Thorough historical understanding' },
    ],
  },
  sa1_model: {
    title: 'SA-1 Diagnostic Pre-Board Evaluation',
    shortTitle: 'SA-1 Pre-Board',
    term: 'Diagnostic Model Exam 2026',
    date: 'Conducted Oct 10, 2026',
    status: 'EVALUATED · READY',
    gpa: '9.2',
    totalMarks: 462,
    maxTotal: 500,
    percentage: '92.4%',
    overallGrade: 'A1',
    conduct: 'Good',
    teacherRemarks: 'Well prepared for upcoming SA-1 Board exam. Suggested to review Social Studies geography portions.',
    subjects: [
      { code: '01T', name: 'First Language Telugu', icon: 'translate', maxMarks: 100, marksObtained: 91, grade: 'A1', points: 9, remarks: 'Good time management' },
      { code: '02M', name: 'Mathematics', icon: 'calculate', maxMarks: 100, marksObtained: 97, grade: 'A1', points: 10, remarks: 'High precision in algebra & geometry' },
      { code: '03PS', name: 'Physical Science', icon: 'science', maxMarks: 50, marksObtained: 47, grade: 'A1', points: 10, remarks: 'Thorough concept retention' },
      { code: '04BS', name: 'Biological Science', icon: 'biotech', maxMarks: 50, marksObtained: 46, grade: 'A1', points: 9, remarks: 'Good explanatory answers' },
      { code: '05SS', name: 'Social Studies', icon: 'public', maxMarks: 100, marksObtained: 89, grade: 'A2', points: 8, remarks: 'Revise chapter 3 map work' },
      { code: '06E', name: 'General English', icon: 'language', maxMarks: 100, marksObtained: 92, grade: 'A1', points: 9, remarks: 'Well-written essays and letter' },
    ],
  },
  prev_annual: {
    title: 'Class 7 Annual Board Examination',
    shortTitle: 'Class 7 Board',
    term: 'Academic Year 2025–2026',
    date: 'Archived · April 2026',
    status: 'PROMOTED TO CLASS 8',
    gpa: '9.5',
    totalMarks: 572,
    maxTotal: 600,
    percentage: '95.3%',
    overallGrade: 'A1',
    conduct: 'Exemplary',
    teacherRemarks: 'Successfully promoted to Class 8 with top academic standing across district board evaluations.',
    subjects: [
      { code: '01T', name: 'First Language Telugu', icon: 'translate', maxMarks: 100, marksObtained: 94, grade: 'A1', points: 10, remarks: 'Excellent' },
      { code: '02H', name: 'Second Language Hindi', icon: 'menu-book', maxMarks: 100, marksObtained: 92, grade: 'A1', points: 9, remarks: 'Very Good' },
      { code: '03E', name: 'General English', icon: 'language', maxMarks: 100, marksObtained: 95, grade: 'A1', points: 10, remarks: 'Outstanding' },
      { code: '04M', name: 'Mathematics', icon: 'calculate', maxMarks: 100, marksObtained: 99, grade: 'A1', points: 10, remarks: 'Top Score' },
      { code: '05GS', name: 'General Science', icon: 'science', maxMarks: 100, marksObtained: 96, grade: 'A1', points: 10, remarks: 'Distinction' },
      { code: '06SS', name: 'Social Studies', icon: 'public', maxMarks: 100, marksObtained: 96, grade: 'A1', points: 10, remarks: 'Distinction' },
    ],
  },
};

export const ExamsScreen: React.FC<Props> = ({ route, navigation }) => {
  const initial =
    route.name === 'ExamResults'
      ? 'results'
      : route.name === 'ExamSchedule'
      ? 'schedule'
      : (route.params as any)?.initialTab || 'schedule';

  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'results'>(initial);

  // Exam Schedule State
  const [selectedExamCategory, setSelectedExamCategory] = useState<ExamCategory>('all');
  const [expandedExamId, setExpandedExamId] = useState<string | null>('exam-1');

  // Exam Results State
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType>('fa2');
  const currentResult = ASSESSMENT_RESULTS[selectedAssessment];

  const filteredExams = EXAM_SCHEDULE.filter((exam) => {
    if (selectedExamCategory === 'all') return true;
    return exam.category === selectedExamCategory;
  });

  const handleDownloadTimetable = () => {
    Alert.alert(
      'Download Official Timetable',
      'AP SCERT SA-1 & Annual Timetable 2026–27 PDF has been queued for offline access.',
      [{ text: 'OK' }]
    );
  };

  const handleDownloadMemo = () => {
    Alert.alert(
      'Download Marks Memo',
      `Official Marks Memo for ${currentResult.title} has been downloaded to device storage.`,
      [{ text: 'Open PDF', style: 'default' }, { text: 'Done', style: 'cancel' }]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        activeRoute="Exams"
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Intro */}
        <PageIntro
          eyebrow="AP STATE BOARD · SCERT 2026–27"
          badge={activeSubTab === 'schedule' ? 'SA-1 Window: Nov 16–24' : 'Grade A1 · 9.6 GPA'}
          title="Exams & Marks Memo"
        />

        {/* Mode Switcher Segmented Control */}
        <View className="bg-palePeach p-1.5 rounded-2xl flex-row items-center border border-[#f2ded3]">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${
              activeSubTab === 'schedule'
                ? 'bg-white shadow-sm border border-border/60'
                : ''
            }`}
            onPress={() => setActiveSubTab('schedule')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityLabel="Exam Schedule"
          >
            <MaterialIcons
              name="event-note"
              size={18}
              color={activeSubTab === 'schedule' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              className={`font-manrope-bold text-xs ${
                activeSubTab === 'schedule' ? 'text-primaryDark' : 'text-textSecondary'
              }`}
            >
              Exam Schedule
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-xl ${
              activeSubTab === 'results'
                ? 'bg-white shadow-sm border border-border/60'
                : ''
            }`}
            onPress={() => setActiveSubTab('results')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityLabel="Marks Memo"
          >
            <MaterialIcons
              name="grade"
              size={18}
              color={activeSubTab === 'results' ? Colors.primary : Colors.textSecondary}
            />
            <Text
              className={`font-manrope-bold text-xs ${
                activeSubTab === 'results' ? 'text-primaryDark' : 'text-textSecondary'
              }`}
            >
              Marks Memo
            </Text>
          </TouchableOpacity>
        </View>

        {/* ----------------- EXAM SCHEDULE VIEW ----------------- */}
        {activeSubTab === 'schedule' && (
          <View className="gap-4">
            {/* Countdown / Next Up Hero Card */}
            <HoverCard className="bg-palePeach rounded-[22px] p-5 border border-[#f2ded3] gap-3.5 shadow-sm" lift={-3}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-primary/15 items-center justify-center">
                    <MaterialIcons name="alarm" size={18} color={Colors.primary} />
                  </View>
                  <Text className="font-manrope-extrabold text-xs text-primaryDark uppercase tracking-wider">
                    Next Examination
                  </Text>
                </View>
                <View className="bg-primary px-2.5 py-1 rounded-full">
                  <Text className="font-manrope-bold text-[10px] text-white">Starts in 25 Days</Text>
                </View>
              </View>

              <View className="gap-1">
                <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight">
                  First Language (Telugu) · SA-1
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Mon, Nov 16, 2026 · 09:30 AM – 12:15 PM · 100 Marks
                </Text>
              </View>

              <View className="pt-2 border-t border-[#f2ded3] flex-row items-center justify-between">
                <Text className="font-manrope-medium text-xs text-textMuted">
                  Venue: Registered School Exam Hall
                </Text>
                <TouchableOpacity
                  className="flex-row items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-border"
                  onPress={handleDownloadTimetable}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="download" size={14} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-primary">Hall Ticket PDF</Text>
                </TouchableOpacity>
              </View>
            </HoverCard>

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              {[
                { id: 'all', label: 'All Exams' },
                { id: 'sa1', label: 'SA-1 (Term-End)' },
                { id: 'fa', label: 'FA (Unit Tests)' },
                { id: 'sa2', label: 'SA-2 (Annual)' },
              ].map((cat) => {
                const isSelected = selectedExamCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    className={`h-9 px-4 rounded-full items-center justify-center border ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'bg-softWarm border-border'
                    }`}
                    onPress={() => setSelectedExamCategory(cat.id as ExamCategory)}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`font-manrope-bold text-xs ${
                        isSelected ? 'text-white' : 'text-textSecondary'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Exam Items List */}
            <View className="gap-3">
              {filteredExams.map((exam) => {
                const isExpanded = expandedExamId === exam.id;
                return (
                  <HoverCard
                    key={exam.id}
                    className={`bg-white rounded-[20px] p-4 border shadow-sm gap-3 ${
                      exam.isUpcoming ? 'border-primary/40 bg-surfaceSoft' : 'border-border'
                    }`}
                    lift={-3}
                    onPress={() => setExpandedExamId(isExpanded ? null : exam.id)}
                  >
                    <View className="flex-row items-start gap-3.5">
                      {/* Date Badge */}
                      <View className="w-14 h-14 rounded-2xl bg-palePeach border border-[#f2ded3] items-center justify-center">
                        <Text className="font-manrope-extrabold text-lg text-primaryDark leading-tight">
                          {exam.dateDay}
                        </Text>
                        <Text className="font-manrope-extrabold text-[10px] text-primary uppercase">
                          {exam.dateMonth}
                        </Text>
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <View className="bg-softWarm px-2 py-0.5 rounded border border-border">
                            <Text className="font-manrope-bold text-[10px] text-textMuted uppercase">
                              Code {exam.subjectCode}
                            </Text>
                          </View>
                          <Text
                            className={`font-manrope-bold text-[11px] ${
                              exam.status === 'Next Up'
                                ? 'text-primary'
                                : 'text-textSecondary'
                            }`}
                          >
                            {exam.status}
                          </Text>
                        </View>

                        <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight mt-1">
                          {exam.subjectName}
                        </Text>
                        <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                          {exam.dayOfWeek} · {exam.time}
                        </Text>
                      </View>
                    </View>

                    {/* Syllabus Overview */}
                    <View className="bg-softWarm rounded-xl p-3 border border-border/70">
                      <View className="flex-row items-center gap-1.5 mb-1">
                        <MaterialIcons name="menu-book" size={14} color={Colors.primary} />
                        <Text className="font-manrope-bold text-xs text-primaryDark">
                          Syllabus Covered
                        </Text>
                      </View>
                      <Text className="font-manrope-medium text-xs text-textSecondary leading-relaxed">
                        {isExpanded ? exam.syllabusPortion : exam.unitsSummary}
                      </Text>
                    </View>
                  </HoverCard>
                );
              })}
            </View>

            {/* Official Board Guidelines Card */}
            <View className="bg-softWarm rounded-[22px] p-5 border border-border gap-2.5">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="info" size={18} color={Colors.primary} />
                <Text className="font-manrope-extrabold text-sm text-textPrimary">
                  AP SCERT Examination Instructions
                </Text>
              </View>
              <Text className="font-manrope-medium text-xs text-textSecondary leading-relaxed">
                Students must arrive at the examination venue 15 minutes before the bell. 15 minutes of reading time is allocated prior to answering. Carry your official Hall Ticket & school ID card.
              </Text>
            </View>
          </View>
        )}

        {/* ----------------- MARKS MEMO VIEW ----------------- */}
        {activeSubTab === 'results' && (
          <View className="gap-4">
            {/* Assessment Selector Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              {[
                { id: 'fa2', label: 'FA-2 (Sep 2026)' },
                { id: 'fa1', label: 'FA-1 (Jul 2026)' },
                { id: 'sa1_model', label: 'SA-1 Model (Oct 2026)' },
                { id: 'prev_annual', label: 'Annual (Class 7)' },
              ].map((ass) => {
                const isSelected = selectedAssessment === ass.id;
                return (
                  <TouchableOpacity
                    key={ass.id}
                    className={`h-9 px-4 rounded-full items-center justify-center border ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'bg-softWarm border-border'
                    }`}
                    onPress={() => setSelectedAssessment(ass.id as AssessmentType)}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`font-manrope-bold text-xs ${
                        isSelected ? 'text-white' : 'text-textSecondary'
                      }`}
                    >
                      {ass.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Overall Scorecard Hero Card */}
            <View className="bg-palePeach rounded-[22px] p-5 border border-[#f2ded3] gap-4 shadow-sm">
              <View className="flex-row items-start justify-between gap-2.5">
                <View className="flex-1 mr-2">
                  <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight leading-snug">
                    {currentResult.title}
                  </Text>
                  <Text className="font-manrope-medium text-xs text-textSecondary mt-1">
                    {currentResult.term} · {currentResult.date}
                  </Text>
                </View>
                <View className="bg-emerald-600 px-3 py-1 rounded-full self-start shrink-0">
                  <Text className="font-manrope-bold text-[10px] text-white uppercase tracking-wider">
                    {currentResult.status.includes('PASSED')
                      ? 'PASSED'
                      : currentResult.status.includes('PROMOTED')
                      ? 'PROMOTED'
                      : 'EVALUATED'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-2 border-t border-[#f2ded3]">
                <View className="items-center flex-1 border-r border-[#f2ded3]">
                  <Text className="font-manrope-extrabold text-2xl text-primaryDark">
                    {currentResult.gpa}
                  </Text>
                  <Text className="font-manrope-medium text-[10px] text-textSecondary uppercase tracking-wider mt-0.5">
                    GPA Score
                  </Text>
                </View>

                <View className="items-center flex-1 border-r border-[#f2ded3]">
                  <Text className="font-manrope-extrabold text-2xl text-textPrimary">
                    {currentResult.totalMarks}/{currentResult.maxTotal}
                  </Text>
                  <Text className="font-manrope-medium text-[10px] text-textSecondary uppercase tracking-wider mt-0.5">
                    Total Marks
                  </Text>
                </View>

                <View className="items-center flex-1">
                  <Text className="font-manrope-extrabold text-2xl text-primary">
                    {currentResult.overallGrade}
                  </Text>
                  <Text className="font-manrope-medium text-[10px] text-textSecondary uppercase tracking-wider mt-0.5">
                    Grade ({currentResult.percentage})
                  </Text>
                </View>
              </View>
            </View>

            {/* Subject-Wise Marks Breakdown */}
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between px-1">
                <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
                  Subject-Wise Marks
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  {currentResult.subjects.length} Subjects Evaluated
                </Text>
              </View>

              {currentResult.subjects.map((sub) => (
                <View
                  key={sub.code}
                  className="bg-white rounded-[18px] p-4 border border-border shadow-sm flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1 mr-3">
                    <View className="w-10 h-10 rounded-xl bg-softWarm border border-border items-center justify-center">
                      <MaterialIcons name={sub.icon} size={20} color={Colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-manrope-extrabold text-sm text-textPrimary" numberOfLines={1}>
                        {sub.name}
                      </Text>
                      <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                        Code: {sub.code} · {sub.remarks}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end shrink-0">
                    <View className="flex-row items-baseline gap-1">
                      <Text className="font-manrope-extrabold text-base text-primaryDark">
                        {sub.marksObtained}
                      </Text>
                      <Text className="font-manrope-medium text-xs text-textMuted">
                        /{sub.maxMarks}
                      </Text>
                    </View>
                    <View className="bg-palePeach px-2 py-0.5 rounded mt-0.5">
                      <Text className="font-manrope-bold text-[10px] text-primary">
                        Grade {sub.grade} ({sub.points} Pts)
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Teacher Remarks & Conduct */}
            <View className="bg-softWarm rounded-[22px] p-5 border border-border gap-2.5">
              <View className="flex-row items-center justify-between">
                <Text className="font-manrope-extrabold text-sm text-textPrimary">
                  Class Teacher Remarks
                </Text>
                <View className="bg-success/15 px-2.5 py-0.5 rounded-full">
                  <Text className="font-manrope-bold text-[10px] text-success">
                    Conduct: {currentResult.conduct}
                  </Text>
                </View>
              </View>
              <Text className="font-manrope-medium text-xs text-textSecondary leading-relaxed italic">
                "{currentResult.teacherRemarks}"
              </Text>
            </View>

            {/* Download Official PDF Action */}
            <TouchableOpacity
              className="bg-primary rounded-2xl py-3.5 flex-row items-center justify-center gap-2 shadow-sm"
              onPress={handleDownloadMemo}
              activeOpacity={0.85}
            >
              <MaterialIcons name="download" size={18} color={Colors.white} />
              <Text className="font-manrope-bold text-sm text-white">
                Download Official Marks Memo PDF
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab="Exams" navigation={navigation} />
    </View>
  );
};
