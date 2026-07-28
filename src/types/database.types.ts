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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string
          city: string
          country: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          details: string | null
          email: string | null
          full_name: string
          id: string
          is_default: number | null
          phone: string
          postal_code: string | null
          session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          area: string
          city: string
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          details?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_default?: number | null
          phone: string
          postal_code?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          area?: string
          city?: string
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          details?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_default?: number | null
          phone?: string
          postal_code?: string | null
          session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_value: string | null
          previous_value: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          previous_value?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          previous_value?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      banner_images: {
        Row: {
          banner_id: string
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          link_url: string | null
        }
        Insert: {
          banner_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          link_url?: string | null
        }
        Update: {
          banner_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          link_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_images_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "homepage_banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_settings: {
        Row: {
          background_color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          text_ar: string
          text_color: string | null
          text_en: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          text_ar: string
          text_color?: string | null
          text_en: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          text_ar?: string
          text_color?: string | null
          text_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bundle_items: {
        Row: {
          bundle_id: string
          id: string
          quantity: number | null
          variant_id: string
        }
        Insert: {
          bundle_id: string
          id?: string
          quantity?: number | null
          variant_id: string
        }
        Update: {
          bundle_id?: string
          id?: string
          quantity?: number | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: number | null
          name_ar: string
          name_en: string
          price_value: number
          pricing_type: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: number | null
          name_ar: string
          name_en: string
          price_value: number
          pricing_type: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: number | null
          name_ar?: string
          name_en?: string
          price_value?: number
          pricing_type?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          bundle_id: string | null
          cart_id: string
          created_at: string | null
          id: string
          quantity: number | null
          variant_id: string | null
        }
        Insert: {
          bundle_id?: string | null
          cart_id: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          variant_id?: string | null
        }
        Update: {
          bundle_id?: string | null
          cart_id?: string
          created_at?: string | null
          id?: string
          quantity?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: number | null
          name_ar: string
          name_en: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: number | null
          name_ar: string
          name_en: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: number | null
          name_ar?: string
          name_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      colors: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_order: number | null
          hex_code: string
          id: string
          name_ar: string
          name_en: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          hex_code: string
          id?: string
          name_ar: string
          name_en: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          hex_code?: string
          id?: string
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      customer_love: {
        Row: {
          created_at: string | null
          customer_name: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          is_featured: boolean | null
          rating: number | null
          review_text: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          rating?: number | null
          review_text?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      customer_love_settings: {
        Row: {
          created_at: string | null
          cta_text: string | null
          id: string
          instagram_handle: string | null
          is_active: boolean | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_text?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_text?: string | null
          id?: string
          instagram_handle?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer_ar: string
          answer_en: string
          category: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_order: number | null
          id: string
          is_active: number | null
          question_ar: string
          question_en: string
          updated_at: string | null
        }
        Insert: {
          answer_ar: string
          answer_en: string
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: number | null
          question_ar: string
          question_en: string
          updated_at?: string | null
        }
        Update: {
          answer_ar?: string
          answer_en?: string
          category?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: number | null
          question_ar?: string
          question_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          is_enabled: number | null
          name: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          is_enabled?: number | null
          name: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          is_enabled?: number | null
          name?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      hero_settings: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          button_text_ar: string | null
          button_text_en: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: number | null
          link_url: string | null
          subtitle_ar: string | null
          subtitle_en: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          button_text_ar?: string | null
          button_text_en?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: number | null
          link_url?: string | null
          subtitle_ar?: string | null
          subtitle_en?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          button_text_ar?: string | null
          button_text_en?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: number | null
          link_url?: string | null
          subtitle_ar?: string | null
          subtitle_en?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      homepage_banners: {
        Row: {
          button_text_ar: string | null
          button_text_en: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description_ar: string | null
          description_en: string | null
          display_order: number | null
          id: string
          is_active: number | null
          layout: string | null
          link_url: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string | null
        }
        Insert: {
          button_text_ar?: string | null
          button_text_en?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: number | null
          layout?: string | null
          link_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
        }
        Update: {
          button_text_ar?: string | null
          button_text_en?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          display_order?: number | null
          id?: string
          is_active?: number | null
          layout?: string | null
          link_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marquee_items: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          text: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          text: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          text?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      marquee_settings: {
        Row: {
          background_color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          scroll_speed: number | null
          text_color: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          scroll_speed?: number | null
          text_color?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          scroll_speed?: number | null
          text_color?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mobile_hero: {
        Row: {
          button_link: string | null
          button_text: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          media_type: string | null
          media_url: string | null
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          media_type?: string | null
          media_url?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      more_to_discover: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
          link: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          link?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          link?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      more_to_discover_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          section_title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          section_title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          section_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      option_values: {
        Row: {
          created_at: string | null
          display_order: number | null
          extra_data: string | null
          id: string
          option_id: string
          value_ar: string
          value_en: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          extra_data?: string | null
          id?: string
          option_id: string
          value_ar: string
          value_en: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          extra_data?: string | null
          id?: string
          option_id?: string
          value_ar?: string
          value_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color_id: string | null
          color_name: string | null
          created_at: string | null
          id: string
          order_id: string | null
          product_id: string | null
          product_image: string | null
          product_name: string
          product_name_ar: string | null
          quantity: number
          size_id: string | null
          size_name: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          color_id?: string | null
          color_name?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_image?: string | null
          product_name: string
          product_name_ar?: string | null
          quantity?: number
          size_id?: string | null
          size_name?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          color_id?: string | null
          color_name?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          product_name_ar?: string | null
          quantity?: number
          size_id?: string | null
          size_name?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string | null
          created_at: string | null
          customer_name: string
          detailed_address: string | null
          discount_amount: number | null
          discount_code: string | null
          government: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          phone_number: string
          session_id: string | null
          shipping_cost: number | null
          status: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          customer_name: string
          detailed_address?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          government: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          phone_number: string
          session_id?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          customer_name?: string
          detailed_address?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          government?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          phone_number?: string
          session_id?: string | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      our_vibes: {
        Row: {
          caption: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          product_id: string | null
          thumbnail_url: string | null
          updated_at: string | null
          video_url: string
        }
        Insert: {
          caption: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url: string
        }
        Update: {
          caption?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          product_id?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "our_vibes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      our_vibes_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          section_title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          section_title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          section_title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          page_type: string
          page_url: string | null
          referrer: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          page_type: string
          page_url?: string | null
          referrer?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          page_type?: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content_ar: string | null
          content_en: string | null
          created_at: string | null
          id: string
          is_active: number | null
          meta_description_ar: string | null
          meta_description_en: string | null
          slug: string
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          content_ar?: string | null
          content_en?: string | null
          created_at?: string | null
          id?: string
          is_active?: number | null
          meta_description_ar?: string | null
          meta_description_en?: string | null
          slug: string
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          content_ar?: string | null
          content_en?: string | null
          created_at?: string | null
          id?: string
          is_active?: number | null
          meta_description_ar?: string | null
          meta_description_en?: string | null
          slug?: string
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_colors: {
        Row: {
          color_id: string
          display_order: number | null
          id: string
          product_id: string
        }
        Insert: {
          color_id: string
          display_order?: number | null
          id?: string
          product_id: string
        }
        Update: {
          color_id?: string
          display_order?: number | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          color_id: string | null
          created_at: string | null
          display_order: number | null
          file_path: string
          id: string
          is_main: number | null
          product_id: string
          variant_id: string | null
        }
        Insert: {
          color_id?: string | null
          created_at?: string | null
          display_order?: number | null
          file_path: string
          id?: string
          is_main?: number | null
          product_id: string
          variant_id?: string | null
        }
        Update: {
          color_id?: string | null
          created_at?: string | null
          display_order?: number | null
          file_path?: string
          id?: string
          is_main?: number | null
          product_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          name_ar: string
          name_en: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          name_ar: string
          name_en: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          name_ar?: string
          name_en?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_name: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_approved: number | null
          is_verified_purchase: number | null
          product_id: string
          rating: number
          session_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_name: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_approved?: number | null
          is_verified_purchase?: number | null
          product_id: string
          rating: number
          session_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_name?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_approved?: number | null
          is_verified_purchase?: number | null
          product_id?: string
          rating?: number
          session_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          id: string
          price_override: number | null
          product_id: string
          quantity: number | null
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          price_override?: number | null
          product_id: string
          quantity?: number | null
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          price_override?: number | null
          product_id?: string
          quantity?: number | null
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          id: string
          product_id: string
          referrer: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          product_id: string
          referrer?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          product_id?: string
          referrer?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge_order: number | null
          base_price: number
          category_id: string | null
          category_order: number | null
          global_order: number | null
          compare_at_price: number | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description_ar: string | null
          description_draft_ar: string | null
          description_draft_en: string | null
          description_en: string | null
          id: string
          is_active: number | null
          material_ar: string | null
          material_draft_ar: string | null
          material_draft_en: string | null
          material_en: string | null
          name_ar: string
          name_en: string
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          size_chart_url: string | null
          tags_ar: string | null
          tags_en: string | null
          updated_at: string | null
        }
        Insert: {
          badge_order?: number | null
          base_price: number
          category_id?: string | null
          category_order?: string | null
          global_order?: number | null
          compare_at_price?: number | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_draft_ar?: string | null
          description_draft_en?: string | null
          description_en?: string | null
          id?: string
          is_active?: number | null
          material_ar?: string | null
          material_draft_ar?: string | null
          material_draft_en?: string | null
          material_en?: string | null
          name_ar: string
          name_en: string
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          size_chart_url?: string | null
          tags_ar?: string | null
          tags_en?: string | null
          updated_at?: string | null
        }
        Update: {
          badge_order?: number | null
          base_price?: number
          category_id?: string | null
          category_order?: number | null
          global_order?: number | null
          compare_at_price?: number | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_draft_ar?: string | null
          description_draft_en?: string | null
          description_en?: string | null
          id?: string
          is_active?: number | null
          material_ar?: string | null
          material_draft_ar?: string | null
          material_draft_en?: string | null
          material_en?: string | null
          name_ar?: string
          name_en?: string
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          size_chart_url?: string | null
          tags_ar?: string | null
          tags_en?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          first_order_only: number | null
          id: string
          is_active: number | null
          min_order_amount: number | null
          start_date: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          discount_type: string
          discount_value: number
          end_date?: string | null
          first_order_only?: number | null
          id?: string
          is_active?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          first_order_only?: number | null
          id?: string
          is_active?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          conditions: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: number | null
          name_ar: string
          name_en: string
          priority: number | null
          start_date: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          conditions?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          discount_type: string
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: number | null
          name_ar: string
          name_en: string
          priority?: number | null
          start_date?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          conditions?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: number | null
          name_ar?: string
          name_en?: string
          priority?: number | null
          start_date?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quick_promotions: {
        Row: {
          applies_to: string | null
          badge_text_ar: string | null
          badge_text_en: string | null
          buy_quantity: number | null
          category_id: string | null
          category_ids: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string | null
          exclude_category_ids: string | null
          exclude_product_ids: string | null
          get_quantity: number | null
          gift_product_id: string | null
          id: string
          is_active: number | null
          min_amount: number | null
          min_items: number | null
          name_ar: string
          name_en: string
          priority: number | null
          product_id: string | null
          product_ids: string | null
          promo_type: string
          show_banner: number | null
          show_in_cart: number | null
          show_in_product: number | null
          start_date: string | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applies_to?: string | null
          badge_text_ar?: string | null
          badge_text_en?: string | null
          buy_quantity?: number | null
          category_id?: string | null
          category_ids?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          exclude_category_ids?: string | null
          exclude_product_ids?: string | null
          get_quantity?: number | null
          gift_product_id?: string | null
          id?: string
          is_active?: number | null
          min_amount?: number | null
          min_items?: number | null
          name_ar: string
          name_en: string
          priority?: number | null
          product_id?: string | null
          product_ids?: string | null
          promo_type: string
          show_banner?: number | null
          show_in_cart?: number | null
          show_in_product?: number | null
          start_date?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applies_to?: string | null
          badge_text_ar?: string | null
          badge_text_en?: string | null
          buy_quantity?: number | null
          category_id?: string | null
          category_ids?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          exclude_category_ids?: string | null
          exclude_product_ids?: string | null
          get_quantity?: number | null
          gift_product_id?: string | null
          id?: string
          is_active?: number | null
          min_amount?: number | null
          min_items?: number | null
          name_ar?: string
          name_en?: string
          priority?: number | null
          product_id?: string | null
          product_ids?: string | null
          promo_type?: string
          show_banner?: number | null
          show_in_cart?: number | null
          show_in_product?: number | null
          start_date?: string | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_promotions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_promotions_gift_product_id_fkey"
            columns: ["gift_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quick_promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      related_products: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          product_id: string
          related_product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id: string
          related_product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          product_id?: string
          related_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "related_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "related_products_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      search_queries: {
        Row: {
          clicked_product_id: string | null
          created_at: string | null
          id: string
          query: string
          results_count: number | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          clicked_product_id?: string | null
          created_at?: string | null
          id?: string
          query: string
          results_count?: number | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          clicked_product_id?: string | null
          created_at?: string | null
          id?: string
          query?: string
          results_count?: number | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_queries_clicked_product_id_fkey"
            columns: ["clicked_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "search_queries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          ended_at: string | null
          id: string
          is_converted: number | null
          landing_page: string | null
          os: string | null
          page_views_count: number | null
          referrer_source: string | null
          session_id: string
          started_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          ended_at?: string | null
          id?: string
          is_converted?: number | null
          landing_page?: string | null
          os?: string | null
          page_views_count?: number | null
          referrer_source?: string | null
          session_id: string
          started_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          ended_at?: string | null
          id?: string
          is_converted?: number | null
          landing_page?: string | null
          os?: string | null
          page_views_count?: number | null
          referrer_source?: string | null
          session_id?: string
          started_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_order: number | null
          estimated_days_max: number | null
          estimated_days_min: number | null
          free_shipping_threshold: number | null
          id: string
          is_active: number | null
          name_ar: string
          name_en: string
          shipping_cost: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: number | null
          name_ar: string
          name_en: string
          shipping_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_order?: number | null
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: number | null
          name_ar?: string
          name_en?: string
          shipping_cost?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_proofs: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_approved: number | null
          is_featured: number | null
          product_id: string | null
          thumbnail_url: string | null
          title_ar: string | null
          title_en: string | null
          updated_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_approved?: number | null
          is_featured?: number | null
          product_id?: string | null
          thumbnail_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_approved?: number | null
          is_featured?: number | null
          product_id?: string | null
          thumbnail_url?: string | null
          title_ar?: string | null
          title_en?: string | null
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_proofs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          created_at: string | null
          customer_name: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          is_visible: number | null
          rating: number | null
          role: string | null
          text_ar: string | null
          text_en: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_visible?: number | null
          rating?: number | null
          role?: string | null
          text_ar?: string | null
          text_en?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          is_visible?: number | null
          rating?: number | null
          role?: string | null
          text_ar?: string | null
          text_en?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          email: string
          id: string
          password_hash: string
          role: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email: string
          id?: string
          password_hash: string
          role?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          email?: string
          id?: string
          password_hash?: string
          role?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      variant_option_values: {
        Row: {
          option_value_id: string
          variant_id: string
        }
        Insert: {
          option_value_id: string
          variant_id: string
        }
        Update: {
          option_value_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_option_values_option_value_id_fkey"
            columns: ["option_value_id"]
            isOneToOne: false
            referencedRelation: "option_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_option_values_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_promo_usage: {
        Args: { promo_code: string }
        Returns: undefined
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
