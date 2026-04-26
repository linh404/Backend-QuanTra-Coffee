import { NextResponse, NextRequest } from 'next/server';
import { callGemini } from '@/lib/llm';
import { sql } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth-utils';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history, sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
    }

    // Identify user and session
    const user = await getUserFromToken(request);
    const userId = user?.userId || 0;
    const currentSessionId = sessionId || crypto.randomUUID();

    // 1. Save User Message to DB
    try {
      await sql`
        INSERT INTO ai_chat_history (session_id, user_id, role, message_text)
        VALUES (${currentSessionId}, ${userId}, 'user', ${message})
      `;
    } catch (dbErr) {
      console.error('[Chat] DB Error saving user message:', dbErr);
    }

    const conversationHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              (item.role === 'user' || item.role === 'assistant') &&
              typeof item.text === 'string' &&
              item.text.trim().length > 0
          )
          .slice(-8)
      : [];

    // Call Gemini LLM
    const llmResponse = await callGemini(message, conversationHistory);

    let finalReply = '';
    let finalProducts = undefined;
    let finalMeta = undefined;
    let relatedProductId = null;

    // Handle function calls
    if (llmResponse.type === 'function_call' && llmResponse.functionCalls && llmResponse.functionCalls.length > 0) {
      const functionCall = llmResponse.functionCalls[0];
      const { name, args } = functionCall;

      console.log(`[Chat] Tool: ${name}, Args:`, args);

      let products = [];
      let reply = '';

      try {
        // Route to appropriate internal API
        switch (name) {
          case 'search_products': {
            const params = new URLSearchParams();
            if (args.q && typeof args.q === 'string') params.set('q', args.q.trim());
            if (args.category_id) params.set('category_id', String(args.category_id));
            if (args.category_name && typeof args.category_name === 'string') params.set('category_name', args.category_name.trim());
            if (args.price_min != null && !isNaN(Number(args.price_min))) params.set('price_min', String(args.price_min));
            if (args.price_max != null && !isNaN(Number(args.price_max))) params.set('price_max', String(args.price_max));
            if (args.in_stock_only) params.set('in_stock_only', 'true');
            if (args.page != null && !isNaN(Number(args.page))) params.set('page', String(args.page));

            const searchRes = await fetch(`${getBaseUrl()}/api/products/search?${params.toString()}`);
            const searchData = await searchRes.json();
            products = Array.isArray(searchData) ? searchData : (searchData.data || []);
            reply = products.length > 0 
              ? `Tôi tìm thấy ${products.length} sản phẩm phù hợp với yêu cầu của bạn:` 
              : 'Rất tiếc, hiện tại tôi chưa tìm thấy sản phẩm nào hoàn toàn phù hợp. Bạn có muốn xem các sản phẩm tương tự không?';
            break;
          }

          case 'get_product': {
            if (!args.product_id || isNaN(Number(args.product_id))) {
               reply = 'Vui lòng cung cấp mã sản phẩm hợp lệ.';
               break;
            }
            const productRes = await fetch(`${getBaseUrl()}/api/products/detail?id=${args.product_id}`);
            const product = await productRes.json();
            if (product && product.id) {
              products = [product];
              relatedProductId = product.id;
              reply = `Đây là thông tin chi tiết về ${product.name}:`;
            } else {
              reply = 'Tôi không tìm thấy thông tin chi tiết cho sản phẩm này.';
            }
            break;
          }

          case 'compare_products': {
            const ids = (args.ids as number[]).join(',');
            const compareRes = await fetch(`${getBaseUrl()}/api/products/compare?ids=${ids}`);
            products = await compareRes.json();
            reply = products.length > 0 
              ? `Đây là bảng so sánh các sản phẩm bạn quan tâm:` 
              : 'Không thể thực hiện so sánh vào lúc này.';
            break;
          }

          case 'get_similar': {
            if (!args.product_id || isNaN(Number(args.product_id))) {
               reply = 'Vui lòng cung cấp mã sản phẩm hợp lệ để tìm sản phẩm tương tự.';
               break;
            }
            const params = new URLSearchParams({
              productId: String(args.product_id),
              limit: String(args.limit && !isNaN(Number(args.limit)) ? args.limit : 5),
            });
            const similarRes = await fetch(`${getBaseUrl()}/api/products/similar?${params.toString()}`);
            products = await similarRes.json();
            reply = products.length > 0 
              ? `Dưới đây là một số sản phẩm tương tự mà bạn có thể thích:` 
              : 'Hiện chưa có gợi ý sản phẩm tương tự.';
            break;
          }

          case 'list_by_category': {
            const params = new URLSearchParams();
            if (args.category_id) params.set('category_id', String(args.category_id));
            if (args.category_name && typeof args.category_name === 'string') params.set('category_name', args.category_name.trim());

            if (!params.toString()) {
               reply = 'Vui lòng cung cấp danh mục để tìm kiếm.';
               break;
            }

            const categoryRes = await fetch(`${getBaseUrl()}/api/products/by-category?${params.toString()}`);
            products = await categoryRes.json();
            reply = products.length > 0 
              ? `Danh sách sản phẩm trong danh mục bạn yêu cầu:` 
              : 'Danh mục này hiện chưa có sản phẩm.';
            break;
          }

          case 'list_promotions': {
            const promoRes = await fetch(`${getBaseUrl()}/api/products/promotions`);
            products = await promoRes.json();
            reply = products.length > 0 
              ? `Đừng bỏ lỡ các chương trình ưu đãi hấp dẫn đang diễn ra tại Quán Trà Coffee:` 
              : 'Hiện tại chưa có chương trình khuyến mãi mới. Hãy quay lại sau nhé!';
            break;
          }

          case 'get_order_status': {
            const orderRes = await fetch(`${getBaseUrl()}/api/orders/${args.order_id}/status`);
            const order = await orderRes.json();
            if (order && order.id) {
              reply = `Đơn hàng #${order.id} của bạn đang ở trạng thái: **${order.status || 'Đang xử lý'}**. Tổng giá trị: ${formatVnd(order.total)}.`;
            } else {
              reply = 'Tôi không tìm thấy thông tin về mã đơn hàng này. Bạn vui lòng kiểm tra lại mã nhé.';
            }
            break;
          }

          default:
            reply = 'Tôi có thể giúp bạn tìm kiếm sản phẩm hoặc kiểm tra đơn hàng. Bạn cần gì ạ?';
        }

        finalReply = reply;
        finalProducts = products.length > 0 ? products.slice(0, 5) : undefined;
        finalMeta = { tool: name, args };

      } catch (error) {
        console.error(`[Chat] Error calling tool ${name}:`, error);
        finalReply = 'Rất tiếc, tôi gặp một chút trục trặc khi truy xuất dữ liệu. Bạn có thể thử lại sau giây lát được không?';
      }
    } else {
      // Regular text response
      finalReply = llmResponse.text || 'Chào bạn! Quán Trà Coffee có thể giúp gì cho bạn hôm nay?';
    }

    // 2. Save Assistant Response to DB
    try {
      await sql`
        INSERT INTO ai_chat_history (session_id, user_id, role, message_text, related_product_id)
        VALUES (${currentSessionId}, ${userId}, 'assistant', ${finalReply}, ${relatedProductId})
      `;
    } catch (dbErr) {
      console.error('[Chat] DB Error saving assistant message:', dbErr);
    }

    return NextResponse.json({
      reply: finalReply,
      products: finalProducts,
      meta: finalMeta,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error('[Chat] Global Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', reply: 'Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

function getBaseUrl() {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

function formatVnd(value?: number | null) {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}
