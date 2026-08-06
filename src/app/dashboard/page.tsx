import { WelcomeCard } from "@/components/dashboard/welcome-card"
import { ProgressCard } from "@/components/dashboard/progress-card"
import { CurrentMissionCard } from "@/components/dashboard/current-mission-card"
import { DailyGoalCard } from "@/components/dashboard/daily-goal-card"
import { ProjectCard } from "@/components/dashboard/project-card"
import { LearningStatsCard } from "@/components/dashboard/learning-stats-card"
import { AchievementsCard } from "@/components/dashboard/achievements-card"
import { ResumeReadinessCard } from "@/components/dashboard/resume-readiness-card"
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card"
import { AIMentorCard } from "@/components/dashboard/ai-mentor-card"
import { Separator } from "@/components/ui/separator"
import type { DashboardData, UserBadge, RecentActivity, ResumeSkill } from "@/types"

// Mock data — will be replaced by Nhost GraphQL queries and AI generation
const mockDashboard: DashboardData = {
  profile: {
    id: "user-1",
    displayName: "Istvan",
    avatarUrl: null,
    currentLevel: 3,
    totalXp: 740,
    currentStreak: 5,
    longestStreak: 12,
    totalCodingMinutes: 1080,
    preferredLearningStyle: "visual",
    createdAt: "2025-01-15T00:00:00Z",
    updatedAt: "2025-08-01T00:00:00Z",
  },
  currentMission: {
    id: "mp-7",
    userId: "user-1",
    missionId: 7,
    status: "IN_PROGRESS",
    lessonViewed: true,
    examplesExecuted: false,
    challengePassed: false,
    codeReviewCompleted: false,
    quizPassed: false,
    quizScore: null,
    projectUpdated: false,
    summaryGenerated: false,
    startedAt: "2025-08-05T10:00:00Z",
    completedAt: null,
    attempts: 1,
    mission: {
      id: 7,
      title: "Functions",
      phase: "Python Core",
      difficulty: 2,
      estimatedMinutes: 35,
      xp: 150,
      goal: "Understand reusable code.",
      learningObjectives: [
        "Create functions",
        "Pass arguments",
        "Return values",
        "Avoid duplicated code",
      ],
      prerequisites: [1, 2, 3, 4, 5, 6],
      projectFeature: "Move spread calculation into reusable functions.",
      officialSources: ["python.org/tutorial/functions"],
      requiredQuizScore: 80,
      orderIndex: 7,
    },
  },
  nextMission: {
    id: 8,
    title: "Lists & Tuples",
    phase: "Python Core",
    difficulty: 2,
    estimatedMinutes: 30,
    xp: 130,
    goal: "Work with ordered collections of data.",
    learningObjectives: ["Create lists", "Index and slice", "Use tuples", "List methods"],
    prerequisites: [7],
    projectFeature: "Store historical exchange rates in lists.",
    officialSources: ["python.org/tutorial/datastructures"],
    requiredQuizScore: 80,
    orderIndex: 8,
  },
  overallProgress: {
    completed: 7,
    total: 38,
    percentage: 18,
  },
  projectVersion: "v0.0.7",
  completedFeatures: ["Variables", "User Input", "Decision Engine"],
  upcomingFeatures: ["CSV Import", "REST API", "Pandas Analysis"],
  resumeSkills: [
    { skillName: "Python", level: "Intermediate", progress: 75 },
    { skillName: "Pandas", level: "Beginner", progress: 20 },
    { skillName: "SQL", level: "Intermediate", progress: 60 },
    { skillName: "Docker", level: "Beginner", progress: 40 },
    { skillName: "FastAPI", level: "Not started", progress: 0 },
  ],
  recentBadges: [
    {
      badgeKey: "python-rookie",
      name: "Python Rookie",
      description: "Completed your first Python mission",
      unlockedAt: "2025-07-20T00:00:00Z",
      progress: 100,
    },
    {
      badgeKey: "logic-builder",
      name: "Logic Builder",
      description: "Mastered conditional logic",
      unlockedAt: "2025-07-28T00:00:00Z",
      progress: 100,
    },
    {
      badgeKey: "variables-master",
      name: "Variables Master",
      description: "Complete understanding of variables and types",
      unlockedAt: "2025-07-25T00:00:00Z",
      progress: 100,
    },
  ] as UserBadge[],
  nextBadge: {
    badgeKey: "loop-explorer",
    name: "Loop Explorer",
    description: "Master all loop types in Python",
    unlockedAt: null,
    progress: 82,
  },
  dailyGoal: {
    description: "Finish Mission 7: Functions — learn to write reusable code",
    estimatedMinutes: 25,
    xpReward: 100,
    badgeProgress: { name: "Logic Builder", progress: 82 },
  },
  recentActivity: [
    {
      type: "mission_completed",
      description: "Completed Mission 6: Loops",
      timestamp: "2025-08-04T16:30:00Z",
    },
    {
      type: "quiz_passed",
      description: "Scored 92% on Mission 6 quiz",
      timestamp: "2025-08-04T16:45:00Z",
    },
    {
      type: "badge_earned",
      description: "Earned 'Loop Master' badge",
      timestamp: "2025-08-04T16:50:00Z",
    },
    {
      type: "project_updated",
      description: "Project updated to v0.0.6 — Loop-based analysis",
      timestamp: "2025-08-04T17:00:00Z",
    },
    {
      type: "challenge_solved",
      description: "Solved bonus challenge: Nested loop pattern",
      timestamp: "2025-08-05T09:15:00Z",
    },
  ] as RecentActivity[],
  streak: 5,
}

