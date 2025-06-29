#!/usr/bin/env node

/**
 * Test suite for ASR-GoT MCP Server
 * Basic validation and functionality testing
 */

import { spawn } from 'child_process';
import { setTimeout as delay } from 'timers/promises';
import fs from 'fs';

const TEST_TIMEOUT = 10000; // 10 seconds

class MCPTester {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
  }

  async startServer() {
    console.log('Starting ASR-GoT MCP Server...');
    this.serverProcess = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait for server to initialize
    await delay(2000);

    if (this.serverProcess.killed) {
      throw new Error('Server failed to start');
    }

    console.log('✓ Server started successfully');
    return true;
  }

  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      console.log('✓ Server stopped');
    }
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, TEST_TIMEOUT);

      let responseData = '';

      this.serverProcess.stdout.on('data', (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData);
          clearTimeout(timeout);
          resolve(response);
        } catch (e) {
          // Not complete JSON yet, continue collecting
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('Server error:', data.toString());
      });

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async testListTools() {
    console.log('\n--- Testing List Tools ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.result && response.result.tools) {
        console.log(`✓ Found ${response.result.tools.length} tools`);
        
        const expectedTools = [
          'initialize_asr_got_graph',
          'decompose_research_task',
          'get_graph_summary',
          'export_graph_data'
        ];

        const foundTools = response.result.tools.map(t => t.name);
        const missingTools = expectedTools.filter(t => !foundTools.includes(t));
        
        if (missingTools.length === 0) {
          console.log('✓ All expected tools found');
          this.testResults.push({ test: 'list_tools', passed: true });
        } else {
          console.log(`✗ Missing tools: ${missingTools.join(', ')}`);
          this.testResults.push({ test: 'list_tools', passed: false, error: `Missing: ${missingTools.join(', ')}` });
        }
      } else {
        console.log('✗ Invalid response format');
        this.testResults.push({ test: 'list_tools', passed: false, error: 'Invalid response format' });
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'list_tools', passed: false, error: error.message });
    }
  }

  async testInitializeGraph() {
    console.log('\n--- Testing Initialize Graph ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: {
          task_description: 'Investigate the role of skin microbiome in cutaneous T-cell lymphoma progression',
          initial_confidence: [0.8, 0.7, 0.9, 0.6],
          config: {
            research_domain: 'immunology',
            enable_multi_layer: true
          }
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.result && response.result.content) {
        const result = JSON.parse(response.result.content[0].text);
        
        if (result.success && result.node_id === 'n0') {
          console.log('✓ Graph initialized successfully');
          console.log(`  Node ID: ${result.node_id}`);
          console.log(`  Current stage: ${result.current_stage}`);
          this.testResults.push({ test: 'initialize_graph', passed: true });
        } else {
          console.log('✗ Initialization failed');
          this.testResults.push({ test: 'initialize_graph', passed: false, error: 'Initialization failed' });
        }
      } else {
        console.log('✗ Invalid response format');
        this.testResults.push({ test: 'initialize_graph', passed: false, error: 'Invalid response format' });
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'initialize_graph', passed: false, error: error.message });
    }
  }

  async testDecomposeTask() {
    console.log('\n--- Testing Task Decomposition ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'decompose_research_task',
        arguments: {
          dimensions: ['Scope', 'Objectives', 'Methodology', 'Data Requirements', 'Expected Outcomes']
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.result && response.result.content) {
        const result = JSON.parse(response.result.content[0].text);
        
        if (result.success && result.dimension_nodes) {
          console.log('✓ Task decomposed successfully');
          console.log(`  Created ${result.dimension_nodes.length} dimension nodes`);
          console.log(`  Current stage: ${result.current_stage}`);
          this.testResults.push({ test: 'decompose_task', passed: true });
        } else {
          console.log('✗ Decomposition failed');
          this.testResults.push({ test: 'decompose_task', passed: false, error: 'Decomposition failed' });
        }
      } else {
        console.log('✗ Invalid response format');
        this.testResults.push({ test: 'decompose_task', passed: false, error: 'Invalid response format' });
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'decompose_task', passed: false, error: error.message });
    }
  }

  async testGraphSummary() {
    console.log('\n--- Testing Graph Summary ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_graph_summary',
        arguments: {}
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.result && response.result.content) {
        const summary = JSON.parse(response.result.content[0].text);
        
        if (summary.total_nodes && summary.current_stage) {
          console.log('✓ Graph summary retrieved successfully');
          console.log(`  Total nodes: ${summary.total_nodes}`);
          console.log(`  Total edges: ${summary.total_edges}`);
          console.log(`  Current stage: ${summary.current_stage} (${summary.stage_name})`);
          console.log(`  Node types: ${JSON.stringify(summary.node_types)}`);
          this.testResults.push({ test: 'graph_summary', passed: true });
        } else {
          console.log('✗ Invalid summary format');
          this.testResults.push({ test: 'graph_summary', passed: false, error: 'Invalid summary format' });
        }
      } else {
        console.log('✗ Invalid response format');
        this.testResults.push({ test: 'graph_summary', passed: false, error: 'Invalid response format' });
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'graph_summary', passed: false, error: error.message });
    }
  }

  async runAllTests() {
    console.log('Starting ASR-GoT MCP Server Test Suite');
    console.log('=====================================');

    try {
      await this.startServer();
      
      // Run tests in sequence
      await this.testListTools();
      await this.testInitializeGraph();
      await this.testDecomposeTask();
      await this.testGraphSummary();
      
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      await this.stopServer();
    }

    // Report results
    console.log('\n=====================================');
    console.log('Test Results Summary');
    console.log('=====================================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      const error = result.error ? ` (${result.error})` : '';
      console.log(`${status}: ${result.test}${error}`);
    });
    
    console.log(`\nOverall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('❌ Some tests failed');
      process.exit(1);
    }
  }
}

// Validation functions
function validateManifest() {
  console.log('\n--- Validating Manifest ---');
  
  try {
    const manifest = JSON.parse(fs.readFileSync('../manifest.json', 'utf8'));
    
    const requiredFields = ['dxt_version', 'name', 'version', 'description', 'author', 'server'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
      console.log('✓ Manifest validation passed');
      return true;
    } else {
      console.log(`✗ Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }
  } catch (error) {
    console.log(`✗ Manifest validation failed: ${error.message}`);
    return false;
  }
}

// Run tests
async function main() {
  // Validate manifest first
  const manifestValid = validateManifest();
  
  if (!manifestValid) {
    console.log('❌ Manifest validation failed. Aborting tests.');
    process.exit(1);
  }
  
  // Run MCP server tests
  const tester = new MCPTester();
  await tester.runAllTests();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}