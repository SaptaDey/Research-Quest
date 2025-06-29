#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class SimpleASRGoTServer {
  constructor() {
    this.server = new Server(
      {
        name: 'simple-asr-got-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'test_tool',
            description: 'Simple test tool for ASR-GoT',
            inputSchema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Test message',
                },
              },
              required: ['message'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (name === 'test_tool') {
        return {
          content: [
            {
              type: 'text',
              text: `Simple ASR-GoT server received: ${args.message || 'no message'}`,
            },
          ],
        };
      }

      throw new Error(`Tool ${name} not found`);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Simple ASR-GoT MCP Server running');
  }
}

const server = new SimpleASRGoTServer();
server.run().catch(console.error);