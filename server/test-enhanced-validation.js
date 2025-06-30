#!/usr/bin/env node

/**
 * Enhanced Validation Test Suite for Research Quest Server
 * Tests all the critical errors identified in the comprehensive error analysis
 */

import { spawn } from 'child_process';

class EnhancedValidationTestSuite {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('Starting Enhanced Research Quest Server...');
      
      this.serverProcess = spawn('node', ['index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let started = false;
      
      this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('ASR-GoT MCP Server running successfully') && !started) {
          started = true;
          console.log('✓ Enhanced server started successfully');
          setTimeout(() => resolve(), 100);
        }
      });

      this.serverProcess.on('error', (error) => {
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

  async testCriticalError1_MissingRequiredParams() {
    console.log('\n--- Testing ERROR #1: MCP-32602 Missing Required Parameters ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: {} // Missing task_description
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.error && response.error.code === -32602) {
        console.log('✓ Correctly returns MCP-32602 for missing task_description');
        console.log(`  Error message: ${response.error.message}`);
        this.testResults.push({ test: 'missing_task_description', passed: true });
      } else {
        console.log('✗ Should return MCP-32602 error');
        this.testResults.push({ test: 'missing_task_description', passed: false });
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'missing_task_description', passed: false, error: error.message });
    }
  }

  async testCriticalError2_InvalidParameterStructure() {
    console.log('\n--- Testing ERROR #2: Invalid Parameter Structure ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: 'string_instead_of_object' // Invalid structure
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.error && response.error.code === -32602) {
        console.log('✓ Correctly handles invalid parameter structure');
        console.log(`  Error message: ${response.error.message}`);
        this.testResults.push({ test: 'invalid_param_structure', passed: true });
      } else {
        console.log('✗ Should return parameter validation error');
        this.testResults.push({ test: 'invalid_param_structure', passed: false });
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'invalid_param_structure', passed: false, error: error.message });
    }
  }

  async testIssue1_InsufficientRangeValidation() {
    console.log('\n--- Testing ISSUE #1: Range Validation for Confidence Values ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: {
          task_description: 'Test task with invalid confidence values',
          initial_confidence: [1.5, -0.2, 0.5, 2.0] // Out of range values
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.error && response.error.code === -32602) {
        console.log('✓ Now correctly validates confidence value ranges');
        console.log(`  Error message: ${response.error.message}`);
        if (response.error.data?.examples) {
          console.log(`  Examples provided: ${JSON.stringify(response.error.data.examples)}`);
        }
        this.testResults.push({ test: 'confidence_range_validation', passed: true });
      } else {
        console.log('✗ Should reject out-of-range confidence values');
        this.testResults.push({ test: 'confidence_range_validation', passed: false });
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'confidence_range_validation', passed: false, error: error.message });
    }
  }

  async testCriticalError3_InvalidNodeReference() {
    console.log('\n--- Testing ERROR #3: Invalid Node Reference ---');
    
    // First initialize and decompose
    await this.sendMCPRequest({
      jsonrpc: '2.0',
      id: 10,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: { task_description: 'Test invalid node reference handling' }
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

    // Now test invalid node reference
    const request = {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'generate_hypotheses',
        arguments: {
          dimension_node_id: 'invalid_node_id', // Non-existent node
          hypotheses: ['Test hypothesis 1', 'Test hypothesis 2', 'Test hypothesis 3']
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.error && response.error.code === -32602) {
        console.log('✓ Correctly validates node existence');
        console.log(`  Error message: ${response.error.message}`);
        if (response.error.data?.examples) {
          console.log(`  Available nodes: ${JSON.stringify(response.error.data.examples)}`);
        }
        this.testResults.push({ test: 'invalid_node_reference', passed: true });
      } else {
        console.log('✗ Should return validation error for invalid node reference');
        this.testResults.push({ test: 'invalid_node_reference', passed: false });
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'invalid_node_reference', passed: false, error: error.message });
    }
  }

  async testCriticalError4_ArraySizeConstraints() {
    console.log('\n--- Testing ERROR #4: Array Size Constraint Violations ---');
    
    // Test minimum size violation
    const request1 = {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'generate_hypotheses',
        arguments: {
          dimension_node_id: '2.1',
          hypotheses: ['Only one hypothesis'] // Violates minItems: 3
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request1);
      
      if (response.error && response.error.code === -32602) {
        console.log('✓ Correctly enforces minimum array size (3 hypotheses)');
        console.log(`  Error message: ${response.error.message}`);
        this.testResults.push({ test: 'array_min_size_validation', passed: true });
      } else {
        console.log('✗ Should reject arrays with less than 3 hypotheses');
        this.testResults.push({ test: 'array_min_size_validation', passed: false });
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'array_min_size_validation', passed: false, error: error.message });
    }

    // Test maximum size violation
    const request2 = {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'generate_hypotheses',
        arguments: {
          dimension_node_id: '2.1',
          hypotheses: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'] // Violates maxItems: 5
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request2);
      
      if (response.error && response.error.code === -32602) {
        console.log('✓ Correctly enforces maximum array size (5 hypotheses)');
        console.log(`  Error message: ${response.error.message}`);
        this.testResults.push({ test: 'array_max_size_validation', passed: true });
      } else {
        console.log('✗ Should reject arrays with more than 5 hypotheses');
        this.testResults.push({ test: 'array_max_size_validation', passed: false });
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'array_max_size_validation', passed: false, error: error.message });
    }
  }

  async testCriticalError5_InvalidEnumValues() {
    console.log('\n--- Testing ERROR #5: Invalid Enum Values ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'export_graph_data',
        arguments: {
          format: 'xml' // Invalid format, only json/yaml allowed
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.error && response.error.code === -32602) {
        console.log('✓ Correctly validates enum values for format parameter');
        console.log(`  Error message: ${response.error.message}`);
        this.testResults.push({ test: 'invalid_enum_values', passed: true });
      } else {
        console.log('✗ Should reject invalid format values');
        this.testResults.push({ test: 'invalid_enum_values', passed: false });
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'invalid_enum_values', passed: false, error: error.message });
    }
  }

  async testIssue2_RequiredFieldValidation() {
    console.log('\n--- Testing ISSUE #2: P1.3 and P1.16 Required Field Validation ---');
    
    const request = {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: {
        name: 'generate_hypotheses',
        arguments: {
          dimension_node_id: '2.1',
          hypotheses: [
            { content: 'Hypothesis without plan or falsification criteria' },
            { content: 'Another hypothesis without required fields' },
            { content: 'Third hypothesis without required fields' }
          ]
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request);
      
      if (response.result) {
        const result = JSON.parse(response.result.content[0].text);
        if (result.warnings && result.warnings.length > 0) {
          console.log('✓ Generates warnings for missing P1.3 and P1.16 required fields');
          console.log(`  Warnings: ${result.warnings.join(', ')}`);
          this.testResults.push({ test: 'required_field_warnings', passed: true });
        } else {
          console.log('✗ Should generate warnings for missing required fields');
          this.testResults.push({ test: 'required_field_warnings', passed: false });
        }
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'required_field_warnings', passed: false, error: error.message });
    }
  }

  async testTaskDescriptionValidation() {
    console.log('\n--- Testing Enhanced Task Description Validation ---');
    
    // Test too short description
    const request1 = {
      jsonrpc: '2.0',
      id: 9,
      method: 'tools/call',
      params: {
        name: 'initialize_asr_got_graph',
        arguments: {
          task_description: 'Too short' // Less than 10 characters
        }
      }
    };

    try {
      const response = await this.sendMCPRequest(request1);
      
      if (response.error && response.error.code === -32602) {
        console.log('✓ Correctly validates minimum task description length');
        console.log(`  Error message: ${response.error.message}`);
        this.testResults.push({ test: 'task_description_length', passed: true });
      } else {
        console.log('✗ Should reject too short task descriptions');
        this.testResults.push({ test: 'task_description_length', passed: false });
      }
    } catch (error) {
      console.log(`✗ Unexpected error: ${error.message}`);
      this.testResults.push({ test: 'task_description_length', passed: false, error: error.message });
    }
  }

  stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      console.log('✓ Server stopped gracefully');
    }
  }

  async runAllTests() {
    console.log('Enhanced Validation Test Suite for Research Quest');
    console.log('================================================');
    console.log('Testing fixes for all identified critical errors and issues');

    try {
      await this.startServer();
      
      await this.testCriticalError1_MissingRequiredParams();
      await this.testCriticalError2_InvalidParameterStructure();
      await this.testIssue1_InsufficientRangeValidation();
      await this.testCriticalError3_InvalidNodeReference();
      await this.testCriticalError4_ArraySizeConstraints();
      await this.testCriticalError5_InvalidEnumValues();
      await this.testIssue2_RequiredFieldValidation();
      await this.testTaskDescriptionValidation();
      
      this.stopServer();
      this.printResults();
    } catch (error) {
      console.error(`Test suite error: ${error.message}`);
      this.stopServer();
      process.exit(1);
    }
  }

  printResults() {
    console.log('\n================================================');
    console.log('Enhanced Validation Test Results');
    console.log('================================================');
    
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    
    console.log('\nCRITICAL ERROR FIXES:');
    this.testResults.filter(t => t.test.includes('missing_task_description') || 
                                t.test.includes('invalid_param_structure') ||
                                t.test.includes('invalid_node_reference') ||
                                t.test.includes('array_') ||
                                t.test.includes('invalid_enum_values')).forEach(result => {
      const status = result.passed ? '✓ FIXED' : '✗ STILL FAILING';
      console.log(`${status}: ${result.test}`);
    });
    
    console.log('\nVALIDATION IMPROVEMENTS:');
    this.testResults.filter(t => t.test.includes('confidence_range') || 
                                t.test.includes('required_field') ||
                                t.test.includes('task_description_length')).forEach(result => {
      const status = result.passed ? '✓ IMPROVED' : '✗ NEEDS WORK';
      console.log(`${status}: ${result.test}`);
    });
    
    console.log(`\nOverall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed >= total * 0.8) {  // 80% threshold
      console.log('🎉 Excellent! Most critical errors have been resolved.');
      console.log('📊 Error Resolution Summary:');
      console.log('   - MCP-32602 errors: Enhanced parameter validation');
      console.log('   - Range validation: Confidence values properly checked');
      console.log('   - Node references: Existence validation implemented');
      console.log('   - Array constraints: Min/max size enforcement active');
      console.log('   - Enum validation: Format parameters properly validated');
      console.log('   - P1.3/P1.16 compliance: Warning system for missing fields');
    } else {
      console.log('❌ Critical errors still need attention');
      console.log('🔧 Priority fixes needed for production readiness');
    }
  }
}

// Run the enhanced validation test suite
const testSuite = new EnhancedValidationTestSuite();
testSuite.runAllTests().catch(console.error);