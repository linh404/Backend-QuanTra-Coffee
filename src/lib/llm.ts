import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const tools = [
  {
    name: 'search_products',
    description: 'Search for products with filters like name, category, price range, stock status',
    parameters: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Search query for product name' },
        category_id: { type: 'string', description: 'Category ID to filter by' },
        category_name: { type: 'string', description: 'Category name to filter by' },
        price_min: { type: 'number', description: 'Minimum price' },
        price_max: { type: 'number', description: 'Maximum price' },
        in_stock_only: { type: 'boolean', description: 'Only show in-stock products' },
        page: { type: 'number', description: 'Page number for pagination' },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get detailed information about a specific product by ID',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'number', description: 'Product ID' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'compare_products',
    description: 'Compare multiple products by their IDs',
    parameters: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'number' }, description: 'Array of product IDs to compare' },
      },
      required: ['ids'],
    },
  },
  {
    name: 'get_similar',
    description: 'Get similar products based on a product ID (same category)',
    parameters: {
      type: 'object',
      properties: {
        product_id: { type: 'number', description: 'Product ID to find similar items for' },
        limit: { type: 'number', description: 'Maximum number of results' },
      },
      required: ['product_id'],
    },
  },
  {
    name: 'list_by_category',
    description: 'List products by category ID or category name',
    parameters: {
      type: 'object',
      properties: {
        category_id: { type: 'string', description: 'Category ID' },
        category_name: { type: 'string', description: 'Category name' },
        page: { type: 'number', description: 'Page number' },
      },
    },
  },
  {
    name: 'list_promotions',
    description: 'List products on sale/promotion',
    parameters: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number' },
      },
    },
  },
  {
    name: 'get_order_status',
    description: 'Get the status of an order by order ID',
    parameters: {
      type: 'object',
      properties: {
        order_id: { type: 'number', description: 'Order ID' },
      },
      required: ['order_id'],
    },
  },
];

const CAFE_NAME = process.env.CAFE_NAME || "Quán Trà Coffee";
const CAFE_ADDRESS = process.env.CAFE_ADDRESS || "Đang cập nhật";
const CAFE_HOURS = process.env.CAFE_HOURS || "Đang cập nhật";
const CAFE_HOTLINE = process.env.CAFE_HOTLINE || "Đang cập nhật";
const CAFE_WIFI = process.env.CAFE_WIFI || "Đang cập nhật";
const CAFE_DELIVERY_POLICY = process.env.CAFE_DELIVERY_POLICY || "Đang cập nhật";
const CAFE_PAYMENT_METHODS = process.env.CAFE_PAYMENT_METHODS || "Đang cập nhật";
const CAFE_EVENTS_POLICY = process.env.CAFE_EVENTS_POLICY || "Đang cập nhật";

const systemPrompt = `Bạn là trợ lý ảo của ${CAFE_NAME} - cửa hàng chuyên cung cấp cà phê chất lượng cao, trà và các thiết bị pha chế.
Nhiệm vụ:
1. Khi khách hỏi về sản phẩm, giá cả, danh mục, ngân sách, hoặc muốn xem gợi ý mua hàng, BẠN PHẢI GỌI TOOL NGAY LẬP TỨC để lấy dữ liệu. TUYỆT ĐỐI KHÔNG trả lời các câu như "Vui lòng đợi một chút để tôi kiểm tra..." mà hãy thực hiện gọi tool luôn.
2. Nếu tin nhắn hiện tại liên quan đến ngữ cảnh trước đó, hãy sử dụng lịch sử hội thoại để suy ra nhu cầu và tiếp tục gọi tool. Không trả lời chung chung khi có thể truy vấn dữ liệu thật.
3. Không tự bịa số liệu hoặc sản phẩm. Nếu thiếu thông tin, hãy hỏi lại khách hàng một cách ngắn gọn.
4. Ưu tiên hiển thị tối đa 5 sản phẩm. Nếu sản phẩm đang giảm giá, hãy nhấn mạnh giá giảm.
5. Trả lời thân thiện, lịch sự và chuyên nghiệp theo phong cách phục vụ của ${CAFE_NAME}.

THÔNG TIN PHỔ BIẾN VỀ ${CAFE_NAME.toUpperCase()} (Dùng để trả lời trực tiếp không cần gọi tool):
- Địa chỉ quán: ${CAFE_ADDRESS}
- Giờ mở cửa: ${CAFE_HOURS}
- Hotline liên hệ: ${CAFE_HOTLINE}
- Wifi tại quán: ${CAFE_WIFI}
- Chính sách giao hàng: ${CAFE_DELIVERY_POLICY}
- Thanh toán: ${CAFE_PAYMENT_METHODS}
- Nhận đặt tiệc/sự kiện: ${CAFE_EVENTS_POLICY}`;

type ConversationMessage = {
  role: 'user' | 'assistant';
  text: string;
};

type FunctionCallResult = {
  name: string;
  args: Record<string, unknown>;
};

function buildConversationContext(conversationHistory: ConversationMessage[]) {
  if (!conversationHistory.length) {
    return '';
  }

  return conversationHistory
    .map((entry) => `${entry.role === 'user' ? 'Khach hang' : 'Tro ly'}: ${entry.text}`)
    .join('\n');
}

export async function callGemini(message: string, conversationHistory: ConversationMessage[] = []) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[LLM] GEMINI_API_KEY not set');
    return {
      type: 'text',
      text: 'LLM key missing; configure GEMINI_API_KEY in the environment.',
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
      systemInstruction: {
        role: "system",
        parts: [{ text: systemPrompt }]
      },
      tools: [{ functionDeclarations: tools as never }],
    });

    const chat = model.startChat();
    const conversationContext = buildConversationContext(conversationHistory);
    const prompt = conversationContext
      ? `Lịch sử hội thoại gần đây:\n${conversationContext}\n\nTin nhắn mới nhất của khách hàng: ${message}`
      : `Khách hàng: ${message}`;

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const functionCalls = response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      return {
        type: 'function_call',
        functionCalls: (functionCalls as FunctionCallResult[]).map((fc) => ({
          name: fc.name,
          args: fc.args,
        })),
      };
    }

    return {
      type: 'text',
      text: response.text(),
    };
  } catch (err: unknown) {
    console.error('[LLM] error calling Gemini:', err);
    return {
      type: 'text',
      text: 'Xin loi, khong the ket noi toi dich vu LLM. Vui long thu lai sau.',
    };
  }
}
