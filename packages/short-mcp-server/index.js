#!/usr/bin/env node

/**
 * 极简短链 MCP Server
 * 用于连接 Claude Desktop 等 AI 客户端与短链服务
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// 从环境变量获取配置
const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:3001';
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error('Error: API_KEY environment variable is required.');
  process.exit(1);
}

// 创建 MCP 服务器
const server = new Server(
  {
    name: 'short-url-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 定义工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'shorten_url',
        description: '将长链接转换为短链接。当用户想要缩短 URL 时使用此工具。',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: '需要缩短的原始长链接 (必须以 http:// 或 https:// 开头)',
            },
          },
          required: ['url'],
        },
      },
    ],
  };
});

// 处理工具调用
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'shorten_url') {
    const { url } = request.params.arguments;

    try {
      // 调用后端 API
      const response = await axios.post(
        `${API_ORIGIN}/api/urls`,
        { url },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const res = response.data;
      if (res && res.code === 0 && res.data) {
        return {
          content: [
            {
              type: 'text',
              text: `短链接生成成功！\n短链接: ${API_ORIGIN}/${res.data.code}\n原始链接: ${res.data.url}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `生成失败: ${res.msg || '未知错误'}`,
            },
          ],
          isError: true,
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `请求出错: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error('Tool not found');
});

// 启动服务器
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Short URL MCP Server running on stdio');
}

run().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
