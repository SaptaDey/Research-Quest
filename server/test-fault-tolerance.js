#!/usr/bin/env node

/**
 * Fault Tolerance Test Suite for ASR-GoT MCP Server
 * Tests error handling, graceful degradation, and recovery mechanisms
 */

import { spawn } from 'child_process';
import { randomUUID } from 'crypto';

class FaultToleranceTestSuite {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('Starting ASR-GoT MCP Server...');
      
      this.serverProcess = spawn('node', ['index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let started = false;
      
      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('ASR-GoT MCP Server running successfully') && !started) {
          started = true;
          console.log('✓ Server started successfully');
          setTimeout(() => resolve(), 100);
        }
      });

      this.serverProcess.on('error', (error) => {
        console.error(`Server error: ${error.message}`);
        reject(error);
      });

      setTimeout(() => {
        if (!started) {
          reject(new Error('Server startup timeout'));
        }
      }, 10000);
    });
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const requestData = JSON.stringify(request) + '\n';
      
      let responseData = '';
      
      const handleResponse = (data) => {
        responseData += data.toString();
        
        try {
          const lines = responseData.split('\n').filter(line => line.trim());
          for (const line of lines) {
            if (line.trim()) {
              const response = JSON.parse(line);
              if (response.id === request.id) {
                this.serverProcess.stdout.removeListener('data', handleResponse);
                resolve(response);
                return;
              }
            }
          }
        } catch (error) {
          // Continue waiting for complete response
        }
      };
      
      this.serverProcess.stdout.on('data', handleResponse);
      this.serverProcess.stdin.write(requestData);
      
      setTimeout(() => {
        this.serverProcess.stdout.removeListener('data', handleResponse);
        reject(new Error('Request timeout'));
      }, 5000);
    });
  }

  async testInvalidInputs() {
    console.log('\n--- Testing Invalid Inputs ---');
    
    // Test 1: Invalid task description
    const request1 = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: {
          task_description: '' // Empty string
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request1);
      
      if (response.error?.message.includes('task_description')) {
        console.log('✓ Properly handles invalid task description');
        this.testResults.push({ test: 'invalid_task_description', passed: true });
      } else {
        console.log('✗ Should reject empty task description');
        this.testResults.push({ test: 'invalid_task_description', passed: false });
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'invalid_task_description', passed: false, error: error.message });
    }

    // Test 2: Invalid confidence values
    const request2 = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: {
          task_description: 'Test task',
          initial_confidence: [2.0, -1.0, 'invalid', null] // Invalid values
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request2);
      
      if (response.result) {
        const result = JSON.parse(response.result.content[0].text);
        if (result.success) {
          console.log('✓ Gracefully handles invalid confidence values with fallback');
          this.testResults.push({ test: 'invalid_confidence_fallback', passed: true });
        } else {
          console.log('✗ Should succeed with fallback values');
          this.testResults.push({ test: 'invalid_confidence_fallback', passed: false });
        }
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'invalid_confidence_fallback', passed: false, error: error.message });
    }
  }

  async testMalformedHypotheses() {
    console.log('\n--- Testing Malformed Hypotheses ---');
    
    // First initialize and decompose
    await this.sendMCPRequest({
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: { task_description: 'Test malformed hypotheses handling' }
      }
    });

    await this.sendMCPRequest({
      jsonrpc: '2.0',
      id: 11,
      method: 'tools/call',
      params: {
        name: 'decompose_research_task',
        arguments: {}
      }
    });

    // Test malformed hypotheses
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'generate_hypotheses',
        arguments: {
          dimension_node_id: '2.1',
          hypotheses: [
            '', // Empty string
            null, // Null value
            { content: '' }, // Empty content
            { content: 'Valid hypothesis' }, // One valid
            { invalid: 'structure' } // Invalid structure
          ]
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.result) {
        const result = JSON.parse(response.result.content[0].text);
        if (result.success && result.hypothesis_nodes && result.hypothesis_nodes.length > 0) {
          console.log('✓ Gracefully handles malformed hypotheses, creates valid ones');
          console.log(`  Created ${result.hypothesis_nodes.length} valid hypotheses`);
          if (result.warnings) {
            console.log(`  Warnings: ${result.warnings.length}`);
          }
          this.testResults.push({ test: 'malformed_hypotheses_graceful', passed: true });
        } else {
          console.log('✗ Should create at least one valid hypothesis');
          this.testResults.push({ test: 'malformed_hypotheses_graceful', passed: false });
        }
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'malformed_hypotheses_graceful', passed: false, error: error.message });
    }
  }

  async testNonExistentNode() {
    console.log('\n--- Testing Non-existent Node Access ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'generate_hypotheses',
        arguments: {
          dimension_node_id: '999.999', // Non-existent node
          hypotheses: ['Valid hypothesis']
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.error?.message.includes('not found')) {
        console.log('✓ Properly handles non-existent node access');
        this.testResults.push({ test: 'nonexistent_node_error', passed: true });
      } else {
        console.log('✗ Should return error for non-existent node');
        this.testResults.push({ test: 'nonexistent_node_error', passed: false });
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'nonexistent_node_error', passed: false, error: error.message });
    }
  }

  async testWrongStageOperation() {
    console.log('\n--- Testing Wrong Stage Operations ---');
    
    // Try to generate hypotheses without decomposition
    const request = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'generate_hypotheses',
        arguments: {
          dimension_node_id: '2.1',
          hypotheses: ['Test hypothesis']
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.result) {
        const result = JSON.parse(response.result.content[0].text);
        if (!result.success && result.error?.includes('stage')) {
          console.log('✓ Properly handles wrong stage operations');
          this.testResults.push({ test: 'wrong_stage_error', passed: true });
        } else {
          console.log('✗ Should return stage error');
          this.testResults.push({ test: 'wrong_stage_error', passed: false });
        }
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'wrong_stage_error', passed: false, error: error.message });
    }
  }

  async testSummaryResilience() {
    console.log('\n--- Testing Summary Resilience ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'get_graph_summary',
        arguments: {}
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.result) {
        const summary = JSON.parse(response.result.content[0].text);
        if (summary.health_info && summary.graph_state) {
          console.log('✓ Summary includes health information and resilient structure');
          console.log(`  Server health: ${summary.health_info.server_health}`);
          console.log(`  Graph health: ${summary.health_info.graph_health}`);
          this.testResults.push({ test: 'summary_resilience', passed: true });
        } else {
          console.log('✗ Summary should include health information');
          this.testResults.push({ test: 'summary_resilience', passed: false });
        }
      }
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
      this.testResults.push({ test: 'summary_resilience', passed: false, error: error.message });
    }
  }

  stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      console.log('✓ Server stopped gracefully');
    }
  }

  async runAllTests() {
    console.log('ASR-GoT Fault Tolerance Test Suite');
    console.log('=====================================');

    try {
      await this.startServer();
      
      await this.testInvalidInputs();
      await this.testMalformedHypotheses();
      await this.testNonExistentNode();
      await this.testWrongStageOperation();
      await this.testSummaryResilience();
      
      this.stopServer();
      
      this.printResults();
    } catch (error) {
      console.error(`Test suite error: ${error.message}`);
      this.stopServer();
      process.exit(1);
    }
  }

  printResults() {
    console.log('\n=====================================');
    console.log('Fault Tolerance Test Results');
    console.log('=====================================');
    
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`${status}: ${result.test}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    });
    
    console.log(`\nOverall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All fault tolerance tests passed!');
      console.log('Server demonstrates excellent error handling and graceful degradation.');
    } else {
      console.log('❌ Some fault tolerance tests failed');
      process.exit(1);
    }
  }
}

// Run the test suite
const testSuite = new FaultToleranceTestSuite();
testSuite.runAllTests().catch(console.error);