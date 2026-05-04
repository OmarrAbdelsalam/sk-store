// Admin AI API for frontend-only store
// Mock AI functionality for demo purposes

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  data?: any; // For compatibility with existing code
  error?: string;
}

// Mock AI chat function
export const chat = async (request: ChatRequest): Promise<ChatResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const userMessage = request.messages.find(m => m.role === 'user')?.content || '';
    
    // Simple mock responses based on keywords
    if (userMessage.includes('duplicate') || userMessage.includes('similar')) {
      const responseData = {
        hasDuplicates: false,
        duplicateType: null,
        duplicateNames: []
      };
      return {
        success: true,
        message: JSON.stringify(responseData),
        data: responseData
      };
    }
    
    // Mock command parsing
    if (userMessage.includes('create') || userMessage.includes('add')) {
      const responseData = {
        action: 'create',
        items: [{
          name_ar: 'عنصر جديد',
          name_en: 'New Item',
          description_ar: 'وصف العنصر الجديد',
          description_en: 'New item description',
          price: 100
        }]
      };
      return {
        success: true,
        message: JSON.stringify(responseData),
        data: responseData
      };
    }
    
    if (userMessage.includes('update') || userMessage.includes('edit')) {
      const responseData = {
        action: 'update',
        items: [{
          old_name: 'Old Item',
          new_name_ar: 'عنصر محدث',
          new_name_en: 'Updated Item'
        }]
      };
      return {
        success: true,
        message: JSON.stringify(responseData),
        data: responseData
      };
    }
    
    if (userMessage.includes('delete') || userMessage.includes('remove')) {
      const responseData = {
        action: 'delete',
        items: [{
          name_ar: 'عنصر للحذف',
          name_en: 'Item to Delete'
        }]
      };
      return {
        success: true,
        message: JSON.stringify(responseData),
        data: responseData
      };
    }
    
    // Default response
    const responseData = {
      action: 'create',
      items: []
    };
    return {
      success: true,
      message: JSON.stringify(responseData),
      data: responseData
    };
    
  } catch (error) {
    console.error('AI API error:', error);
    return {
      success: false,
      error: 'حدث خطأ في معالجة الطلب'
    };
  }
};