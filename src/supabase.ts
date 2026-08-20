import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  'https://fsumxltthcuecvwwgwvt.supabase.co'

const supabaseAnonKey =
  'sb_publishable_22B8Q1tX5-M5rRU_sQQI2w_-gmhvAFs'

export const supabase =
  createClient(
    supabaseUrl,
    supabaseAnonKey
  )
