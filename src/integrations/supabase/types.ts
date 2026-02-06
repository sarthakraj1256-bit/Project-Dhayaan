export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      breath_flow_sessions: {
        Row: {
          breath_consistency_score: number
          chakra_fragments_earned: number
          completed_at: string
          created_at: string
          duration_seconds: number
          id: string
          karma_earned: number
          max_distance_reached: number
          user_id: string
        }
        Insert: {
          breath_consistency_score?: number
          chakra_fragments_earned?: number
          completed_at?: string
          created_at?: string
          duration_seconds: number
          id?: string
          karma_earned?: number
          max_distance_reached?: number
          user_id: string
        }
        Update: {
          breath_consistency_score?: number
          chakra_fragments_earned?: number
          completed_at?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          karma_earned?: number
          max_distance_reached?: number
          user_id?: string
        }
        Relationships: []
      }
      garden_stats: {
        Row: {
          achievements_unlocked: number
          avatar_url: string | null
          created_at: string
          display_name: string | null
          flourishing_plants: number
          garden_level: number
          id: string
          last_active_at: string
          total_karma_earned: number
          total_plants: number
          total_water_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_unlocked?: number
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          flourishing_plants?: number
          garden_level?: number
          id?: string
          last_active_at?: string
          total_karma_earned?: number
          total_plants?: number
          total_water_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_unlocked?: number
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          flourishing_plants?: number
          garden_level?: number
          id?: string
          last_active_at?: string
          total_karma_earned?: number
          total_plants?: number
          total_water_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mantra_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_syllables: number[]
          created_at: string
          id: string
          last_practiced_at: string
          mantra_id: string
          total_repetitions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_syllables?: number[]
          created_at?: string
          id?: string
          last_practiced_at?: string
          mantra_id: string
          total_repetitions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_syllables?: number[]
          created_at?: string
          id?: string
          last_practiced_at?: string
          mantra_id?: string
          total_repetitions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meditation_goals: {
        Row: {
          created_at: string
          goal_type: string
          id: string
          target_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_type: string
          id?: string
          target_minutes: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_type?: string
          id?: string
          target_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meditation_sessions: {
        Row: {
          atmosphere_id: string
          created_at: string
          duration_seconds: number
          ended_at: string
          frequency_category: string
          frequency_name: string
          frequency_value: number
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          atmosphere_id?: string
          created_at?: string
          duration_seconds: number
          ended_at?: string
          frequency_category: string
          frequency_name: string
          frequency_value: number
          id?: string
          started_at: string
          user_id: string
        }
        Update: {
          atmosphere_id?: string
          created_at?: string
          duration_seconds?: number
          ended_at?: string
          frequency_category?: string
          frequency_name?: string
          frequency_value?: number
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_favorites: {
        Row: {
          atmosphere_id: string
          created_at: string
          frequency_category: string
          frequency_name: string
          frequency_value: number
          id: string
          name: string | null
          user_id: string
        }
        Insert: {
          atmosphere_id?: string
          created_at?: string
          frequency_category: string
          frequency_name: string
          frequency_value: number
          id?: string
          name?: string | null
          user_id: string
        }
        Update: {
          atmosphere_id?: string
          created_at?: string
          frequency_category?: string
          frequency_name?: string
          frequency_value?: number
          id?: string
          name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_gardens: {
        Row: {
          created_at: string
          flourishing_count: number | null
          garden_level: number | null
          id: string
          plant_count: number | null
          screenshot_url: string
          share_message: string | null
          total_karma_earned: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          flourishing_count?: number | null
          garden_level?: number | null
          id?: string
          plant_count?: number | null
          screenshot_url: string
          share_message?: string | null
          total_karma_earned?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          flourishing_count?: number | null
          garden_level?: number | null
          id?: string
          plant_count?: number | null
          screenshot_url?: string
          share_message?: string | null
          total_karma_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      story_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "temple_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      stress_metrics: {
        Row: {
          created_at: string
          final_stress: number
          id: string
          initial_stress: number
          intent_tag: string | null
          name: string | null
          rating: number | null
          stress_reduction: number | null
        }
        Insert: {
          created_at?: string
          final_stress: number
          id?: string
          initial_stress: number
          intent_tag?: string | null
          name?: string | null
          rating?: number | null
          stress_reduction?: number | null
        }
        Update: {
          created_at?: string
          final_stress?: number
          id?: string
          initial_stress?: number
          intent_tag?: string | null
          name?: string | null
          rating?: number | null
          stress_reduction?: number | null
        }
        Relationships: []
      }
      temple_favorites: {
        Row: {
          created_at: string
          id: string
          notifications_enabled: boolean
          temple_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          temple_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notifications_enabled?: boolean
          temple_id?: string
          user_id?: string
        }
        Relationships: []
      }
      temple_stories: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          photos: string[] | null
          rating: number | null
          story: string
          temple_id: string
          updated_at: string
          user_id: string
          visit_date: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          photos?: string[] | null
          rating?: number | null
          story: string
          temple_id: string
          updated_at?: string
          user_id: string
          visit_date?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          photos?: string[] | null
          rating?: number | null
          story?: string
          temple_id?: string
          updated_at?: string
          user_id?: string
          visit_date?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_spiritual_progress: {
        Row: {
          created_at: string
          current_level: string
          current_streak: number
          id: string
          karma_points: number
          last_activity_date: string | null
          longest_streak: number
          total_chanting_sessions: number
          total_games_played: number
          total_mantra_lessons: number
          total_meditation_minutes: number
          unlocked_chakras: string[] | null
          unlocked_environments: string[] | null
          unlocked_wallpapers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: string
          current_streak?: number
          id?: string
          karma_points?: number
          last_activity_date?: string | null
          longest_streak?: number
          total_chanting_sessions?: number
          total_games_played?: number
          total_mantra_lessons?: number
          total_meditation_minutes?: number
          unlocked_chakras?: string[] | null
          unlocked_environments?: string[] | null
          unlocked_wallpapers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: string
          current_streak?: number
          id?: string
          karma_points?: number
          last_activity_date?: string | null
          longest_streak?: number
          total_chanting_sessions?: number
          total_games_played?: number
          total_mantra_lessons?: number
          total_meditation_minutes?: number
          unlocked_chakras?: string[] | null
          unlocked_environments?: string[] | null
          unlocked_wallpapers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_garden_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          achievements_unlocked: number
          avatar_url: string
          display_name: string
          flourishing_plants: number
          garden_level: number
          id: string
          last_active_at: string
          total_karma_earned: number
          total_plants: number
          total_water_used: number
        }[]
      }
      get_stress_statistics: {
        Args: never
        Returns: {
          average_stress_reduction: number
          intent_breakdown: Json
          total_participants: number
        }[]
      }
      get_temple_stories_public: {
        Args: { limit_count?: number; temple_filter?: string }
        Returns: {
          author_avatar: string
          author_name: string
          created_at: string
          id: string
          photos: string[]
          rating: number
          story: string
          temple_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
