export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          current_level: number
          total_xp: number
          current_streak: number
          longest_streak: number
          total_coding_minutes: number
          preferred_learning_style: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          current_level?: number
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          total_coding_minutes?: number
          preferred_learning_style?: string | null
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          current_level?: number
          total_xp?: number
          current_streak?: number
          longest_streak?: number
          total_coding_minutes?: number
          preferred_learning_style?: string | null
        }
      }
      missions: {
        Row: {
          id: number
          title: string
          phase: string
          difficulty: number
          estimated_minutes: number
          xp: number
          goal: string
          learning_objectives: Json
          prerequisites: number[]
          project_feature: string
          official_sources: string[]
          required_quiz_score: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          phase: string
          difficulty: number
          estimated_minutes: number
          xp: number
          goal: string
          learning_objectives: Json
          prerequisites: number[]
          project_feature: string
          official_sources: string[]
          required_quiz_score?: number
          order_index: number
        }
        Update: {
          title?: string
          phase?: string
          difficulty?: number
          estimated_minutes?: number
          xp?: number
          goal?: string
          learning_objectives?: Json
          prerequisites?: number[]
          project_feature?: string
          official_sources?: string[]
          required_quiz_score?: number
          order_index?: number
        }
      }
      mission_progress: {
        Row: {
          id: string
          user_id: string
          mission_id: number
          status: MissionStatus
          lesson_viewed: boolean
          examples_executed: boolean
          challenge_passed: boolean
          code_review_completed: boolean
          quiz_passed: boolean
          quiz_score: number | null
          project_updated: boolean
          summary_generated: boolean
          started_at: string | null
          completed_at: string | null
          attempts: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: number
          status?: MissionStatus
          lesson_viewed?: boolean
          examples_executed?: boolean
          challenge_passed?: boolean
          code_review_completed?: boolean
          quiz_passed?: boolean
          quiz_score?: number | null
          project_updated?: boolean
          summary_generated?: boolean
          started_at?: string | null
          completed_at?: string | null
          attempts?: number
        }
        Update: {
          status?: MissionStatus
          lesson_viewed?: boolean
          examples_executed?: boolean
          challenge_passed?: boolean
          code_review_completed?: boolean
          quiz_passed?: boolean
          quiz_score?: number | null
          project_updated?: boolean
          summary_generated?: boolean
          started_at?: string | null
          completed_at?: string | null
          attempts?: number
        }
      }
      generated_lessons: {
        Row: {
          id: string
          user_id: string
          mission_id: number
          content: string
          python_version: string
          library_versions: Json
          documentation_version: string
          prompt_version: string
          source_urls: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: number
          content: string
          python_version: string
          library_versions?: Json
          documentation_version: string
          prompt_version: string
          source_urls?: string[]
        }
        Update: {
          content?: string
          python_version?: string
          library_versions?: Json
          documentation_version?: string
          prompt_version?: string
          source_urls?: string[]
        }
      }
      quizzes: {
        Row: {
          id: string
          mission_id: number
          questions: Json
          generated_at: string
        }
        Insert: {
          id?: string
          mission_id: number
          questions: Json
        }
        Update: {
          questions?: Json
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          mission_id: number
          score: number
          answers: Json
          passed: boolean
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          mission_id: number
          score: number
          answers: Json
          passed: boolean
        }
        Update: {
          score?: number
          answers?: Json
          passed?: boolean
        }
      }
      code_reviews: {
        Row: {
          id: string
          user_id: string
          mission_id: number
          code: string
          challenge_id: string
          feedback: string
          score: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: number
          code: string
          challenge_id: string
          feedback: string
          score: number
        }
        Update: {
          feedback?: string
          score?: number
        }
      }
      challenge_attempts: {
        Row: {
          id: string
          user_id: string
          mission_id: number
          challenge_id: string
          code: string
          passed: boolean
          hints_used: number
          attempted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: number
          challenge_id: string
          code: string
          passed?: boolean
          hints_used?: number
        }
        Update: {
          code?: string
          passed?: boolean
          hints_used?: number
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_key: string
          name: string
          description: string
          unlocked_at: string | null
          progress: number
          criteria: Json
        }
        Insert: {
          id?: string
          user_id: string
          badge_key: string
          name: string
          description: string
          unlocked_at?: string | null
          progress?: number
          criteria: Json
        }
        Update: {
          unlocked_at?: string | null
          progress?: number
        }
      }
      xp_history: {
        Row: {
          id: string
          user_id: string
          amount: number
          source: string
          mission_id: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          source: string
          mission_id?: number | null
        }
        Update: {
          amount?: number
          source?: string
        }
      }
      resume_skills: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          level: string
          progress: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          level: string
          progress: number
        }
        Update: {
          level?: string
          progress?: number
        }
      }
      project_versions: {
        Row: {
          id: string
          user_id: string
          version: string
          feature: string
          mission_id: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          version: string
          feature: string
          mission_id: number
        }
        Update: {
          version?: string
          feature?: string
        }
      }
      knowledge_cache: {
        Row: {
          id: string
          topic: string
          source_url: string
          content: string
          python_version: string
          library_version: string | null
          fetched_at: string
        }
        Insert: {
          id?: string
          topic: string
          source_url: string
          content: string
          python_version: string
          library_version?: string | null
        }
        Update: {
          content?: string
          python_version?: string
          library_version?: string | null
        }
      }
      prompt_versions: {
        Row: {
          id: string
          prompt_key: string
          version: number
          content: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          prompt_key: string
          version: number
          content: string
          active?: boolean
        }
        Update: {
          version?: number
          content?: string
          active?: boolean
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      mission_status:
        | "LOCKED"
        | "AVAILABLE"
        | "IN_PROGRESS"
        | "CODE_REVIEW"
        | "QUIZ"
        | "PROJECT"
        | "COMPLETED"
    }
  }
}

export type MissionStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "CODE_REVIEW"
  | "QUIZ"
  | "PROJECT"
  | "COMPLETED"
