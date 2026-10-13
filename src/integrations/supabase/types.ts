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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          created_at: string
          id: string
          link_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_conversions: {
        Row: {
          affiliate_id: string
          commission_cents: number
          commission_rate: number
          created_at: string
          id: string
          link_id: string
          material_id: string
          order_ref: string
          sale_amount_cents: number
          status: Database["public"]["Enums"]["conversion_status"]
          supplier_id: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_cents: number
          commission_rate: number
          created_at?: string
          id?: string
          link_id: string
          material_id: string
          order_ref: string
          sale_amount_cents: number
          status?: Database["public"]["Enums"]["conversion_status"]
          supplier_id: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_cents?: number
          commission_rate?: number
          created_at?: string
          id?: string
          link_id?: string
          material_id?: string
          order_ref?: string
          sale_amount_cents?: number
          status?: Database["public"]["Enums"]["conversion_status"]
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_conversions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "curated_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_conversions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          affiliate_id: string
          code: string
          created_at: string
          id: string
          material_id: string
          project_label: string
        }
        Insert: {
          affiliate_id: string
          code?: string
          created_at?: string
          id?: string
          material_id: string
          project_label?: string
        }
        Update: {
          affiliate_id?: string
          code?: string
          created_at?: string
          id?: string
          material_id?: string
          project_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "curated_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_slots: {
        Row: {
          capacity: number
          created_at: string
          ends_at: string
          id: string
          is_available: boolean
          professional_id: string | null
          starts_at: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          ends_at: string
          id?: string
          is_available?: boolean
          professional_id?: string | null
          starts_at: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          ends_at?: string
          id?: string
          is_available?: boolean
          professional_id?: string | null
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      briefing_files: {
        Row: {
          briefing_id: string
          category: string
          client_id: string
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
        }
        Insert: {
          briefing_id: string
          category?: string
          client_id: string
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
        }
        Update: {
          briefing_id?: string
          category?: string
          client_id?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_files_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_people: {
        Row: {
          age: string | null
          briefing_id: string
          created_at: string
          id: string
          name: string | null
          notes: string | null
          occupation: string | null
          relation: string | null
          usage: string | null
        }
        Insert: {
          age?: string | null
          briefing_id: string
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          occupation?: string | null
          relation?: string | null
          usage?: string | null
        }
        Update: {
          age?: string | null
          briefing_id?: string
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          occupation?: string | null
          relation?: string | null
          usage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "briefing_people_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_rooms: {
        Row: {
          briefing_id: string
          created_at: string
          id: string
          name: string
          needs: Json
          room_key: string
        }
        Insert: {
          briefing_id: string
          created_at?: string
          id?: string
          name: string
          needs?: Json
          room_key: string
        }
        Update: {
          briefing_id?: string
          created_at?: string
          id?: string
          name?: string
          needs?: Json
          room_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefing_rooms_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      briefing_visual_options: {
        Row: {
          colors: string[]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          kind: string
          name: string
          sort_order: number
          tags: string[]
          updated_at: string
        }
        Insert: {
          colors?: string[]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          kind: string
          name: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
        }
        Update: {
          colors?: string[]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          kind?: string
          name?: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      briefings: {
        Row: {
          admin_notes: string | null
          aesthetic_profile: string | null
          ai_summary: Json | null
          answers: Json
          client_id: string
          consents: Json | null
          created_at: string
          current_step: number
          eco_holistic: Json | null
          id: string
          progress: number
          project_dna: Json | null
          project_id: string
          schema_version: number
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          aesthetic_profile?: string | null
          ai_summary?: Json | null
          answers?: Json
          client_id: string
          consents?: Json | null
          created_at?: string
          current_step?: number
          eco_holistic?: Json | null
          id?: string
          progress?: number
          project_dna?: Json | null
          project_id: string
          schema_version?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          aesthetic_profile?: string | null
          ai_summary?: Json | null
          answers?: Json
          client_id?: string
          consents?: Json | null
          created_at?: string
          current_step?: number
          eco_holistic?: Json | null
          id?: string
          progress?: number
          project_dna?: Json | null
          project_id?: string
          schema_version?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      construction_inquiries: {
        Row: {
          admin_notes: string | null
          appointment_slot_id: string | null
          city: string
          client_id: string
          construction_description: string
          created_at: string
          desired_timeline: string
          email: string
          full_name: string
          id: string
          phone: string
          postal_code: string
          service_scope: Database["public"]["Enums"]["construction_scope"]
          state: string
          status: Database["public"]["Enums"]["construction_inquiry_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          appointment_slot_id?: string | null
          city: string
          client_id: string
          construction_description: string
          created_at?: string
          desired_timeline: string
          email: string
          full_name: string
          id?: string
          phone: string
          postal_code: string
          service_scope: Database["public"]["Enums"]["construction_scope"]
          state: string
          status?: Database["public"]["Enums"]["construction_inquiry_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          appointment_slot_id?: string | null
          city?: string
          client_id?: string
          construction_description?: string
          created_at?: string
          desired_timeline?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string
          postal_code?: string
          service_scope?: Database["public"]["Enums"]["construction_scope"]
          state?: string
          status?: Database["public"]["Enums"]["construction_inquiry_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "construction_inquiries_appointment_slot_id_fkey"
            columns: ["appointment_slot_id"]
            isOneToOne: true
            referencedRelation: "appointment_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      curated_materials: {
        Row: {
          affiliate_url: string
          attributes: Json
          category: string
          commission_rate: number
          created_at: string
          description: string | null
          eco_index: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          attributes?: Json
          category: string
          commission_rate?: number
          created_at?: string
          description?: string | null
          eco_index: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          attributes?: Json
          category?: string
          commission_rate?: number
          created_at?: string
          description?: string | null
          eco_index?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curated_materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_applications: {
        Row: {
          category: string | null
          city: string | null
          created_at: string
          display_name: string
          document: string | null
          id: string
          kind: Database["public"]["Enums"]["partner_kind"]
          message: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["review_status"]
          supplier_id: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          document?: string | null
          id?: string
          kind: Database["public"]["Enums"]["partner_kind"]
          message?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          supplier_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          document?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["partner_kind"]
          message?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_applications_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_submissions: {
        Row: {
          category: string
          commission_rate: number
          created_at: string
          description: string | null
          eco_index: number | null
          id: string
          image_url: string | null
          material_id: string | null
          name: string
          product_url: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["review_status"]
          submitted_by: string
          supplier_id: string
          sustainability_notes: string | null
          updated_at: string
        }
        Insert: {
          category: string
          commission_rate: number
          created_at?: string
          description?: string | null
          eco_index?: number | null
          id?: string
          image_url?: string | null
          material_id?: string | null
          name: string
          product_url: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          submitted_by: string
          supplier_id: string
          sustainability_notes?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          commission_rate?: number
          created_at?: string
          description?: string | null
          eco_index?: number | null
          id?: string
          image_url?: string | null
          material_id?: string | null
          name?: string
          product_url?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          submitted_by?: string
          supplier_id?: string
          sustainability_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_submissions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "curated_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_submissions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["app_role"]
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["app_role"]
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          note: string | null
          project_id: string
          status: Database["public"]["Enums"]["project_status"]
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          note?: string | null
          project_id: string
          status: Database["public"]["Enums"]["project_status"]
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          note?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["project_status"]
        }
        Relationships: [
          {
            foreignKeyName: "project_status_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          booking_id: string | null
          client_id: string
          created_at: string
          due_date: string | null
          eco_index: number | null
          id: string
          name: string
          next_action: string | null
          professional_id: string | null
          progress: number
          service_name: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          client_id: string
          created_at?: string
          due_date?: string | null
          eco_index?: number | null
          id?: string
          name: string
          next_action?: string | null
          professional_id?: string | null
          progress?: number
          service_name: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          client_id?: string
          created_at?: string
          due_date?: string | null
          eco_index?: number | null
          id?: string
          name?: string
          next_action?: string | null
          professional_id?: string | null
          progress?: number
          service_name?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "service_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          add_extra_room: boolean
          address_complement: string | null
          appointment_slot_id: string | null
          checkout_session_id: string | null
          city: string | null
          client_id: string
          created_at: string
          email: string | null
          extra_room_count: number
          extra_room_price_cents: number | null
          full_name: string | null
          id: string
          neighborhood: string | null
          paid_at: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          plan_id: string
          plan_option_id: string
          postal_code: string | null
          professional_id: string | null
          property_type: string | null
          room_count: number
          state: string | null
          status: Database["public"]["Enums"]["booking_status"]
          street: string | null
          street_number: string | null
          subtotal_cents: number | null
          total_cents: number | null
          updated_at: string
          urgent_delivery: boolean
          urgent_fee_cents: number
        }
        Insert: {
          add_extra_room?: boolean
          address_complement?: string | null
          appointment_slot_id?: string | null
          checkout_session_id?: string | null
          city?: string | null
          client_id: string
          created_at?: string
          email?: string | null
          extra_room_count?: number
          extra_room_price_cents?: number | null
          full_name?: string | null
          id?: string
          neighborhood?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          plan_id: string
          plan_option_id: string
          postal_code?: string | null
          professional_id?: string | null
          property_type?: string | null
          room_count?: number
          state?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          street?: string | null
          street_number?: string | null
          subtotal_cents?: number | null
          total_cents?: number | null
          updated_at?: string
          urgent_delivery?: boolean
          urgent_fee_cents?: number
        }
        Update: {
          add_extra_room?: boolean
          address_complement?: string | null
          appointment_slot_id?: string | null
          checkout_session_id?: string | null
          city?: string | null
          client_id?: string
          created_at?: string
          email?: string | null
          extra_room_count?: number
          extra_room_price_cents?: number | null
          full_name?: string | null
          id?: string
          neighborhood?: string | null
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          plan_id?: string
          plan_option_id?: string
          postal_code?: string | null
          professional_id?: string | null
          property_type?: string | null
          room_count?: number
          state?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          street?: string | null
          street_number?: string | null
          subtotal_cents?: number | null
          total_cents?: number | null
          updated_at?: string
          urgent_delivery?: boolean
          urgent_fee_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_appointment_slot_id_fkey"
            columns: ["appointment_slot_id"]
            isOneToOne: false
            referencedRelation: "appointment_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_plan_option_id_fkey"
            columns: ["plan_option_id"]
            isOneToOne: false
            referencedRelation: "service_plan_options"
            referencedColumns: ["id"]
          },
        ]
      }
      service_plan_options: {
        Row: {
          compare_at_price_cents: number | null
          created_at: string
          delivery_days: number | null
          description: string | null
          extra_room_price_cents: number
          id: string
          includes_3d: boolean
          includes_material_list: boolean
          includes_tour: boolean
          installments: number
          is_starting_price: boolean
          meetings: number | null
          plan_id: string
          price_cents: number | null
          price_per_room: boolean
          revisions: number | null
          rooms_label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          compare_at_price_cents?: number | null
          created_at?: string
          delivery_days?: number | null
          description?: string | null
          extra_room_price_cents?: number
          id?: string
          includes_3d?: boolean
          includes_material_list?: boolean
          includes_tour?: boolean
          installments?: number
          is_starting_price?: boolean
          meetings?: number | null
          plan_id: string
          price_cents?: number | null
          price_per_room?: boolean
          revisions?: number | null
          rooms_label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          compare_at_price_cents?: number | null
          created_at?: string
          delivery_days?: number | null
          description?: string | null
          extra_room_price_cents?: number
          id?: string
          includes_3d?: boolean
          includes_material_list?: boolean
          includes_tour?: boolean
          installments?: number
          is_starting_price?: boolean
          meetings?: number | null
          plan_id?: string
          price_cents?: number | null
          price_per_room?: boolean
          revisions?: number | null
          rooms_label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_plan_options_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "service_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      service_plans: {
        Row: {
          badge: string | null
          created_at: string
          cta_label: string
          deliverables: string[]
          description: string
          footnote: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tagline: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          cta_label?: string
          deliverables?: string[]
          description?: string
          footnote?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          cta_label?: string
          deliverables?: string[]
          description?: string
          footnote?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_secrets: {
        Row: {
          created_at: string
          supplier_id: string
          webhook_secret: string
        }
        Insert: {
          created_at?: string
          supplier_id: string
          webhook_secret?: string
        }
        Update: {
          created_at?: string
          supplier_id?: string
          webhook_secret?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_secrets_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: true
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          category: string
          city: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          owner_id: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          category: string
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          owner_id?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          category?: string
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          context: string | null
          created_at: string
          id: string
          is_active: boolean
          project_label: string | null
          quote: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          author_name: string
          context?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          project_label?: string | null
          quote: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          author_name?: string
          context?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          project_label?: string | null
          quote?: string
          sort_order?: number
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      list_professionals: {
        Args: never
        Returns: {
          city: string
          display_name: string
          user_id: string
        }[]
      }
      reserve_service_booking: {
        Args: {
          _address_complement: string
          _booking_id: string
          _city: string
          _email: string
          _extra_room_count: number
          _full_name: string
          _neighborhood: string
          _phone: string
          _postal_code: string
          _property_type: string
          _slot_id: string
          _state: string
          _street: string
          _street_number: string
          _urgent_delivery: boolean
        }
        Returns: {
          add_extra_room: boolean
          address_complement: string | null
          appointment_slot_id: string | null
          checkout_session_id: string | null
          city: string | null
          client_id: string
          created_at: string
          email: string | null
          extra_room_count: number
          extra_room_price_cents: number | null
          full_name: string | null
          id: string
          neighborhood: string | null
          paid_at: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          plan_id: string
          plan_option_id: string
          postal_code: string | null
          professional_id: string | null
          property_type: string | null
          room_count: number
          state: string | null
          status: Database["public"]["Enums"]["booking_status"]
          street: string | null
          street_number: string | null
          subtotal_cents: number | null
          total_cents: number | null
          updated_at: string
          urgent_delivery: boolean
          urgent_fee_cents: number
        }
        SetofOptions: {
          from: "*"
          to: "service_bookings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      review_partner_application: {
        Args: { _approve: boolean; _id: string; _note?: string }
        Returns: undefined
      }
      review_product_submission: {
        Args: {
          _approve: boolean
          _eco_index?: number
          _id: string
          _note?: string
        }
        Returns: undefined
      }
      schedule_construction_meeting: {
        Args: { _inquiry_id: string; _slot_id: string }
        Returns: undefined
      }
      submit_briefing: {
        Args: {
          _aesthetic_profile: string
          _briefing_id: string
          _consents: Json
          _project_dna: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "client" | "professional" | "creator" | "partner"
      booking_status:
        | "draft"
        | "awaiting_payment"
        | "payment_processing"
        | "confirmed"
        | "cancelled"
      construction_inquiry_status:
        | "submitted"
        | "meeting_scheduled"
        | "contacted"
        | "converted"
        | "closed"
      construction_scope: "project_only" | "project_build_followup"
      conversion_status: "pending" | "approved" | "paid" | "cancelled"
      partner_kind: "supplier" | "affiliate" | "professional"
      payment_status: "not_started" | "pending" | "paid" | "failed" | "refunded"
      project_status:
        | "PAYMENT_CONFIRMED"
        | "BRIEFING_PENDING"
        | "BRIEFING_COMPLETED"
        | "BRIEFING_VALIDATED"
        | "MEETING_1"
        | "DEVELOPMENT"
        | "PRESENTATION"
        | "ADJUSTMENTS"
        | "APPROVAL"
        | "FINAL_DELIVERY"
        | "CERTIFICATION_REVIEW"
        | "CERTIFIED"
        | "COMPLETED"
      review_status: "pending" | "approved" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "client", "professional", "creator", "partner"],
      booking_status: [
        "draft",
        "awaiting_payment",
        "payment_processing",
        "confirmed",
        "cancelled",
      ],
      construction_inquiry_status: [
        "submitted",
        "meeting_scheduled",
        "contacted",
        "converted",
        "closed",
      ],
      construction_scope: ["project_only", "project_build_followup"],
      conversion_status: ["pending", "approved", "paid", "cancelled"],
      partner_kind: ["supplier", "affiliate", "professional"],
      payment_status: ["not_started", "pending", "paid", "failed", "refunded"],
      project_status: [
        "PAYMENT_CONFIRMED",
        "BRIEFING_PENDING",
        "BRIEFING_COMPLETED",
        "BRIEFING_VALIDATED",
        "MEETING_1",
        "DEVELOPMENT",
        "PRESENTATION",
        "ADJUSTMENTS",
        "APPROVAL",
        "FINAL_DELIVERY",
        "CERTIFICATION_REVIEW",
        "CERTIFIED",
        "COMPLETED",
      ],
      review_status: ["pending", "approved", "rejected"],
    },
  },
} as const