export default function DashboardPage() {
  const data = mockDashboard

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Welcome + Continue */}
      <WelcomeCard
        displayName={data.profile.displayName || "Learner"}
        currentMissionTitle={
          data.currentMission?.mission.title || null
        }
        missionId={data.currentMission?.missionId || null}
      />

      {/* Grid: Progress + Current Mission */}
      <div className="grid md:grid-cols-3 gap-4">
        <ProgressCard
          completedMissions={data.overallProgress.completed}
          totalMissions={data.overallProgress.total}
          percentage={data.overallProgress.percentage}
          currentPhase={
            data.currentMission?.mission.phase || "Python Core"
          }
        />
        <div className="md:col-span-2">
          <CurrentMissionCard
            missionId={data.currentMission?.missionId || 1}
            title={data.currentMission?.mission.title || "Start Learning"}
            estimatedMinutes={
              data.currentMission?.mission.estimatedMinutes || 25
            }
            difficulty={data.currentMission?.mission.difficulty || 1}
            status={data.currentMission?.status || "AVAILABLE"}
          />
        </div>
      </div>

      {/* Daily Goal + Project */}
      <div className="grid md:grid-cols-2 gap-4">
        <DailyGoalCard {...data.dailyGoal} />
        <ProjectCard
          version={data.projectVersion}
          completedFeatures={data.completedFeatures}
          upcomingFeatures={data.upcomingFeatures}
        />
      </div>

      {/* Learning Statistics */}
      <LearningStatsCard
        currentStreak={data.profile.currentStreak}
        totalXp={data.profile.totalXp}
        currentLevel={data.profile.currentLevel}
        totalCodingMinutes={data.profile.totalCodingMinutes}
        quizAverage={91}
      />

      {/* Achievements + Resume Readiness */}
      <div className="grid md:grid-cols-2 gap-4">
        <AchievementsCard
          unlockedBadges={data.recentBadges}
          nextBadge={data.nextBadge}
        />
        <ResumeReadinessCard skills={data.resumeSkills} />
      </div>

      {/* Recent Activity + AI Mentor */}
      <div className="grid md:grid-cols-2 gap-4">
        <RecentActivityCard activities={data.recentActivity} />
        <AIMentorCard
          recommendation="I noticed your last quiz mistakes were mostly around loops. Would you like a 5-minute refresher before continuing with functions?"
        />
      </div>

      <Separator className="my-8" />

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground pb-8">
        <p>Pythmaster — Learn Python &amp; Data Engineering by building real software.</p>
      </footer>
    </div>
  )
}
