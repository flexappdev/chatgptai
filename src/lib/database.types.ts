// Hand-authored mirror of supabase/migrations/0001_core_schema.sql.
// Regenerate with `/abc-supabase chatgptai types gen` once the migration is
// applied to the live project; until then this file is the source of truth.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CanvasType =
  | "document"
  | "code"
  | "react"
  | "html"
  | "svg"
  | "mermaid";

export type MessageRole = "user" | "assistant";
export type ConnectorStatus = "connected" | "disconnected" | "error";

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          instructions: string | null;
          memory_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          instructions?: string | null;
          memory_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      project_files: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          filename: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          extracted_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          filename: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          extracted_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_files"]["Insert"]>;
      };
      project_memories: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          content: string;
          source_chat_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          content: string;
          source_chat_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["project_memories"]["Insert"]>;
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          title: string;
          model: string;
          starred: boolean;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          title?: string;
          model?: string;
          starred?: boolean;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chats"]["Insert"]>;
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          chat_id: string;
          role: MessageRole;
          content: string;
          thinking: string | null;
          canvas_id: string | null;
          token_count: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chat_id: string;
          role: MessageRole;
          content: string;
          thinking?: string | null;
          canvas_id?: string | null;
          token_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Insert"]>;
      };
      canvases: {
        Row: {
          id: string;
          user_id: string;
          chat_id: string | null;
          identifier: string;
          title: string | null;
          type: CanvasType;
          language: string | null;
          content: string;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          chat_id?: string | null;
          identifier: string;
          title?: string | null;
          type: CanvasType;
          language?: string | null;
          content: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["canvases"]["Insert"]>;
      };
      skills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          description: string | null;
          content: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          description?: string | null;
          content: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["skills"]["Insert"]>;
      };
      connectors: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          label: string | null;
          status: ConnectorStatus;
          config: Json;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          label?: string | null;
          status?: ConnectorStatus;
          config?: Json;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["connectors"]["Insert"]>;
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
};

// Helper aliases
export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectFileRow = Database["public"]["Tables"]["project_files"]["Row"];
export type ProjectMemoryRow = Database["public"]["Tables"]["project_memories"]["Row"];
export type ChatRow = Database["public"]["Tables"]["chats"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type CanvasRow = Database["public"]["Tables"]["canvases"]["Row"];
export type SkillRow = Database["public"]["Tables"]["skills"]["Row"];
export type ConnectorRow = Database["public"]["Tables"]["connectors"]["Row"];
