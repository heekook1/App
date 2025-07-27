import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://olwicbbmmokcvlqcrkqn.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sd2ljYmJtbW9rY3ZscWNya3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDU3NDUsImV4cCI6MjA2Nzk4MTc0NX0.0yg_n6aOfLnd3d3y_jYkZVPNIniYvaOVAewW9ERALNo'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Document {
  id: string
  name: string
  content: string
  file_type: string
  file_size: number
  created_at: string
  updated_at: string
}