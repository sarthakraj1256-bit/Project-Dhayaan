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
          exhale_seconds: number
          hold_seconds: number
          id: string
          inhale_seconds: number
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
          exhale_seconds?: number
          hold_seconds?: number
          id?: string
          inhale_seconds?: number
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
          exhale_seconds?: number
          hold_seconds?: number
          id?: string
          inhale_seconds?: number
          karma_earned?: number
          max_distance_reached?: number
          user_id?: string
        }
        Relationships: []
      }
      breathing_preferences: {
        Row: {
          auto_balance: boolean
          created_at: string
          exhale_seconds: number
          hold_seconds: number
          id: string
          inhale_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_balance?: boolean
          created_at?: string
          exhale_seconds?: number
          hold_seconds?: number
          id?: string
          inhale_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_balance?: boolean
          created_at?: string
          exhale_seconds?: number
          hold_seconds?: number
          id?: string
          inhale_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      darshan_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          temple_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          temple_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          temple_id?: string
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
      jap_entries: {
        Row: {
          chant_count: number
          created_at: string
          id: string
          mantra_name: string
          user_id: string
        }
        Insert: {
          chant_count?: number
          created_at?: string
          id?: string
          mantra_name: string
          user_id: string
        }
        Update: {
          chant_count?: number
          created_at?: string
          id?: string
          mantra_name?: string
          user_id?: string
        }
        Relationships: []
      }
      jap_goals: {
        Row: {
          created_at: string
          current_count: number
          deadline: string | null
          dedication: string | null
          id: string
          mantra_name: string
          status: string
          target_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_count?: number
          deadline?: string | null
          dedication?: string | null
          id?: string
          mantra_name: string
          status?: string
          target_count: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_count?: number
          deadline?: string | null
          dedication?: string | null
          id?: string
          mantra_name?: string
          status?: string
          target_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jap_proofs: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          performer_id: string
          proof_type: string
          proof_url: string
          request_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          performer_id: string
          proof_type?: string
          proof_url: string
          request_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          performer_id?: string
          proof_type?: string
          proof_url?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jap_proofs_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "jap_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      jap_requests: {
        Row: {
          auto_complete_at: string | null
          completed_count: number
          created_at: string
          deadline: string | null
          dedicated_to: string | null
          escrow_amount: number | null
          escrow_status: string | null
          feedback: string | null
          id: string
          karma_reward: number
          mantra_name: string
          performer_id: string | null
          performer_terms_accepted_at: string | null
          rating: number | null
          requester_id: string
          requester_terms_accepted_at: string | null
          required_count: number
          sankalpa_receipt: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          auto_complete_at?: string | null
          completed_count?: number
          created_at?: string
          deadline?: string | null
          dedicated_to?: string | null
          escrow_amount?: number | null
          escrow_status?: string | null
          feedback?: string | null
          id?: string
          karma_reward?: number
          mantra_name: string
          performer_id?: string | null
          performer_terms_accepted_at?: string | null
          rating?: number | null
          requester_id: string
          requester_terms_accepted_at?: string | null
          required_count: number
          sankalpa_receipt?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          auto_complete_at?: string | null
          completed_count?: number
          created_at?: string
          deadline?: string | null
          dedicated_to?: string | null
          escrow_amount?: number | null
          escrow_status?: string | null
          feedback?: string | null
          id?: string
          karma_reward?: number
          mantra_name?: string
          performer_id?: string | null
          performer_terms_accepted_at?: string | null
          rating?: number | null
          requester_id?: string
          requester_terms_accepted_at?: string | null
          required_count?: number
          sankalpa_receipt?: Json | null
          status?: string
          updated_at?: string
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
      products: {
        Row: {
          category: string
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          stock_count: number | null
          stock_limited: boolean
          total_revenue: number
          total_sales: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          stock_count?: number | null
          stock_limited?: boolean
          total_revenue?: number
          total_sales?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          stock_count?: number | null
          stock_limited?: boolean
          total_revenue?: number
          total_sales?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_logs: {
        Row: {
          created_at: string
          gross_revenue: number
          id: string
          infrastructure_cost: number
          log_date: string
          marketing_cost: number
          net_revenue: number
          new_subscribers: number
          transaction_count: number
        }
        Insert: {
          created_at?: string
          gross_revenue?: number
          id?: string
          infrastructure_cost?: number
          log_date?: string
          marketing_cost?: number
          net_revenue?: number
          new_subscribers?: number
          transaction_count?: number
        }
        Update: {
          created_at?: string
          gross_revenue?: number
          id?: string
          infrastructure_cost?: number
          log_date?: string
          marketing_cost?: number
          net_revenue?: number
          new_subscribers?: number
          transaction_count?: number
        }
        Relationships: []
      }
      saved_krishna_guidance: {
        Row: {
          closing: string | null
          created_at: string
          greeting: string | null
          guidance: string
          id: string
          question: string
          user_id: string
          verse_chapter: number | null
          verse_meaning: string | null
          verse_number: number | null
          verse_sanskrit: string | null
          verse_translation: string | null
        }
        Insert: {
          closing?: string | null
          created_at?: string
          greeting?: string | null
          guidance: string
          id?: string
          question: string
          user_id: string
          verse_chapter?: number | null
          verse_meaning?: string | null
          verse_number?: number | null
          verse_sanskrit?: string | null
          verse_translation?: string | null
        }
        Update: {
          closing?: string | null
          created_at?: string
          greeting?: string | null
          guidance?: string
          id?: string
          question?: string
          user_id?: string
          verse_chapter?: number | null
          verse_meaning?: string | null
          verse_number?: number | null
          verse_sanskrit?: string | null
          verse_translation?: string | null
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
      shorts_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          short_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          short_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          short_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shorts_comments_short_id_fkey"
            columns: ["short_id"]
            isOneToOne: false
            referencedRelation: "shorts_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      shorts_likes: {
        Row: {
          created_at: string
          id: string
          short_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          short_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          short_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shorts_likes_short_id_fkey"
            columns: ["short_id"]
            isOneToOne: false
            referencedRelation: "shorts_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      shorts_metadata: {
        Row: {
          caption: string | null
          created_at: string
          creator_id: string
          id: string
          is_flagged: boolean
          likes_count: number
          tags: string[] | null
          video_url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          creator_id: string
          id?: string
          is_flagged?: boolean
          likes_count?: number
          tags?: string[] | null
          video_url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          is_flagged?: boolean
          likes_count?: number
          tags?: string[] | null
          video_url?: string
        }
        Relationships: []
      }
      shorts_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          short_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          short_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          short_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shorts_reports_short_id_fkey"
            columns: ["short_id"]
            isOneToOne: false
            referencedRelation: "shorts_metadata"
            referencedColumns: ["id"]
          },
        ]
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
      temple_jap_reports: {
        Row: {
          acknowledged_at: string | null
          blessing_message: string | null
          chant_count: number
          created_at: string
          deadline: string | null
          dedication: string | null
          id: string
          mantra_name: string
          notes: string | null
          reference_id: string
          status: string
          temple_id: string
          temple_name: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          blessing_message?: string | null
          chant_count?: number
          created_at?: string
          deadline?: string | null
          dedication?: string | null
          id?: string
          mantra_name: string
          notes?: string | null
          reference_id?: string
          status?: string
          temple_id: string
          temple_name: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          blessing_message?: string | null
          chant_count?: number
          created_at?: string
          deadline?: string | null
          dedication?: string | null
          id?: string
          mantra_name?: string
          notes?: string | null
          reference_id?: string
          status?: string
          temple_id?: string
          temple_name?: string
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
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          notes: string | null
          payment_method: string | null
          product_id: string | null
          product_name: string
          status: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string | null
          product_name: string
          status?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          product_id?: string | null
          product_name?: string
          status?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      admin_get_all_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          karma_points: number
          last_activity_date: string
          user_id: string
        }[]
      }
      admin_get_daily_revenue: {
        Args: { days_back?: number }
        Returns: {
          day: string
          revenue: number
          transaction_count: number
        }[]
      }
      admin_get_jap_proofs: {
        Args: never
        Returns: {
          created_at: string
          id: string
          mantra_name: string
          notes: string
          performer_id: string
          performer_name: string
          proof_type: string
          proof_url: string
          request_id: string
        }[]
      }
      admin_get_revenue_by_category: {
        Args: never
        Returns: {
          category: string
          percentage: number
          total: number
        }[]
      }
      admin_get_revenue_summary: {
        Args: never
        Returns: {
          month_change: number
          month_revenue: number
          month_transactions: number
          today_change: number
          today_revenue: number
          today_transactions: number
          total_revenue: number
        }[]
      }
      auto_acknowledge_temple_reports: { Args: never; Returns: undefined }
      check_auto_complete_requests: { Args: never; Returns: undefined }
      check_expired_requests: { Args: never; Returns: undefined }
      flag_short: {
        Args: { p_reason: string; p_short_id: string }
        Returns: undefined
      }
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
      get_jap_leaderboard: {
        Args: { limit_count?: number; mantra_filter?: string }
        Returns: {
          avatar_url: string
          display_name: string
          id: string
          mantra_name: string
          total_chants: number
        }[]
      }
      get_shared_garden: {
        Args: { garden_id: string }
        Returns: {
          created_at: string
          flourishing_count: number
          garden_level: number
          id: string
          is_anonymous: boolean
          plant_count: number
          screenshot_url: string
          share_message: string
          total_karma_earned: number
        }[]
      }
      get_story_reaction_counts: {
        Args: { story_ids: string[] }
        Returns: {
          reaction_count: number
          reaction_type: string
          story_id: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      toggle_short_like: { Args: { p_short_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
