import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getDashboardData } from "@/lib/dashboard-data"
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

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const data = await getDashboardData()

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
      <WelcomeCard
        displayName={data.profile.displayName || "Learner"}
        currentMissionTitle={data.currentMission?.mission.title || null}
        missionId={data.currentMission?.missionId || null}
      />

      <div className="grid md:grid-cols-3 gap-4">
        <ProgressCard
          completedMissions={data.overallProgress.completed}
          totalMissions={data.overallProgress.total}
          percentage={data.overallProgress.percentage}
          currentPhase={data.currentMission?.mission.phase || "Python Foundations"}
        />
        <div className="md:col-span-2">
          <CurrentMissionCard
            missionId={data.currentMission?.missionId || 1}
            title={data.currentMission?.mission.title || "Start Learning"}
            estimatedMinutes={data.currentMission?.mission.estimatedMinutes || 25}
            difficulty={data.currentMission?.mission.difficulty || 1}
            status={data.currentMission?.status || "AVAILABLE"}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <DailyGoalCard {...data.dailyGoal} />
        <ProjectCard
          version={data.projectVersion}
          completedFeatures={data.completedFeatures}
          upcomingFeatures={data.upcomingFeatures}
        />
      </div>

      <LearningStatsCard
        currentStreak={data.streak}
        totalXp={data.profile.totalXp}
        currentLevel={data.profile.currentLevel}
        totalCodingMinutes={data.profile.totalCodingMinutes}
        quizAverage={0}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <AchievementsCard unlockedBadges={data.recentBadges} nextBadge={data.nextBadge} />
        <ResumeReadinessCard skills={data.resumeSkills} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RecentActivityCard activities={data.recentActivity} />
        <AIMentorCard recommendation="Your Python journey starts here! Ready for your first mission?" />
      </div>

      <Separator className="my-8" />
      <footer className="text-center text-sm text-muted-foreground pb-8">
        Pythmaster — Learn Python &amp; Data Engineering by building real software.
      </footer>
    </div>
  )
}
