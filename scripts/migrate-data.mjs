import { createClient } from '@supabase/supabase-js';

const oldSupabaseUrl = 'https://toptqsenwejwgfkdjqer.supabase.co';
const oldSupabaseKey = 'sb_publishable_9t6cZmUqWmUFJpjF8TCpHw_EgXwoWHl';

const newSupabaseUrl = 'https://xffapcwfptfxbrzqkngg.supabase.co';
const newSupabaseKey = 'sb_publishable_a7BsMdzeQ-H26m_KzxXLpQ_oxS97nLn';

const oldClient = createClient(oldSupabaseUrl, oldSupabaseKey);
const newClient = createClient(newSupabaseUrl, newSupabaseKey);

const tables = [
  'categories',
  'colors',
  'products',
  'product_images',
  'product_colors',
  'product_related',
  'orders',
  'order_items',
  'cart_sessions',
  'hero_settings',
  'mobile_hero_settings',
  'customer_love',
  'more_to_discover',
  'our_vibes',
  'marquee_settings',
  'marquee_items',
  'banner_settings'
];

async function migrateData() {
  console.log('Starting data migration...');

  for (const table of tables) {
    console.log(`\nMigrating table: ${table}...`);
    
    // 1. Fetch from old
    let allData = [];
    let page = 0;
    const limit = 1000;
    let hasMore = true;
    
    try {
      while (hasMore) {
        const { data, error } = await oldClient
          .from(table)
          .select('*')
          .range(page * limit, (page + 1) * limit - 1);
          
        if (error) {
          if (error.code === 'PGRST116' || error.code === '42P01') {
             console.log(`Table ${table} does not exist in old project or is not accessible. Skipping.`);
             hasMore = false;
             break;
          }
          throw error;
        }
        
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          page++;
        } else {
          hasMore = false;
        }
      }

      if (allData.length === 0) {
        console.log(`No data found in ${table}.`);
        continue;
      }

      console.log(`Fetched ${allData.length} rows from ${table}. Inserting into new project...`);

      // 2. Insert to new
      // We insert in chunks to avoid payload too large errors
      const chunkSize = 500;
      for (let i = 0; i < allData.length; i += chunkSize) {
        const chunk = allData.slice(i, i + chunkSize);
        
        const { error: insertError } = await newClient
          .from(table)
          .upsert(chunk);
          
        if (insertError) {
          console.error(`Error inserting into ${table}:`, insertError);
          // Don't throw so we can try other tables
        } else {
          console.log(`Inserted ${chunk.length} rows into ${table}.`);
        }
      }
      
    } catch (e) {
      console.error(`Error processing table ${table}:`, e.message);
    }
  }

  console.log('\nMigration script completed!');
}

migrateData();
