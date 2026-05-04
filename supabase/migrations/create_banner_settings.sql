-- Banner Settings Table
-- هذا الجدول لإدارة نص البانر العلوي في المتجر

-- إنشاء الجدول
CREATE TABLE IF NOT EXISTS banner_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_ar TEXT NOT NULL,
  text_en TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة بانر افتراضي
INSERT INTO banner_settings (text_ar, text_en, is_active, background_color, text_color)
VALUES (
  'شحن مجاني للطلبات فوق 500 جنيه',
  'Free Shipping on Orders Over 500 EGP',
  true,
  '#000000',
  '#ffffff'
);

-- منح الصلاحيات للقراءة للجميع
ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة - الجميع يمكنهم قراءة البانر النشط
CREATE POLICY "Allow public read access" ON banner_settings
  FOR SELECT
  USING (is_active = true);

-- سياسة الكتابة - المستخدمين المصادق عليهم فقط
CREATE POLICY "Allow authenticated write access" ON banner_settings
  FOR ALL
  USING (auth.role() = 'authenticated');

-- أو إذا كنت تريد السماح للجميع بالقراءة والكتابة (للتطوير):
-- DROP POLICY IF EXISTS "Allow public read access" ON banner_settings;
-- DROP POLICY IF EXISTS "Allow authenticated write access" ON banner_settings;
-- CREATE POLICY "Public access" ON banner_settings FOR ALL USING (true) WITH CHECK (true);

-- ╔════════════════════════════════════════════════════════════════════════════╗
-- ║  ملاحظة: قم بتشغيل هذا الـ SQL في Supabase SQL Editor                      ║
-- ║  1. افتح Supabase Dashboard                                                ║
-- ║  2. اذهب إلى SQL Editor                                                    ║
-- ║  3. الصق هذا الكود واضغط Run                                               ║
-- ╚════════════════════════════════════════════════════════════════════════════╝
