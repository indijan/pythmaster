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
import { getServerLanguage } from "@/lib/i18n/server"
import { getLocalizedMission, getLocalizedPhase } from "@/lib/curriculum"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const data = await getDashboardData()
  const lang = await getServerLanguage()
  const currentMission = data.currentMission ? getLocalizedMission(data.currentMission.mission, lang) : null
  const currentPhase = data.currentMission ? getLocalizedPhase(data.currentMission.mission.phase, lang).name : "Python Foundations"

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        <WelcomeCard
          displayName={data.profile.displayName || "Learner"}
        currentMissionTitle={currentMission?.title || null}
          missionId={data.currentMission?.missionId || null}
          lang={lang}
        />

      <div className="grid md:grid-cols-3 gap-4">
        <ProgressCard
          completedMissions={data.overallProgress.completed}
          totalMissions={data.overallProgress.total}
          percentage={data.overallProgress.percentage}
          currentPhase={currentPhase}
          lang={lang}
        />
        <div className="md:col-span-2">
          <CurrentMissionCard
            missionId={data.currentMission?.missionId || 1}
            title={currentMission?.title || "Start Learning"}
            estimatedMinutes={data.currentMission?.mission.estimatedMinutes || 25}
            difficulty={data.currentMission?.mission.difficulty || 1}
            status={data.currentMission?.status || "AVAILABLE"}
            lang={lang}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <DailyGoalCard {...data.dailyGoal} lang={lang} />
        <ProjectCard
          version={data.projectVersion}
          completedFeatures={data.completedFeatures}
          upcomingFeatures={data.upcomingFeatures}
          lang={lang}
        />
      </div>

      <LearningStatsCard
        currentStreak={data.streak}
        totalXp={data.profile.totalXp}
        currentLevel={data.profile.currentLevel}
        totalCodingMinutes={data.profile.totalCodingMinutes}
        quizAverage={0}
        lang={lang}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <AchievementsCard unlockedBadges={data.recentBadges} nextBadge={data.nextBadge} lang={lang} />
        <ResumeReadinessCard skills={data.resumeSkills} lang={lang} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <RecentActivityCard activities={data.recentActivity} lang={lang} />
        <AIMentorCard recommendation={lang === "hu" ? "A Python utazásod itt kezdődik. Készen állsz az első küldetésre?" : "Your Python journey starts here! Ready for your first mission?"} lang={lang} />
      </div>

      <Separator className="my-8" />
      <footer className="text-center text-sm text-muted-foreground pb-8">
        {lang === "hu"
          ? "Pythmaster — Tanulj Python és Data Engineering témákat valódi szoftver építésén keresztül."
          : "Pythmaster — Learn Python &amp; Data Engineering by building real software."}
      </footer>
    </div>
  )
}
