export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "active"
  | "expired"
  | "cancelled"
  | "rejected";

export type ProfileRole = "admin" | "member";
export type PostVisibility = "public" | "members_only";
export type PostStatus = "draft" | "published";
export type ContactTicketStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "archived";
export type EmailType =
  | "application_received"
  | "admin_new_application"
  | "application_approved"
  | "application_approved_payment_required"
  | "payment_confirmed_welcome"
  | "application_rejected"
  | "admin_contact_ticket"
  | "payment_link_resent"
  | "member_update";

export type PaymentStatus =
  | "not_required"
  | "pending_payment"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string | null;
          address: string | null;
          residential_address: string | null;
          phone_number: string | null;
          occupation: string | null;
          firearms_licence_number: string | null;
          licence_category: string | null;
          licence_expiry_date: string | null;
          emergency_contact_name: string | null;
          emergency_contact_relationship: string | null;
          emergency_contact_phone: string | null;
          outdoor_interests: string | null;
          outdoor_interests_other: string | null;
          firearms_licence_info: string | null;
          referral: string | null;
          reason_for_joining: string | null;
          agreement_accepted: boolean;
          privacy_accepted: boolean;
          waiver_accepted: boolean;
          agree_safe_conduct: boolean;
          agree_lawful_directions: boolean;
          agree_regulations: boolean;
          agree_respect_environment: boolean;
          agree_no_reckless_behaviour: boolean;
          agree_no_intoxication: boolean;
          agree_personal_responsibility: boolean;
          agree_rules_consequence: boolean;
          accept_liability_waiver: boolean;
          accept_privacy_consent: boolean;
          typed_signature: string | null;
          applicant_signature: string | null;
          application_date: string | null;
          status: ApplicationStatus;
          payment_status: PaymentStatus;
          member_number: string | null;
          stripe_checkout_session_id: string | null;
          stripe_payment_link: string | null;
          admin_notes: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string | null;
          date_of_birth?: string | null;
          address?: string | null;
          residential_address?: string | null;
          phone_number?: string | null;
          occupation?: string | null;
          firearms_licence_number?: string | null;
          licence_category?: string | null;
          licence_expiry_date?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_relationship?: string | null;
          emergency_contact_phone?: string | null;
          outdoor_interests?: string | null;
          outdoor_interests_other?: string | null;
          firearms_licence_info?: string | null;
          referral?: string | null;
          reason_for_joining?: string | null;
          agreement_accepted?: boolean;
          privacy_accepted?: boolean;
          waiver_accepted?: boolean;
          agree_safe_conduct?: boolean;
          agree_lawful_directions?: boolean;
          agree_regulations?: boolean;
          agree_respect_environment?: boolean;
          agree_no_reckless_behaviour?: boolean;
          agree_no_intoxication?: boolean;
          agree_personal_responsibility?: boolean;
          agree_rules_consequence?: boolean;
          accept_liability_waiver?: boolean;
          accept_privacy_consent?: boolean;
          typed_signature?: string | null;
          applicant_signature?: string | null;
          application_date?: string | null;
          status?: ApplicationStatus;
          payment_status?: PaymentStatus;
          member_number?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_payment_link?: string | null;
          admin_notes?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
        Relationships: [];
      };
      email_logs: {
        Row: {
          id: string;
          subject: string | null;
          audience: string | null;
          post_id: string | null;
          recipient_email: string | null;
          email_type: EmailType | null;
          related_application_id: string | null;
          related_profile_id: string | null;
          recipient_count: number | null;
          status: string | null;
          provider_message_id: string | null;
          error_message: string | null;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subject?: string | null;
          audience?: string | null;
          post_id?: string | null;
          recipient_email?: string | null;
          email_type?: EmailType | null;
          related_application_id?: string | null;
          related_profile_id?: string | null;
          recipient_count?: number | null;
          status?: string | null;
          provider_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_logs"]["Insert"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          profile_id: string | null;
          application_id: string | null;
          member_number: string | null;
          stripe_customer_id: string | null;
          stripe_checkout_session_id: string | null;
          stripe_subscription_id: string | null;
          amount: number | null;
          currency: string;
          payment_type: string | null;
          status: string | null;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          application_id?: string | null;
          member_number?: string | null;
          stripe_customer_id?: string | null;
          stripe_checkout_session_id?: string | null;
          stripe_subscription_id?: string | null;
          amount?: number | null;
          currency?: string;
          payment_type?: string | null;
          status?: string | null;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          body: string | null;
          visibility: PostVisibility;
          status: PostStatus;
          published_at: string | null;
          email_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          body?: string | null;
          visibility?: PostVisibility;
          status?: PostStatus;
          published_at?: string | null;
          email_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number | null;
          currency: string;
          stripe_price_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          stripe_price_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      contact_tickets: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          topic: string;
          subject: string;
          message: string;
          status: ContactTicketStatus;
          admin_notes: string | null;
          source_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          topic?: string;
          subject: string;
          message: string;
          status?: ContactTicketStatus;
          admin_notes?: string | null;
          source_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["contact_tickets"]["Insert"]
        >;
        Relationships: [];
      };
      sponsors: {
        Row: {
          id: string;
          name: string;
          slug: string;
          tier_id: string | null;
          summary: string | null;
          description: string | null;
          website_url: string | null;
          logo_url: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          active: boolean;
          featured: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          tier_id?: string | null;
          summary?: string | null;
          description?: string | null;
          website_url?: string | null;
          logo_url?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          active?: boolean;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sponsors"]["Insert"]>;
        Relationships: [];
      };
      sponsorship_tiers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price_label: string;
          amount: number | null;
          description: string | null;
          benefits: string | null;
          contact_required: boolean;
          active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price_label: string;
          amount?: number | null;
          description?: string | null;
          benefits?: string | null;
          contact_required?: boolean;
          active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["sponsorship_tiers"]["Insert"]
        >;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          email: string;
          full_name: string | null;
          phone: string | null;
          member_number: string | null;
          role: ProfileRole;
          membership_status: ApplicationStatus;
          payment_status: PaymentStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          membership_started_at: string | null;
          membership_expires_at: string | null;
          linked_application_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          member_number?: string | null;
          role?: ProfileRole;
          membership_status?: ApplicationStatus;
          payment_status?: PaymentStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          membership_started_at?: string | null;
          membership_expires_at?: string | null;
          linked_application_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_member_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
