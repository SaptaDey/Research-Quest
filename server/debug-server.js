#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Create server
const server = new Server(
  {
    name: 'asr-got-debug',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Simple tools for testing
const tools = [
  {
    name: 'initialize_asr_got_graph',
    description: 'Initialize a new ASR-GoT reasoning graph',
    inputSchema: {
      type: 'object',
      properties: {
        task_description: {
          type: 'string',
          description: 'Research task description'
        }
      },
      required: ['task_description']
    }
  },
  {
    name: 'get_graph_summary',
    description: 'Get current graph state summary',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('Tools requested');
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`Tool called: ${name}`);
  
  switch (name) {
    case 'initialize_asr_got_graph':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              node_id: 'n0',
              message: 'Graph initialized successfully',
              task: args.task_description
            }, null, 2)
          }
        ]
      };
      
    case 'get_graph_summary':
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_nodes: 1,
              total_edges: 0,
              current_stage: 1,
              stage_name: 'initialization'
            }, null, 2)
          }
        ]
      };
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('ASR-GoT Debug Server running...');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();