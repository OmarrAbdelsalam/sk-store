import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

const colors = [
  { name_en: 'Black', name_ar: 'أسود', hex_code: '#000000' },
  { name_en: 'White', name_ar: 'أبيض', hex_code: '#FFFFFF' },
  { name_en: 'Red', name_ar: 'أحمر', hex_code: '#FF0000' },
  { name_en: 'Blue', name_ar: 'أزرق', hex_code: '#0000FF' },
  { name_en: 'Green', name_ar: 'أخضر', hex_code: '#00FF00' },
  { name_en: 'Yellow', name_ar: 'أصفر', hex_code: '#FFFF00' },
  { name_en: 'Orange', name_ar: 'برتقالي', hex_code: '#FFA500' },
  { name_en: 'Purple', name_ar: 'بنفسجي', hex_code: '#800080' },
  { name_en: 'Pink', name_ar: 'وردي', hex_code: '#FFC0CB' },
  { name_en: 'Brown', name_ar: 'بني', hex_code: '#A52A2A' },
  { name_en: 'Gray', name_ar: 'رمادي', hex_code: '#808080' },
  { name_en: 'Silver', name_ar: 'فضي', hex_code: '#C0C0C0' },
  { name_en: 'Gold', name_ar: 'ذهبي', hex_code: '#FFD700' },
  { name_en: 'Beige', name_ar: 'بيج', hex_code: '#F5F5DC' },
  { name_en: 'Navy', name_ar: 'كحلي', hex_code: '#000080' },
  { name_en: 'Teal', name_ar: 'أزرق مخضر', hex_code: '#008080' },
  { name_en: 'Maroon', name_ar: 'عنابي', hex_code: '#800000' },
  { name_en: 'Olive', name_ar: 'زيتي', hex_code: '#808000' },
  { name_en: 'Cyan', name_ar: 'سماوي', hex_code: '#00FFFF' },
  { name_en: 'Magenta', name_ar: 'أرجواني', hex_code: '#FF00FF' },
  { name_en: 'Turquoise', name_ar: 'فيروزي', hex_code: '#40E0D0' },
  { name_en: 'Lavender', name_ar: 'لافندر', hex_code: '#E6E6FA' },
  { name_en: 'Coral', name_ar: 'مرجاني', hex_code: '#FF7F50' },
  { name_en: 'Salmon', name_ar: 'سلموني', hex_code: '#FA8072' },
  { name_en: 'Khaki', name_ar: 'كاكي', hex_code: '#F0E68C' },
  { name_en: 'Plum', name_ar: 'برقوقي', hex_code: '#DDA0DD' },
  { name_en: 'Orchid', name_ar: 'أوركيد', hex_code: '#DA70D6' },
  { name_en: 'Crimson', name_ar: 'قرمزي', hex_code: '#DC143C' },
  { name_en: 'Indigo', name_ar: 'نيلي', hex_code: '#4B0082' },
  { name_en: 'Ivory', name_ar: 'عاجي', hex_code: '#FFFFF0' },
  { name_en: 'Mint', name_ar: 'نعناعي', hex_code: '#98FF98' },
  { name_en: 'Peach', name_ar: 'خوخي', hex_code: '#FFE5B4' },
  { name_en: 'Rose', name_ar: 'وردي داكن', hex_code: '#FF007F' },
  { name_en: 'Ruby', name_ar: 'ياقوتي', hex_code: '#E0115F' },
  { name_en: 'Sapphire', name_ar: 'ياقوت أزرق', hex_code: '#0F52BA' },
  { name_en: 'Emerald', name_ar: 'زمردي', hex_code: '#50C878' },
  { name_en: 'Amber', name_ar: 'كهرماني', hex_code: '#FFBF00' },
  { name_en: 'Rust', name_ar: 'صدئ', hex_code: '#B7410E' },
  { name_en: 'Chocolate', name_ar: 'شوكولاتة', hex_code: '#D2691E' },
  { name_en: 'Charcoal', name_ar: 'فحمي', hex_code: '#36454F' },
  { name_en: 'Slate', name_ar: 'أردوازي', hex_code: '#708090' },
  { name_en: 'Bronze', name_ar: 'برونزي', hex_code: '#CD7F32' },
  { name_en: 'Copper', name_ar: 'نحاسي', hex_code: '#B87333' },
  { name_en: 'Brass', name_ar: 'نحاس أصفر', hex_code: '#B5A642' },
  { name_en: 'Champagne', name_ar: 'شامبين', hex_code: '#F7E7CE' },
  { name_en: 'Cream', name_ar: 'كريمي', hex_code: '#FFFDD0' },
  { name_en: 'Mustard', name_ar: 'خردلي', hex_code: '#FFDB58' },
  { name_en: 'Burgundy', name_ar: 'عنابي داكن', hex_code: '#800020' },
  { name_en: 'Fuchsia', name_ar: 'فوشيا', hex_code: '#FF00FF' },
  { name_en: 'Lilac', name_ar: 'ليلكي', hex_code: '#C8A2C8' },
  { name_en: 'Mauve', name_ar: 'بنفسجي باهت', hex_code: '#E0B0FF' },
  { name_en: 'Baby Blue', name_ar: 'أزرق فاتح', hex_code: '#89CFF0' },
  { name_en: 'Royal Blue', name_ar: 'أزرق ملكي', hex_code: '#4169E1' },
  { name_en: 'Aqua', name_ar: 'مائي', hex_code: '#00FFFF' },
  { name_en: 'Lime', name_ar: 'ليموني', hex_code: '#BFFF00' },
  { name_en: 'Forest Green', name_ar: 'أخضر غامق', hex_code: '#228B22' },
  { name_en: 'Cherry', name_ar: 'كرزي', hex_code: '#DE3163' },
  { name_en: 'Mahogany', name_ar: 'ماهوجني', hex_code: '#C04000' },
  { name_en: 'Tangerine', name_ar: 'يوسفي', hex_code: '#F28500' },
  { name_en: 'Apricot', name_ar: 'مشمشي', hex_code: '#FBCEB1' },
  { name_en: 'Sand', name_ar: 'رملي', hex_code: '#C2B280' },
  { name_en: 'Taupe', name_ar: 'رمادي داكن', hex_code: '#483C32' },
  { name_en: 'Aubergine', name_ar: 'باذنجاني', hex_code: '#472C4C' },
  { name_en: 'Camel', name_ar: 'جملي', hex_code: '#C19A6B' },
  { name_en: 'Terracotta', name_ar: 'قرميدي', hex_code: '#E2725B' },
  { name_en: 'Vanilla', name_ar: 'فانيلا', hex_code: '#F3E5AB' },
  { name_en: 'Pearl', name_ar: 'لؤلؤي', hex_code: '#EAE0C8' },
  { name_en: 'Platinum', name_ar: 'بلاتيني', hex_code: '#E5E4E2' },
  { name_en: 'Steel', name_ar: 'فولاذي', hex_code: '#4682B4' },
  { name_en: 'Dusty Pink', name_ar: 'وردي مغبر', hex_code: '#DCAE96' },
  { name_en: 'Blush', name_ar: 'أحمر خدود', hex_code: '#DE5D83' },
  { name_en: 'Seafoam', name_ar: 'رغوة البحر', hex_code: '#9FE2BF' },
  { name_en: 'Denim', name_ar: 'جينز', hex_code: '#1560BD' },
  { name_en: 'Sky Blue', name_ar: 'أزرق سماوي', hex_code: '#87CEEB' },
  { name_en: 'Cerulean', name_ar: 'سماوي داكن', hex_code: '#007BA7' },
  { name_en: 'Jade', name_ar: 'يشم', hex_code: '#00A86B' },
  { name_en: 'Pistachio', name_ar: 'فستقي', hex_code: '#93C572' },
  { name_en: 'Saffron', name_ar: 'زعفراني', hex_code: '#F4C430' },
  { name_en: 'Amethyst', name_ar: 'جمشت', hex_code: '#9966CC' },
  { name_en: 'Wine', name_ar: 'نبيذي', hex_code: '#722F37' }
];

async function seedColors() {
  console.log(`Inserting ${colors.length} colors...`);
  const { data, error } = await supabase.from('colors').insert(colors).select();
  if (error) {
    console.error('Error inserting colors:', error);
  } else {
    console.log('Successfully inserted colors!', data?.length);
  }
}

seedColors();
