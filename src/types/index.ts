import { MissionStatus } from "./database"

// Mission definition as stored in the curriculum
export interface MissionDefinition {
  id: number
  title: string
  phase: string
  difficulty: 1 | 2 | 3 | 4 | 5
  estimatedMinutes: number
  xp: number
  goal: string
  learningObjectives: string[]
  prerequisites: number[]
  projectFeature: string
  officialSources: string[]
  requiredQuizScore: number
  orderIndex: number
}

// User profile
export interface UserProfile {
  id: string
  displayName: string | null
  avatarUrl: string | null
  currentLevel: number
  totalXp: number
  currentStreak: number
  longestStreak: number
  totalCodingMinutes: number
  preferredLearningStyle: string | null
  createdAt: string
  updatedAt: string
}

// Mission progress for a user
export interface MissionProgress {
  id: string
  userId: string
  missionId: number
  status: MissionStatus
  lessonViewed: boolean
  examplesExecuted: boolean
  challengePassed: boolean
  codeReviewCompleted: boolean
  quizPassed: boolean
  quizScore: number | null
  projectUpdated: boolean
  summaryGenerated: boolean
  startedAt: string | null
  completedAt: string | null
  attempts: number
}

// Dashboard data
export interface DashboardData {
  profile: UserProfile
  currentMission: MissionProgress & { mission: MissionDefinition } | null
  nextMission: MissionDefinition | null
  overallProgress: {
    completed: number
    total: number
    percentage: number
  }
  projectVersion: string
  completedFeatures: string[]
  upcomingFeatures: string[]
  resumeSkills: ResumeSkill[]
  recentBadges: UserBadge[]
  nextBadge: UserBadge | null
  dailyGoal: DailyGoal
  recentActivity: RecentActivity[]
  streak: number
}

// Resume skill
export interface ResumeSkill {
  skillName: string
  level: string
  progress: number // 0-100
}

// Badge
export interface BadgeDefinition {
  key: string
  name: string
  description: string
  criteria: Record<string, unknown>
}

export interface UserBadge {
  badgeKey: string
  name: string
  description: string
  unlockedAt: string | null
  progress: number // 0-100
}

// Daily goal
export interface DailyGoal {
  description: string
  estimatedMinutes: number
  xpReward: number
  badgeProgress?: {
    name: string
    progress: number
  }
}

// Recent activity
export interface RecentActivity {
  type: "mission_completed" | "quiz_passed" | "badge_earned" | "project_updated" | "challenge_solved"
  description: string
  timestamp: string
}

// Generated lesson
export interface GeneratedLesson {
  id: string
  userId: string
  missionId: number
  content: string // Markdown
  pythonVersion: string
  libraryVersions: Record<string, string>
  documentationVersion: string
  promptVersion: string
  sourceUrls: string[]
  createdAt: string
}

// Quiz
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Quiz {
  id: string
  missionId: number
  questions: QuizQuestion[]
  generatedAt: string
}

// Code review
export interface CodeReview {
  id: string
  userId: string
  missionId: number
  code: string
  challengeId: string
  feedback: string
  score: number // 0-100
  createdAt: string
}

// AI Mentor message
export interface AIMentorMessage {
  role: "user" | "assistant"
  content: string
}

// Phase definition
export interface PhaseDefinition {
  name: string
  description: string
  missions: number[]
}
