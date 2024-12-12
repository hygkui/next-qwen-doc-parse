const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_API_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export async function* analyzeWithQwen(text: string) {
  if (!QWEN_API_KEY) {
    console.error('QWEN_API_KEY not found in environment variables');
    throw new Error('QWEN_API_KEY is not configured');
  }

  try {
    const requestBody = {
      model: 'qwen-turbo',
      input: {
        messages: [
          {
            role: 'system',
            content: '你是一个专业的文档分析助手，请分析以下文档内容，提取关键信息并给出结构化的总结。'
          },
          {
            role: 'user',
            content: text
          }
        ]
      },
      parameters: {
        result_format: 'message',
        temperature: 0.7,
        top_p: 0.8,
        max_tokens: 1500,
        stream: true
      }
    };

    console.log('Making request to Qwen API with config:', {
      endpoint: QWEN_API_ENDPOINT,
      apiKeyLength: QWEN_API_KEY.length,
      requestBody: JSON.stringify(requestBody, null, 2)
    });

    const response = await fetch(QWEN_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'X-DashScope-SSE': 'enable',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Qwen API response status:', response.status);
    console.log('Qwen API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Qwen API error response:', errorData);
      throw new Error(errorData.message || '分析失败');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.error('Failed to get response body reader');
      throw new Error('无法读取响应流');
    }

    let buffer = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream complete');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            console.log('Raw line:', line);
            if (line.startsWith('data:')) {
              try {
                const jsonStr = line.slice(5).trim();
                console.log('Parsing JSON:', jsonStr);
                const data = JSON.parse(jsonStr);
                console.log('Parsed data:', data);

                if (data.output?.choices?.[0]?.message?.content) {
                  const content = data.output.choices[0].message.content;
                  console.log('Yielding message content:', content);
                  yield content;
                } else if (data.output?.text) {
                  console.log('Yielding text content:', data.output.text);
                  yield data.output.text;
                } else {
                  console.log('No content found in data:', data);
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
                console.error('Problematic line:', line);
              }
            } else {
              console.log('Non-data line:', line);
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        console.log('Processing remaining buffer:', buffer);
        if (buffer.startsWith('data:')) {
          try {
            const data = JSON.parse(buffer.slice(5).trim());
            if (data.output?.choices?.[0]?.message?.content) {
              yield data.output.choices[0].message.content;
            } else if (data.output?.text) {
              yield data.output.text;
            }
          } catch (e) {
            console.error('Error parsing remaining buffer:', e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error('Qwen API error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}
