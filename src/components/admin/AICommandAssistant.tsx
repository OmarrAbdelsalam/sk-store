import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, X, Sparkles, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import * as aiApi from "@/api/admin/ai";
import * as uploadApi from "@/api/admin/upload";
import { extractDominantColor } from "@/lib/colorDetection";

interface AICommandAssistantProps {
  onExecuteCommand: (command: ParsedCommand) => Promise<void>;
  context: string; // e.g., "categories", "products", etc.
  existingItems?: Array<{ name_ar: string; name_en: string }>; // For duplicate checking
}

export interface ParsedCommand {
  action: "create" | "update" | "delete" | "delete_all";
  items: Array<{
    // For categories
    name_ar?: string;
    name_en?: string;
    old_name?: string;
    new_name_ar?: string;
    new_name_en?: string;
    
    // For products
    category_name?: string;
    description_ar?: string;
    description_en?: string;
    price?: number;
    new_category_name?: string;
    new_description_ar?: string;
    new_description_en?: string;
    new_price?: number;
    
    // Images with files (not uploaded yet)
    imageFiles?: Array<{ file: File; color: string; colorHex: string }>;
  }>;
}

export const AICommandAssistant = ({ onExecuteCommand, context, existingItems = [] }: AICommandAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedCommand, setParsedCommand] = useState<ParsedCommand | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [duplicateWarning, setDuplicateWarning] = useState<{ type: 'exact' | 'similar'; names: string[] } | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; preview: string; color?: string; colorHex?: string }>>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Enter key for confirmation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (parsedCommand || duplicateWarning)) {
        e.preventDefault();
        if (duplicateWarning?.type === 'exact') {
          handleCancel();
        } else {
          handleConfirm();
        }
      }
    };

    if (isOpen && (parsedCommand || duplicateWarning)) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, parsedCommand, duplicateWarning]);

  // Handle paste event for images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!isOpen || context !== "products") return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if the item is an image
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          
          const file = item.getAsFile();
          if (file) {
            if (file.size > 5 * 1024 * 1024) {
              toast({ 
                title: "خطأ", 
                description: "حجم الصورة كبير جداً (الحد الأقصى 5MB)", 
                variant: "destructive" 
              });
              return;
            }
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = async () => {
              const preview = reader.result as string;
              
              // Extract color
              try {
                const colorResult = await extractDominantColor(file);
                setUploadedImages(prev => [...prev, { 
                  file, 
                  preview, 
                  color: colorResult.name,
                  colorHex: colorResult.hex 
                }]);
                toast({ 
                  title: "تم", 
                  description: `تم لصق الصورة واستخراج اللون: ${colorResult.name}` 
                });
              } catch (error) {
                setUploadedImages(prev => [...prev, { file, preview }]);
                toast({ 
                  title: "تم", 
                  description: "تم لصق الصورة (تعذر استخراج اللون)" 
                });
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    if (isOpen) {
      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
    }
  }, [isOpen, context, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "خطأ", description: `${file.name}: حجم الصورة كبير جداً (الحد الأقصى 5MB)`, variant: "destructive" });
        continue;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = async () => {
        const preview = reader.result as string;
        
        // Extract color
        try {
          const colorResult = await extractDominantColor(file);
          setUploadedImages(prev => [...prev, { 
            file, 
            preview, 
            color: colorResult.name,
            colorHex: colorResult.hex 
          }]);
          toast({ title: "تم", description: `${file.name}: تم استخراج اللون ${colorResult.name}` });
        } catch (error) {
          setUploadedImages(prev => [...prev, { file, preview }]);
          toast({ title: "تحذير", description: `${file.name}: تعذر استخراج اللون`, variant: "default" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setUploadedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    const userInput = input;
    const images = [...uploadedImages];
    setInput("");

    try {
      // Don't upload images yet - pass them with the command
      // They will be uploaded after product creation
      
      // Clear images from UI
      clearAllImages();

      // First, check for duplicates and similar names using AI
      if (existingItems.length > 0) {
        const existingNamesStr = existingItems.map(item => `"${item.name_ar}" / "${item.name_en}"`).join(', ');
        
        const checkResponse = await aiApi.chat({
          messages: [
            {
              role: "user",
              content: `أنا في صفحة ${context}. المستخدم كتب الأمر: "${userInput}"

الأسماء الموجودة حالياً: ${existingNamesStr}

قم بتحليل الأمر أولاً:
1. إذا كان الأمر إنشاء عنصر جديد، تحقق من التشابه مع الأسماء الموجودة
2. إذا كان الاسم المطلوب موجود بالضبط، أرجع: {"duplicate": "exact", "existing": "الاسم الموجود"}
3. إذا كان الاسم المطلوب مشابه لاسم موجود (نفس المعنى أو غلط إملائي بسيط)، أرجع: {"duplicate": "similar", "existing": ["الأسماء المشابهة"]}
4. إذا كان الاسم مختلف تماماً (مثل "شنط" و "شنط كروشيه" مختلفين)، أرجع: {"duplicate": "none"}
5. إذا كان الأمر ليس إنشاء (مثل حذف أو تعديل)، أرجع: {"duplicate": "none"}

أرجع JSON فقط بدون أي نص إضافي.`
            }
          ],
          temperature: 0.3
        });

        if (checkResponse.success && checkResponse.data) {
          try {
            let checkJsonStr = checkResponse.data.message || checkResponse.data;
            if (typeof checkJsonStr === 'object') {
              checkJsonStr = JSON.stringify(checkJsonStr);
            }
            checkJsonStr = checkJsonStr.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
            
            const duplicateCheck = JSON.parse(checkJsonStr);
            
            if (duplicateCheck.duplicate === "exact") {
              setDuplicateWarning({ type: 'exact', names: [duplicateCheck.existing] });
              setLoading(false);
              return;
            } else if (duplicateCheck.duplicate === "similar") {
              // Continue to parse the command but show warning
              const similarNames = Array.isArray(duplicateCheck.existing) ? duplicateCheck.existing : [duplicateCheck.existing];
              setDuplicateWarning({ type: 'similar', names: similarNames });
            }
          } catch (e) {
            // If parsing fails, continue with normal flow
            console.log("Duplicate check parsing failed, continuing...");
          }
        }
      }

      // Send to AI to parse the command
      const response = await aiApi.chat({
        messages: [
          {
            role: "user",
            content: `أنا في صفحة ${context}. المستخدم كتب الأمر التالي: "${userInput}"

قم بتحليل الأمر وإرجاع JSON فقط بهذا الشكل:

${context === "product-edit" ? `
للتعديل (منتج):
{
  "action": "update",
  "items": [
    {
      "new_name_ar": "الاسم الجديد بالعربي (اختياري)",
      "new_name_en": "New English Name (optional)",
      "new_description_ar": "الوصف الجديد بالعربي (اختياري)",
      "new_description_en": "New English Description (optional)",
      "new_material_ar": "المادة الجديدة بالعربي (اختياري)",
      "new_material_en": "New Material (optional)",
      "new_category_name": "الفئة الجديدة (اختياري)",
      "new_price": 150.00,
      "is_active": true
    }
  ]
}

أمثلة:
- "عدل الاسم إلى سماعات بلوتوث" → new_name_ar + new_name_en
- "عدل الوصف إلى سماعات عالية الجودة" → new_description_ar + new_description_en
- "عدل المادة إلى قطن 100%" → new_material_ar + new_material_en
- "غير الفئة إلى إلكترونيات" → new_category_name
- "غير السعر إلى 299" → new_price
- "خلي المنتج نشط" → is_active: true
- "خلي المنتج غير نشط" → is_active: false
` : context === "products" ? `
للإنشاء (منتج):
{
  "action": "create",
  "items": [
    {
      "name_ar": "الاسم بالعربي",
      "name_en": "English Name",
      "category_name": "اسم الفئة (عربي أو إنجليزي)",
      "description_ar": "الوصف بالعربي (اختياري)",
      "description_en": "English Description (optional)",
      "price": 100.50
    }
  ]
}

للتعديل (منتج):
{
  "action": "update",
  "items": [
    {
      "old_name": "الاسم القديم (عربي أو إنجليزي)",
      "new_name_ar": "الاسم الجديد بالعربي",
      "new_name_en": "New English Name",
      "new_category_name": "الفئة الجديدة (اختياري)",
      "new_description_ar": "الوصف الجديد (اختياري)",
      "new_description_en": "New Description (optional)",
      "new_price": 150.00
    }
  ]
}

للحذف (منتج):
{
  "action": "delete",
  "items": [
    {
      "name_ar": "الاسم بالعربي",
      "name_en": "English Name"
    }
  ]
}
` : `
للإنشاء (فئة):
{
  "action": "create",
  "items": [
    {
      "name_ar": "الاسم بالعربي",
      "name_en": "English Name"
    }
  ]
}

للتعديل (فئة):
{
  "action": "update",
  "items": [
    {
      "old_name": "الاسم القديم (عربي أو إنجليزي)",
      "new_name_ar": "الاسم الجديد بالعربي",
      "new_name_en": "New English Name"
    }
  ]
}

للحذف (فئة):
{
  "action": "delete",
  "items": [
    {
      "name_ar": "الاسم بالعربي",
      "name_en": "English Name"
    }
  ]
}
`}

لحذف الكل:
{
  "action": "delete_all",
  "items": []
}

ملاحظات:
- إذا كان الأمر "أنشئ ${context === "products" ? "منتج" : "فئة"} ملابس وشنط" فأرجع عنصرين منفصلين
- إذا كان "امسح ${context === "products" ? "منتج" : "فئة"} ملابس" فأرجع action: "delete"
- إذا كان "امسح كل ${context === "products" ? "المنتجات" : "الفئات"}" فأرجع action: "delete_all"
- إذا كان "عدل ${context === "products" ? "منتج" : "فئة"} ملابس إلى أزياء" فأرجع action: "update" مع old_name و new_name
- إذا ذكر اسم عربي فقط، ترجمه للإنجليزي
- إذا ذكر اسم إنجليزي فقط، ترجمه للعربي
${context === "products" || context === "product-edit" ? `- إذا لم يذكر السعر، استخدم 0
- إذا لم يذكر الفئة، استخدم أول فئة متاحة
- IMPORTANT: للمنتجات، قم بتوليد وصف تسويقي احترافي بالعربي والإنجليزي (2-3 جمل) حتى لو لم يذكر المستخدم وصف
- الوصف يجب أن يكون جذاب ويبرز مميزات المنتج` : ""}
- أرجع JSON فقط بدون أي نص إضافي`
          }
        ],
        temperature: 0.3
      });

      if (response.success && response.data) {
        try {
          // Extract JSON from response - handle both direct message and nested data.message
          let jsonStr = response.data.message || response.data;
          
          // If it's already an object, use it directly
          if (typeof jsonStr === 'object') {
            jsonStr = JSON.stringify(jsonStr);
          }
          
          jsonStr = jsonStr.trim();
          
          // Remove markdown code blocks if present
          jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
          
          const parsed = JSON.parse(jsonStr) as ParsedCommand;
          
          // Validate the parsed command
          if (!parsed.action) {
            toast({ 
              title: "خطأ", 
              description: "لم أتمكن من فهم الأمر. حاول مرة أخرى.", 
              variant: "destructive" 
            });
            return;
          }
          
          // For delete_all, items can be empty
          if (parsed.action === "delete_all" || (parsed.items && parsed.items.length > 0)) {
            // Add image files to the first item if it's a create action
            if (parsed.action === "create" && parsed.items.length > 0 && images.length > 0) {
              parsed.items[0].imageFiles = images.map(img => ({
                file: img.file,
                color: img.color || '',
                colorHex: img.colorHex || ''
              }));
            }
            
            // If we already have a duplicate warning from AI check, show it
            if (duplicateWarning && parsed.action === "create") {
              setParsedCommand(parsed);
              setCurrentItemIndex(0);
            } else {
              setParsedCommand(parsed);
              setCurrentItemIndex(0);
            }
          } else {
            toast({ 
              title: "خطأ", 
              description: "لم أتمكن من فهم الأمر. حاول مرة أخرى.", 
              variant: "destructive" 
            });
          }
        } catch (error) {
          console.error("Parse error:", error);
          toast({ 
            title: "خطأ", 
            description: "فشل في تحليل الأمر. حاول صياغته بشكل أوضح.", 
            variant: "destructive" 
          });
        }
      }
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ في الاتصال", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedCommand) return;

    try {
      // Clear duplicate warning if confirming despite warning
      setDuplicateWarning(null);
      
      await onExecuteCommand(parsedCommand);
      
      // Move to next item or close
      if (currentItemIndex < parsedCommand.items.length - 1) {
        setCurrentItemIndex(currentItemIndex + 1);
      } else {
        setParsedCommand(null);
        setCurrentItemIndex(0);
        toast({ title: "تم", description: "تم تنفيذ جميع الأوامر بنجاح" });
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تنفيذ الأمر", variant: "destructive" });
    }
  };

  const handleSkip = () => {
    if (!parsedCommand) return;

    if (currentItemIndex < parsedCommand.items.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
    } else {
      setParsedCommand(null);
      setCurrentItemIndex(0);
    }
  };

  const handleCancel = () => {
    setParsedCommand(null);
    setCurrentItemIndex(0);
    setDuplicateWarning(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6b] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ff6b4a] to-[#ff8a6b] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Bot size={20} />
          <span className="font-bold">مساعد AI</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {duplicateWarning ? (
          <div className="space-y-4">
            <div className={`${duplicateWarning.type === 'exact' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'} border rounded-xl p-4`}>
              <p className={`text-sm ${duplicateWarning.type === 'exact' ? 'text-red-800' : 'text-yellow-800'} mb-2 flex items-center gap-2`}>
                <AlertTriangle size={16} />
                {duplicateWarning.type === 'exact' ? (
                  <span className="font-bold">⚠️ هذا الاسم موجود بالفعل!</span>
                ) : (
                  <span className="font-bold">⚠️ يوجد أسماء مشابهة</span>
                )}
              </p>
              
              <div className="bg-white rounded-lg p-3 space-y-2">
                {duplicateWarning.type === 'exact' ? (
                  <p className="text-sm text-gray-700">
                    الاسم <span className="font-bold">"{duplicateWarning.names[0]}"</span> موجود بالفعل. لا يمكن إنشاء عنصر بنفس الاسم.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 mb-2">
                      الأسماء التالية مشابهة للاسم المطلوب:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {duplicateWarning.names.map((name, idx) => (
                        <li key={idx} className="text-sm text-gray-600">"{name}"</li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-700 mt-3">
                      هل تريد المتابعة رغم ذلك؟
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {duplicateWarning.type === 'exact' ? (
                <Button onClick={handleCancel} className="flex-1 bg-gray-500 hover:bg-gray-600">
                  حسناً
                </Button>
              ) : (
                <>
                  <Button onClick={handleConfirm} className="flex-1 bg-green-500 hover:bg-green-600">
                    نعم، أنشئ
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    إلغاء
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : parsedCommand ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 mb-2">
                <Sparkles size={16} className="inline ml-1" />
                {parsedCommand.action === "delete_all" ? (
                  "⚠️ هل تريد حذف جميع العناصر؟"
                ) : (
                  <>
                    هل تريد {
                      parsedCommand.action === "create" ? "إنشاء" : 
                      parsedCommand.action === "update" ? "تعديل" : 
                      "حذف"
                    } هذا العنصر؟
                  </>
                )}
              </p>
              
              {parsedCommand.action !== "delete_all" && (
                <div className="bg-white rounded-lg p-3 space-y-2">
                  {parsedCommand.action === "update" ? (
                    <>
                      <p className="text-sm text-gray-500">
                        <span className="font-bold">الاسم القديم:</span> {parsedCommand.items[currentItemIndex].old_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-bold">العربي الجديد:</span> {parsedCommand.items[currentItemIndex].new_name_ar}
                      </p>
                      <p className="text-sm">
                        <span className="font-bold">English الجديد:</span> {parsedCommand.items[currentItemIndex].new_name_en}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-bold">العربي:</span> {parsedCommand.items[currentItemIndex].name_ar}
                      </p>
                      <p className="text-sm">
                        <span className="font-bold">English:</span> {parsedCommand.items[currentItemIndex].name_en}
                      </p>
                    </>
                  )}
                </div>
              )}
              
              {parsedCommand.action !== "delete_all" && (
                <p className="text-xs text-gray-500 mt-2">
                  ({currentItemIndex + 1} من {parsedCommand.items.length})
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleConfirm} 
                className={`flex-1 ${
                  parsedCommand.action === "delete" || parsedCommand.action === "delete_all" 
                    ? "bg-red-500 hover:bg-red-600" 
                    : parsedCommand.action === "update"
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {parsedCommand.action === "delete_all" ? "حذف الكل" : "تنفيذ"}
              </Button>
              {parsedCommand.action !== "delete_all" && (
                <>
                  <Button onClick={handleSkip} variant="outline" className="flex-1">
                    تخطي
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="px-3">
                    <X size={16} />
                  </Button>
                </>
              )}
              {parsedCommand.action === "delete_all" && (
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  إلغاء
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2 text-xs text-gray-600">
              <p className="font-bold text-gray-800">أمثلة:</p>
              {context === "product-edit" ? (
                <>
                  <p>• "عدل الاسم إلى سماعات بلوتوث"</p>
                  <p>• "عدل الوصف إلى سماعات عالية الجودة مع صوت نقي"</p>
                  <p>• "عدل المادة إلى قطن 100%"</p>
                  <p>• "غير الفئة إلى إلكترونيات"</p>
                  <p>• "غير السعر إلى 299"</p>
                  <p>• "خلي المنتج نشط"</p>
                  <p>• "خلي المنتج غير نشط"</p>
                </>
              ) : context === "products" ? (
                <>
                  <p>• "أنشئ منتج سماعات لاسلكية بسعر 299 في فئة إلكترونيات"</p>
                  <p>• "عدل منتج سماعات إلى سماعات بلوتوث"</p>
                  <p>• "امسح منتج سماعات"</p>
                  <p>• "امسح كل المنتجات"</p>
                </>
              ) : (
                <>
                  <p>• "أنشئ فئة ملابس"</p>
                  <p>• "عدل فئة ملابس إلى أزياء"</p>
                  <p>• "امسح فئة شنط"</p>
                  <p>• "امسح كل الفئات"</p>
                </>
              )}
            </div>

            {/* Images Preview */}
            {uploadedImages.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">الصور ({uploadedImages.length})</span>
                  <button
                    onClick={clearAllImages}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    حذف الكل
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img.preview} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-20 object-cover rounded-lg border-2 border-gray-200" 
                      />
                      {img.color && (
                        <div 
                          className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-xs font-medium text-white shadow-sm"
                          style={{ backgroundColor: img.colorHex }}
                        >
                          {img.color}
                        </div>
                      )}
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {context === "products" && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="rounded-xl"
                    disabled={loading}
                    title="إضافة صور (يمكنك اختيار عدة صور)"
                  >
                    <ImageIcon size={18} />
                  </Button>
                </>
              )}
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
                placeholder="اكتب أمرك هنا..."
                className="rounded-xl flex-1"
                disabled={loading}
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()} className="bg-[#ff6b4a] hover:bg-[#ff5a3a] rounded-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
