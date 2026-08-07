export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string;
          actor_email: string | null;
          actor_id: string | null;
          created_at: string;
          entity: string | null;
          entity_id: string | null;
          id: string;
          meta: Json;
        };
        Insert: {
          action: string;
          actor_email?: string | null;
          actor_id?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          meta?: Json;
        };
        Update: {
          action?: string;
          actor_email?: string | null;
          actor_id?: string | null;
          created_at?: string;
          entity?: string | null;
          entity_id?: string | null;
          id?: string;
          meta?: Json;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          key: string;
          updated_at: string;
          updated_by: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Update: {
          key?: string;
          updated_at?: string;
          updated_by?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      email_campaigns: {
        Row: {
          audience: string;
          body_html: string;
          created_at: string;
          created_by: string | null;
          failed_count: number;
          id: string;
          manual_recipients: string[] | null;
          name: string;
          product_id: string | null;
          scheduled_at: string | null;
          sent_at: string | null;
          sent_count: number;
          status: string;
          subject: string;
          updated_at: string;
        };
        Insert: {
          audience?: string;
          body_html: string;
          created_at?: string;
          created_by?: string | null;
          failed_count?: number;
          id?: string;
          manual_recipients?: string[] | null;
          name: string;
          product_id?: string | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          sent_count?: number;
          status?: string;
          subject: string;
          updated_at?: string;
        };
        Update: {
          audience?: string;
          body_html?: string;
          created_at?: string;
          created_by?: string | null;
          failed_count?: number;
          id?: string;
          manual_recipients?: string[] | null;
          name?: string;
          product_id?: string | null;
          scheduled_at?: string | null;
          sent_at?: string | null;
          sent_count?: number;
          status?: string;
          subject?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_campaigns_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      email_messages: {
        Row: {
          campaign_id: string | null;
          created_at: string;
          error: string | null;
          id: string;
          provider_ref: string | null;
          sent_at: string | null;
          status: string;
          subject: string;
          to_email: string;
        };
        Insert: {
          campaign_id?: string | null;
          created_at?: string;
          error?: string | null;
          id?: string;
          provider_ref?: string | null;
          sent_at?: string | null;
          status?: string;
          subject: string;
          to_email: string;
        };
        Update: {
          campaign_id?: string | null;
          created_at?: string;
          error?: string | null;
          id?: string;
          provider_ref?: string | null;
          sent_at?: string | null;
          status?: string;
          subject?: string;
          to_email?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_messages_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "email_campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      email_templates: {
        Row: {
          body_html: string;
          created_at: string;
          id: string;
          name: string;
          slug: string;
          subject: string;
          updated_at: string;
        };
        Insert: {
          body_html: string;
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          subject: string;
          updated_at?: string;
        };
        Update: {
          body_html?: string;
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          subject?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      leads: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          meta: Json;
          name: string | null;
          phone: string | null;
          product_id: string | null;
          source: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          meta?: Json;
          name?: string | null;
          phone?: string | null;
          product_id?: string | null;
          source?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          meta?: Json;
          name?: string | null;
          phone?: string | null;
          product_id?: string | null;
          source?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          amount_cents: number;
          buyer_email: string;
          buyer_name: string | null;
          created_at: string;
          currency: string;
          id: string;
          notes: string | null;
          paid_at: string | null;
          product_id: string | null;
          provider: string | null;
          provider_ref: string | null;
          status: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          amount_cents?: number;
          buyer_email: string;
          buyer_name?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          product_id?: string | null;
          provider?: string | null;
          provider_ref?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          amount_cents?: number;
          buyer_email?: string;
          buyer_name?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          notes?: string | null;
          paid_at?: string | null;
          product_id?: string | null;
          provider?: string | null;
          provider_ref?: string | null;
          status?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      payment_integrations: {
        Row: {
          active: boolean;
          created_at: string;
          environment: string;
          external_offer_id: string | null;
          external_product_id: string | null;
          external_product_ucode: string | null;
          id: string;
          product_id: string;
          provider: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          environment?: string;
          external_offer_id?: string | null;
          external_product_id?: string | null;
          external_product_ucode?: string | null;
          id?: string;
          product_id: string;
          provider: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          environment?: string;
          external_offer_id?: string | null;
          external_product_id?: string | null;
          external_product_ucode?: string | null;
          id?: string;
          product_id?: string;
          provider?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payment_integrations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_access: {
        Row: {
          created_at: string;
          expires_at: string | null;
          granted_by: string | null;
          id: string;
          product_id: string;
          revoked_at: string | null;
          source: string;
          status_reason: string | null;
          suspended_at: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          granted_by?: string | null;
          id?: string;
          product_id: string;
          revoked_at?: string | null;
          source?: string;
          status_reason?: string | null;
          suspended_at?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          granted_by?: string | null;
          id?: string;
          product_id?: string;
          revoked_at?: string | null;
          source?: string;
          status_reason?: string | null;
          suspended_at?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_access_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_items: {
        Row: {
          category: string | null;
          code: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          image_url: string | null;
          is_free: boolean;
          item_type: string;
          product_id: string;
          prompt: string | null;
          published_at: string | null;
          sort_order: number;
          status: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          category?: string | null;
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_free?: boolean;
          item_type?: string;
          product_id: string;
          prompt?: string | null;
          published_at?: string | null;
          sort_order?: number;
          status?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          category?: string | null;
          code?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_free?: boolean;
          item_type?: string;
          product_id?: string;
          prompt?: string | null;
          published_at?: string | null;
          sort_order?: number;
          status?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_item_revisions: {
        Row: {
          category: string | null;
          changed_by: string | null;
          created_at: string;
          description: string | null;
          id: string;
          item_id: string;
          prompt: string | null;
          reason: string | null;
          status: string;
          title: string;
          version: number;
        };
        Insert: {
          category?: string | null;
          changed_by?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          item_id: string;
          prompt?: string | null;
          reason?: string | null;
          status: string;
          title: string;
          version: number;
        };
        Update: {
          category?: string | null;
          changed_by?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          item_id?: string;
          prompt?: string | null;
          reason?: string | null;
          status?: string;
          title?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_item_revisions_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "product_items";
            referencedColumns: ["id"];
          },
        ];
      };
      product_updates: {
        Row: {
          content: string;
          created_at: string;
          created_by: string | null;
          id: string;
          product_id: string;
          published_at: string | null;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          product_id: string;
          published_at?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          product_id?: string;
          published_at?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_updates_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_collaborators: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          product_id: string;
          revoked_at: string | null;
          role: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          product_id: string;
          revoked_at?: string | null;
          role: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          product_id?: string;
          revoked_at?: string | null;
          role?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_collaborators_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          checkout_url: string | null;
          checkout_url_secondary: string | null;
          compare_at_cents: number | null;
          coproducer_email: string | null;
          coproducer_name: string | null;
          cover_url: string | null;
          created_at: string;
          created_by: string | null;
          currency: string;
          description: string | null;
          id: string;
          is_coproduction: boolean;
          name: string;
          price_cents: number;
          revenue_share_pct: number | null;
          slug: string;
          sort_order: number;
          status: string;
          tagline: string | null;
          updated_at: string;
        };
        Insert: {
          checkout_url?: string | null;
          checkout_url_secondary?: string | null;
          compare_at_cents?: number | null;
          coproducer_email?: string | null;
          coproducer_name?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          id?: string;
          is_coproduction?: boolean;
          name: string;
          price_cents?: number;
          revenue_share_pct?: number | null;
          slug: string;
          sort_order?: number;
          status?: string;
          tagline?: string | null;
          updated_at?: string;
        };
        Update: {
          checkout_url?: string | null;
          checkout_url_secondary?: string | null;
          compare_at_cents?: number | null;
          coproducer_email?: string | null;
          coproducer_name?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          description?: string | null;
          id?: string;
          is_coproduction?: boolean;
          name?: string;
          price_cents?: number;
          revenue_share_pct?: number | null;
          slug?: string;
          sort_order?: number;
          status?: string;
          tagline?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          last_seen_at: string | null;
          notes: string | null;
          phone: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          last_seen_at?: string | null;
          notes?: string | null;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          last_seen_at?: string | null;
          notes?: string | null;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          created_at: string;
          error_message: string | null;
          event_occurred_at: string | null;
          event_type: string;
          external_event_id: string;
          id: string;
          integration_id: string;
          payload: Json;
          processed_at: string | null;
          processing_status: string;
          product_id: string;
          provider: string;
          purchase_status: string | null;
          received_at: string;
          transaction_ref: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          event_occurred_at?: string | null;
          event_type: string;
          external_event_id: string;
          id?: string;
          integration_id: string;
          payload?: Json;
          processed_at?: string | null;
          processing_status?: string;
          product_id: string;
          provider: string;
          purchase_status?: string | null;
          received_at?: string;
          transaction_ref?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          event_occurred_at?: string | null;
          event_type?: string;
          external_event_id?: string;
          id?: string;
          integration_id?: string;
          payload?: Json;
          processed_at?: string | null;
          processing_status?: string;
          product_id?: string;
          provider?: string;
          purchase_status?: string | null;
          received_at?: string;
          transaction_ref?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "webhook_events_integration_id_fkey";
            columns: ["integration_id"];
            isOneToOne: false;
            referencedRelation: "payment_integrations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "webhook_events_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      find_user_id_by_email: { Args: { _email: string }; Returns: string };
      get_bergamo_public_catalog: {
        Args: Record<PropertyKey, never>;
        Returns: {
          category: string | null;
          code: string | null;
          description: string | null;
          is_free: boolean;
          position: number;
          prompt: string | null;
          status: string;
          title: string;
        }[];
      };
      has_product_access: {
        Args: { _product_id: string; _user_id: string };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: { _user_id: string }; Returns: boolean };
      is_super_admin: { Args: { _user_id: string }; Returns: boolean };
      process_hotmart_event: {
        Args: {
          p_amount_cents?: number;
          p_buyer_email?: string;
          p_buyer_name?: string;
          p_event_occurred_at: string;
          p_event_type: string;
          p_external_event_id: string;
          p_integration_id: string;
          p_payload: Json;
          p_product_id: string;
          p_purchase_status: string;
          p_transaction_ref: string;
          p_user_id?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      app_role: "super_admin" | "admin" | "coproducer" | "support" | "member";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "coproducer", "support", "member"],
    },
  },
} as const;
