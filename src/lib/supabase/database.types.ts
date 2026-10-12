// Database types for the Supabase client.
// Mirrors supabase/migrations. Regenerate with `npm run db:types` (needs `npm run db:start`)
// after changing the schema.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      applications: {
        Row: {
          company: string;
          contact_email: string | null;
          contact_name: string | null;
          created_at: string;
          date_applied: string | null;
          id: string;
          location: string | null;
          next_follow_up: string | null;
          notes: string | null;
          posting_url: string | null;
          role_title: string;
          salary_currency: string;
          salary_max: number | null;
          salary_min: number | null;
          source: string | null;
          status: Database["public"]["Enums"]["application_status"];
          updated_at: string;
          user_id: string;
          work_mode: Database["public"]["Enums"]["work_mode"] | null;
        };
        Insert: {
          company: string;
          contact_email?: string | null;
          contact_name?: string | null;
          created_at?: string;
          date_applied?: string | null;
          id?: string;
          location?: string | null;
          next_follow_up?: string | null;
          notes?: string | null;
          posting_url?: string | null;
          role_title: string;
          salary_currency?: string;
          salary_max?: number | null;
          salary_min?: number | null;
          source?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          updated_at?: string;
          user_id?: string;
          work_mode?: Database["public"]["Enums"]["work_mode"] | null;
        };
        Update: {
          company?: string;
          contact_email?: string | null;
          contact_name?: string | null;
          created_at?: string;
          date_applied?: string | null;
          id?: string;
          location?: string | null;
          next_follow_up?: string | null;
          notes?: string | null;
          posting_url?: string | null;
          role_title?: string;
          salary_currency?: string;
          salary_max?: number | null;
          salary_min?: number | null;
          source?: string | null;
          status?: Database["public"]["Enums"]["application_status"];
          updated_at?: string;
          user_id?: string;
          work_mode?: Database["public"]["Enums"]["work_mode"] | null;
        };
        Relationships: [];
      };
      status_events: {
        Row: {
          application_id: string;
          changed_at: string;
          from_status: Database["public"]["Enums"]["application_status"] | null;
          id: number;
          to_status: Database["public"]["Enums"]["application_status"];
          user_id: string;
        };
        Insert: {
          application_id: string;
          changed_at?: string;
          from_status?: Database["public"]["Enums"]["application_status"] | null;
          id?: never;
          to_status: Database["public"]["Enums"]["application_status"];
          user_id: string;
        };
        Update: {
          application_id?: string;
          changed_at?: string;
          from_status?: Database["public"]["Enums"]["application_status"] | null;
          id?: never;
          to_status?: Database["public"]["Enums"]["application_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "status_events_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      application_status:
        "wishlist" | "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
      work_mode: "remote" | "hybrid" | "on_site";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
