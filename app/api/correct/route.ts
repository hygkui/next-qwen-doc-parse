import { NextRequest } from 'next/server';

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_API_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: '文本内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!QWEN_API_KEY) {
      console.error('QWEN_API_KEY not found in environment variables');
      return new Response(JSON.stringify({ error: 'API密钥未配置' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const requestBody = {
      model: 'qwen-turbo',
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一个专业的文档校对助手。请仔细检查以下文本内容，纠正其中的错误，包括但不限于：错别字、语法错误、标点符号、格式等。直接返回修改后的文本，不要加任何解释。'
          },
          {
            role: 'user',
            content: text
          }
        ]
      },
      parameters: {
        result_format: 'message',
        temperature: 0.1, // 降低温度以获得更稳定的输出
        top_p: 0.5,
        max_tokens: 1500,
        stream: false // 不使用流式响应
      }
    };

    console.log('Making request to Qwen API for correction');

    const response = await fetch(QWEN_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`,
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('Qwen API error:', response.status);
      return new Response(JSON.stringify({ error: '校对请求失败' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log('Qwen API response:', JSON.stringify(result, null, 2));

    // 根据通义千问API的响应结构提取文本
    const correctedText = result.output?.choices?.[0]?.message?.content;

    if (!correctedText) {
      console.error('Invalid response structure:', result);
      return new Response(JSON.stringify({ error: '未能获取校对结果' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ content: correctedText }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in correction:', error);
    return new Response(JSON.stringify({ error: '校对过程发生错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
