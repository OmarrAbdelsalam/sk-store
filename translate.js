const fs = require('fs');
const path = require('path');

const dict = {
  'الActions': 'Actions',
  'إدخال': 'In',
  'إخراج': 'Out',
  'رئيسية': 'Main',
  'جديدة': 'New',
  'اختر اللون': 'Select Color',
  'خطأ': 'Error',
  'تم الSave': 'Saved',
  'تم Save إعدادات البانر بنجاح': 'Banner settings saved successfully',
  'فشل في تحميل إعدادات البانر': 'Failed to load banner settings',
  'فشل في Save إعدادات البانر': 'Failed to save banner settings',
  'تم التفعيل': 'Activated',
  'تم الإيقاف': 'Deactivated',
  'فشل في تغيير حالة البانر': 'Failed to change banner state',
  'تمت الإضافة': 'Added',
  'تمت إضافة العنصر بنجاح': 'Item added successfully',
  'فشل في إضافة العنصر': 'Failed to add item',
  'تم الحذف': 'Deleted',
  'تم حذف العنصر بنجاح': 'Item deleted successfully',
  'فشل في حذف العنصر': 'Failed to delete item',
  'تم Save إعدادات Marquee': 'Marquee settings saved successfully',
  'فشل في Save Settings': 'Failed to save settings',
  'إدارة نص Top Banner في المتجر': 'Manage Top Banner text in the store',
  'إدارة البانر وMarquee في المتجر': 'Manage Banner and Marquee in the store',
  'Save البانر': 'Save Banner',
  'البانر الرئيسي': 'Main Banner',
  'النص الثابت في أعلى الصفحة': 'Static text at the top of the page',
  'يظهر للزوار': 'Visible to visitors',
  'مخفي': 'Hidden',
  'الجمل المتحركة أسفل البانر الرئيسي': 'Moving sentences below the main banner',
  'Preview الشريط': 'Preview Marquee',
  'ألوان الشريط': 'Marquee Colors',
  'الخلفية': 'Background',
  'النص': 'Text',
  'العناصر': 'Items',
  'لا توجد عناصر': 'No items',
  'أضف عناصر جديدة لتظهر في الشريط': 'Add new items to appear in the marquee',
  'غير متاحة في النسخة التجريبية': 'not available in trial version',
  'تعديل Product': 'Edit Product',
  'تعديل Productات غير متاح في النسخة التجريبية': 'Editing products is not available in trial version',
  'يرجى رفع صورة': 'Please upload an image',
  'يرجى إدخال اسم العميل': 'Please enter customer name',
  'فشل رفع الصورة': 'Failed to upload image',
  'تم تحديث التقييم بنجاح': 'Review updated successfully',
  'تم إضافة التقييم بنجاح': 'Review added successfully',
  'تم الإخفاء': 'Hidden',
  'تم الإظهار': 'Visible',
  'فشل في تغيير الحالة': 'Failed to change status',
  'إدارة تقييمات وصور العملاء التي تظهر في الصفحة الرئيسية': 'Manage customer reviews and images shown on homepage',
  'أضف تقييمات العملاء لتظهر في الصفحة الرئيسية': 'Add customer reviews to show on homepage',
  'مميز': 'Featured',
  'إضافة تقييم جديد': 'Add New Review',
  'صورة العميل': 'Customer Image',
  'حتى': 'Up to',
  'مثال': 'Example',
  'تمييز هذا التقييم': 'Highlight this review',
  'هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء': 'Are you sure you want to delete this review? This action cannot be undone',
  'فشل في تحميل الألوان': 'Failed to load colors',
  'لا يمكن إضافة أو تعديل الألوان': 'Cannot add or edit colors',
  'لا يمكن حذف الألوان': 'Cannot delete colors',
  'لون متاح': 'Available Color',
  'ابحث بالعربي أو الإنجليزي': 'Search',
  'لا توجد نتائج': 'No results',
  'جرب البحث بكلمات أخرى': 'Try searching with other words',
  'هذه الميزة غير متاحة في النسخة التجريبية': 'This feature is not available in the trial version',
  'تم تحويل المتجر إلى': 'Store converted to',
  'مع الاحتفاظ بوظائف': 'while keeping functions of',
  'فقط': 'only',
  'النسخة التجريبية': 'Trial Version',
  'يمكنك استخدام وظائف': 'You can use functions',
  'لرفع الملفات فقط': 'to upload files only',
  'العودة للوحة التحكم': 'Back to Dashboard',
  'إدارة وتعديل الكوبونات والخصومات': 'Manage and edit coupons and discounts',
  'فشل في تحميل الفئات': 'Failed to load categories',
  'يرجى إدخال اسم الفئة': 'Please enter category name',
  'تم تحديث الفئة بنجاح': 'Category updated successfully',
  'تم إنشاء الفئة بنجاح': 'Category created successfully',
  'فشل في حفظ الترتيب': 'Failed to save order',
  'إضافة وتعديل وترتيب تصنيفات المنتجات': 'Add, edit and order product categories',
  'قم بإضافة فئات جديدة لتظهر في المتجر': 'Add new categories to appear in the store',
  'اضغط لرفع صورة': 'Click to upload image',
  'تغيير الصورة': 'Change Image',
  'هل أنت متأكد من رغبتك في حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء، وقد يؤثر على المنتجات المرتبطة بها': 'Are you sure you want to delete this category? This cannot be undone and may affect linked products',
  'الصور': 'Images',
  'إضافة صور': 'Add Images',
  'يمكنك اختيار عدة صور': 'You can select multiple images',
  'اكتب أمرك هنا': 'Type your command here',
  'ناجح': 'Success',
  'معلومات': 'Info',
  'نشط': 'Active',
  'منتهي': 'Expired',
  'متوفر': 'In Stock',
  'منخفض': 'Low Stock',
  'نفذ': 'Out of Stock',
  'مدفوعة': 'Paid',
  'قيد الانتظار': 'Pending',
  'متأخرة': 'Overdue',
  'طلب': 'Order',
  'لا توجد طلبات': 'No orders',
  'تخطي': 'Skip',
  'تنفيذ': 'Execute',
  'حذف الكل': 'Delete All',
  'من': 'from',
  'العربي': 'Arabic',
  'الجديد': 'New',
  'العربي الجديد': 'New Arabic',
  'هذا العنصر؟': 'this item?',
  'حذف': 'Delete',
  'تعديل': 'Edit',
  'إنشاء': 'Create',
  'هل تريد': 'Do you want to',
  'هل تريد حذف جميع العناصر؟': 'Do you want to delete all items?',
  'إلغاء': 'Cancel',
  'نعم، أنشئ': 'Yes, create',
  'حسناً': 'OK',
  'هل تريد المتابعة رغم ذلك؟': 'Do you want to continue anyway?',
  'الأسماء التالية مشابهة للاسم المطلوب': 'The following names are similar to the requested name',
  'لا يمكن إنشاء عنصر بنفس الاسم': 'Cannot create item with the same name',
  'موجود بالفعل': 'Already exists',
  'يوجد أسماء مشابهة': 'Similar names exist',
  'هذا الاسم موجود بالفعل': 'This name already exists'
};

function processFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processFiles(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [ar, en] of Object.entries(dict)) {
        if (content.includes(ar)) {
          content = content.split(ar).join(en);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processFiles('src/components/admin');
console.log('Translation complete');
