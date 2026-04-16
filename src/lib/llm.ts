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

const systemPrompt = `Ban la tro ly ao cua Green Store - cua hang chuyen cung cap nong san Viet.
Nhiem vu:
1. Khi khach hoi ve san pham, gia ca, danh muc, ngan sach, khoang gia hoac muon xem goi y mua hang, hay goi tool de lay du lieu thuc.
2. Neu tin nhan hien tai la cau noi tiep tu ngu canh truoc do, hay su dung lich su hoi thoai de suy ra nhu cau va tiep tuc goi tool. Khong tra loi chung chung khi co the truy van du lieu that.
3. Khong bia so lieu hoac san pham. Neu thieu thong tin va khong the suy ra tu lich su, hay hoi lai khach hang mot cau ngan gon.
4. Tra loi toi da 5 san pham. Neu san pham dang giam gia, uu tien hien thi gia giam.
5. Tra loi than thien, lich su va huu ich.`;

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
      model: 'gemini-2.5-flash-lite',
      tools: [{ functionDeclarations: tools as never }],
    });

    const chat = model.startChat();
    const conversationContext = buildConversationContext(conversationHistory);
    const prompt = conversationContext
      ? `${systemPrompt}\n\nLich su hoi thoai gan day:\n${conversationContext}\n\nTin nhan moi nhat cua khach hang: ${message}`
      : `${systemPrompt}\n\nKhach hang: ${message}`;

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
