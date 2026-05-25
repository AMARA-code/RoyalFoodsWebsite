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
      menu_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['menu_categories']['Insert']>
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          slug: string
          description: string | null
          price: number
          image_url: string | null
          badge: string | null
          tags: string[]
          is_available: boolean
          is_featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          slug: string
          description?: string | null
          price: number
          image_url?: string | null
          badge?: string | null
          tags?: string[]
          is_available?: boolean
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['menu_items']['Insert']>
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          total_orders: number
          total_spent: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          total_orders?: number
          total_spent?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_ref: string
          customer_id: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string
          delivery_address: string
          status: OrderStatus
          payment_method: PaymentMethod
          payment_verified: boolean
          payment_screenshot: string | null
          payment_reference: string | null
          subtotal: number
          delivery_fee: number
          total_amount: number
          special_instructions: string | null
          admin_notes: string | null
          verified_at: string | null
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_ref: string
          customer_id?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone: string
          delivery_address: string
          status?: OrderStatus
          payment_method: PaymentMethod
          payment_verified?: boolean
          payment_screenshot?: string | null
          payment_reference?: string | null
          subtotal: number
          delivery_fee?: number
          total_amount: number
          special_instructions?: string | null
          admin_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          name: string
          price: number
          quantity: number
          subtotal: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          name: string
          price: number
          quantity: number
          subtotal: number
          notes?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      reservations: {
        Row: {
          id: string
          booking_ref: string
          customer_id: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string
          date: string
          time_slot: string
          party_size: number
          status: ReservationStatus
          special_requests: string | null
          table_number: number | null
          admin_notes: string | null
          reminder_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_ref: string
          customer_id?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone: string
          date: string
          time_slot: string
          party_size: number
          status?: ReservationStatus
          special_requests?: string | null
          table_number?: number | null
          admin_notes?: string | null
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['reservations']['Insert']>
      }
      gallery_images: {
        Row: {
          id: string
          url: string
          caption: string | null
          category: string
          alt_text: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          caption?: string | null
          category?: string
          alt_text?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['gallery_images']['Insert']>
      }
      chefs: {
        Row: {
          id: string
          name: string
          title: string
          bio: string | null
          photo_url: string | null
          speciality: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          bio?: string | null
          photo_url?: string | null
          speciality?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['chefs']['Insert']>
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          featured_image: string | null
          status: PostStatus
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          featured_image?: string | null
          status?: PostStatus
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          is_active?: boolean
          subscribed_at?: string
        }
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>
      }
    }
    Enums: {
      order_status: OrderStatus
      payment_method: PaymentMethod
      reservation_status: ReservationStatus
      post_status: PostStatus
    }
  }
}

// ── Enum Types ──
export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'easypaisa' | 'jazzcash' | 'cod'

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show'

export type PostStatus = 'draft' | 'published'

// ── Table Row Shortcuts ──
export type MenuCategory = Database['public']['Tables']['menu_categories']['Row']
export type MenuItem     = Database['public']['Tables']['menu_items']['Row']
export type Customer     = Database['public']['Tables']['customers']['Row']
export type Order        = Database['public']['Tables']['orders']['Row']
export type OrderItem    = Database['public']['Tables']['order_items']['Row']
export type Reservation  = Database['public']['Tables']['reservations']['Row']
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row']
export type Chef         = Database['public']['Tables']['chefs']['Row']
export type SiteSetting  = Database['public']['Tables']['site_settings']['Row']
export type BlogPost     = Database['public']['Tables']['blog_posts']['Row']
export type Subscriber   = Database['public']['Tables']['newsletter_subscribers']['Row']