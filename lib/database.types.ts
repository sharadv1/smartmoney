export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          broker: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          broker?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          broker?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      instruments: {
        Row: {
          description: string | null
          id: string
          symbol: string
        }
        Insert: {
          description?: string | null
          id?: string
          symbol: string
        }
        Update: {
          description?: string | null
          id?: string
          symbol?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          description: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trade_closures: {
        Row: {
          closed_at: string
          closure_type: Database["public"]["Enums"]["close_type"]
          fee: number | null
          id: string
          price: number
          qty: number
          trade_id: string | null
        }
        Insert: {
          closed_at?: string
          closure_type: Database["public"]["Enums"]["close_type"]
          fee?: number | null
          id?: string
          price: number
          qty: number
          trade_id?: string | null
        }
        Update: {
          closed_at?: string
          closure_type?: Database["public"]["Enums"]["close_type"]
          fee?: number | null
          id?: string
          price?: number
          qty?: number
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_closures_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          account_id: string | null
          direction: Database["public"]["Enums"]["trade_dir"]
          entry_px: number
          id: string
          instrument_id: string | null
          notes: string | null
          opened_at: string
          qty: number
          r_multiple: number | null
          reward_total: number | null
          risk_total: number | null
          stop_px: number
          strategy_id: string | null
          take_px: number
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          direction: Database["public"]["Enums"]["trade_dir"]
          entry_px: number
          id?: string
          instrument_id?: string | null
          notes?: string | null
          opened_at?: string
          qty: number
          r_multiple?: number | null
          reward_total?: number | null
          risk_total?: number | null
          stop_px: number
          strategy_id?: string | null
          take_px: number
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          direction?: Database["public"]["Enums"]["trade_dir"]
          entry_px?: number
          id?: string
          instrument_id?: string | null
          notes?: string | null
          opened_at?: string
          qty?: number
          r_multiple?: number | null
          reward_total?: number | null
          risk_total?: number | null
          stop_px?: number
          strategy_id?: string | null
          take_px?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "instruments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      close_type: "partial" | "full"
      trade_dir: "long" | "short"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      close_type: ["partial", "full"],
      trade_dir: ["long", "short"],
    },
  },
} as const
