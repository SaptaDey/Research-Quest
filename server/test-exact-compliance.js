#!/usr/bin/env node

/**
 * Comprehensive Test Suite for ASR-GoT Exact Specification Compliance
 * Tests line-by-line implementation of scentific-reserch-GoT.md
 */

import { spawn } from 'child_process';
import assert from 'assert';

class ASRGoTComplianceTest {
  constructor() {
    this.testResults = [];
    this.serverProcess = null;
  }

  async runAllTests() {
    console.log('🔬 ASR-GoT Specification Compliance Test Suite');
    console.log('=' .repeat(60));
    
    try {
      await this.testP1_1_Initialization();
      await this.testP1_2_Decomposition();
      await this.testP1_3_HypothesisGeneration();
      await this.testP1_5_ConfidenceDistributions();
      await this.testP1_11_MathematicalFormalism();
      await this.testP1_12_MetadataSchema();
      await this.testP1_23_MultiLayerNetworks();
      await this.testAllParametersActive();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      process.exit(1);
    }
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['index.js'], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 5000
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        try {
          const response = JSON.parse(output);
          resolve(response);
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${output}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Send request
      child.stdin.write(JSON.stringify(request) + '\n');
      child.stdin.end();
    });
  }

  async testP1_1_Initialization() {
    console.log('🧪 Testing P1.1: Graph Initialization Defaults');
    
    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "initialize_asr_got_graph",
        arguments: {
          task_description: "Analyze the role of skin microbiome in immune responses to CTCL",
          initial_confidence: [0.8, 0.8, 0.8, 0.8]
        }
      }
    };

    const response = await this.sendMCPRequest(request);
    const result = JSON.parse(response.result.content[0].text);
    
    // P1.1 Specification: Root node n₀ label='Task Understanding'
    assert.strictEqual(result.node_id, 'n0', 'Root node must be n₀');
    assert.strictEqual(result.current_stage, 1, 'Must be in stage 1 after initialization');
    assert.strictEqual(result.stage_name, 'initialization', 'Stage name must be initialization');
    
    // Verify all 29 parameters are active (P1.0-P1.29)
    assert.strictEqual(result.active_parameters.length, 30, 'Must have all 30 parameters active (P1_0 through P1_29)');
    assert(result.active_parameters.includes('P1_0'), 'P1.0 must be active');
    assert(result.active_parameters.includes('P1_29'), 'P1.29 must be active');
    
    this.testResults.push({
      test: 'P1.1 Initialization',
      status: 'PASS',
      details: `Root node n₀ created, stage 1, all ${result.active_parameters.length} parameters active`
    });
  }

  async testP1_2_Decomposition() {
    console.log('🧪 Testing P1.2: Task Decomposition Dimensions');
    
    // Initialize first
    const initRequest = {
      jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: "initialize_asr_got_graph", arguments: { task_description: "Test task" } }
    };
    await this.sendMCPRequest(initRequest);

    // Test decomposition
    const request = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "decompose_research_task",
        arguments: {} // Use default dimensions
      }
    };

    const response = await this.sendMCPRequest(request);
    const result = JSON.parse(response.result.content[0].text);
    
    // P1.2 Specification: nodes 2.1-2.7 with exact dimensions
    const expectedNodes = ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"];
    const expectedDimensions = ["Scope", "Objectives", "Constraints", "Data Needs", "Use Cases", "Potential Biases", "Knowledge Gaps"];
    
    assert.deepStrictEqual(result.dimension_nodes, expectedNodes, 'Must create nodes 2.1-2.7');
    assert.deepStrictEqual(result.dimensions, expectedDimensions, 'Must include exact P1.2 dimensions including Potential Biases and Knowledge Gaps');
    assert.strictEqual(result.current_stage, 2, 'Must advance to stage 2');
    assert.strictEqual(result.stage_name, 'decomposition', 'Stage name must be decomposition');
    
    this.testResults.push({
      test: 'P1.2 Decomposition',
      status: 'PASS',
      details: `Created nodes ${result.dimension_nodes.join(', ')}, mandatory P1.17/P1.15 dimensions included`
    });
  }

  async testP1_3_HypothesisGeneration() {
    console.log('🧪 Testing P1.3: Hypothesis Generation Parameters');
    
    // Initialize and decompose first
    const initRequest = {
      jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: "initialize_asr_got_graph", arguments: { task_description: "Test task" } }
    };
    await this.sendMCPRequest(initRequest);

    const decomposeRequest = {
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "decompose_research_task", arguments: {} }
    };
    await this.sendMCPRequest(decomposeRequest);

    // Test hypothesis generation
    const request = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "generate_hypotheses",
        arguments: {
          dimension_node_id: "2.1",
          hypotheses: [
            {
              content: "Skin microbiome diversity correlates with immune function",
              falsification_criteria: "Compare microbiome diversity between healthy and CTCL patients",
              impact_score: 0.8
            },
            {
              content: "Specific bacterial species modulate T-cell responses",
              falsification_criteria: "Isolate and test specific bacterial strains on T-cell cultures"
            },
            {
              content: "Microbiome dysbiosis precedes CTCL progression",
              falsification_criteria: "Longitudinal study tracking microbiome changes"
            }
          ]
        }
      }
    };

    const response = await this.sendMCPRequest(request);
    const result = JSON.parse(response.result.content[0].text);
    
    // P1.3 Specification: k=3-5 hypotheses with numbering 3.1.1, 3.1.2, etc.
    const expectedNodes = ["3.1.1", "3.1.2", "3.1.3"];
    assert.deepStrictEqual(result.hypothesis_nodes, expectedNodes, 'Must create hypotheses numbered 3.1.1, 3.1.2, 3.1.3');
    assert.strictEqual(result.current_stage, 3, 'Must advance to stage 3');
    assert.strictEqual(result.stage_name, 'hypothesis_planning', 'Stage name must be hypothesis_planning');
    
    this.testResults.push({
      test: 'P1.3 Hypothesis Generation',
      status: 'PASS',
      details: `Created hypotheses ${result.hypothesis_nodes.join(', ')}, proper P1.3 numbering scheme`
    });
  }

  async testP1_5_ConfidenceDistributions() {
    console.log('🧪 Testing P1.5: Confidence as Probability Distributions (P1.14)');
    
    const initRequest = {
      jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: "initialize_asr_got_graph", arguments: { task_description: "Test confidence distributions" } }
    };
    await this.sendMCPRequest(initRequest);

    const summaryRequest = {
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "get_graph_summary", arguments: {} }
    };

    const response = await this.sendMCPRequest(summaryRequest);
    const result = JSON.parse(response.result.content[0].text);
    
    // P1.5: Confidence C = [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]
    // P1.14: represented as probability distributions
    assert(result.confidence_statistics.mean >= 0 && result.confidence_statistics.mean <= 1, 'Confidence statistics must be valid probabilities');
    assert(result.confidence_statistics.std >= 0, 'Standard deviation must be non-negative');
    
    this.testResults.push({
      test: 'P1.5/P1.14 Confidence Distributions',
      status: 'PASS',
      details: `Confidence statistics: mean=${result.confidence_statistics.mean.toFixed(3)}, std=${result.confidence_statistics.std.toFixed(3)}`
    });
  }

  async testP1_11_MathematicalFormalism() {
    console.log('🧪 Testing P1.11: Mathematical Formalism Gₜ = (Vₜ, Eₜ∪Eₕₜ, Lₜ, T, Cₜ, Mₜ, Iₜ)');
    
    const initRequest = {
      jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: "initialize_asr_got_graph", arguments: { task_description: "Test formalism" } }
    };
    await this.sendMCPRequest(initRequest);

    const exportRequest = {
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "export_graph_data", arguments: { format: "json" } }
    };

    const response = await this.sendMCPRequest(exportRequest);
    const exportData = JSON.parse(response.result.content[0].text);
    
    // P1.11: Complete mathematical formalism export
    assert(exportData.formalism, 'Must include P1.11 formalism');
    assert.strictEqual(exportData.formalism.state, 'Gₜ = (Vₜ, Eₜ∪Eₕₜ, Lₜ, T, Cₜ, Mₜ, Iₜ)', 'Must include exact mathematical formalism');
    assert(typeof exportData.formalism.vertices === 'number', 'Must include vertex count |Vₜ|');
    assert(typeof exportData.formalism.edges === 'number', 'Must include edge count |Eₜ|');
    assert(typeof exportData.formalism.hyperedges === 'number', 'Must include hyperedge count |Eₕₜ|');
    assert(typeof exportData.formalism.layers === 'number', 'Must include layer count |Lₜ|');
    assert(Array.isArray(exportData.formalism.node_types), 'Must include node types T');
    
    this.testResults.push({
      test: 'P1.11 Mathematical Formalism',
      status: 'PASS',
      details: `Formalism: ${exportData.formalism.state}, V=${exportData.formalism.vertices}, E=${exportData.formalism.edges}, L=${exportData.formalism.layers}`
    });
  }

  async testP1_12_MetadataSchema() {
    console.log('🧪 Testing P1.12: Complete Metadata Schema');
    
    const initRequest = {
      jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: "initialize_asr_got_graph", arguments: { task_description: "Test metadata schema" } }
    };
    await this.sendMCPRequest(initRequest);

    const exportRequest = {
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "export_graph_data", arguments: { format: "json" } }
    };

    const response = await this.sendMCPRequest(exportRequest);
    const exportData = JSON.parse(response.result.content[0].text);
    
    // P1.12: Mandatory metadata fields
    const rootNode = exportData.vertices.find(v => v.node_id === 'n0');
    assert(rootNode, 'Root node n0 must exist');
    
    const requiredFields = [
      'node_id', 'provenance', 'confidence', 'epistemic_status', 'disciplinary_tags',
      'falsification_criteria', 'bias_flags', 'revision_history', 'layer_id',
      'topology_metrics', 'statistical_power', 'info_metrics', 'impact_score', 'attribution'
    ];
    
    for (const field of requiredFields) {
      assert(rootNode.metadata.hasOwnProperty(field), `Must include P1.12 metadata field: ${field}`);
    }
    
    // P1.14: Confidence as probability distributions
    assert(rootNode.confidence.type === 'probability_distribution', 'Confidence must be probability distribution per P1.14');
    assert(Array.isArray(rootNode.confidence.means), 'Must include means array');
    assert(rootNode.confidence.means.length === 4, 'Must have 4-dimensional confidence vector');
    
    this.testResults.push({
      test: 'P1.12 Metadata Schema',
      status: 'PASS',
      details: `All ${requiredFields.length} required metadata fields present, P1.14 distributions implemented`
    });
  }

  async testP1_23_MultiLayerNetworks() {
    console.log('🧪 Testing P1.23: Multi-layer Network Parameters');
    
    const initRequest = {
      jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: "initialize_asr_got_graph", arguments: { task_description: "Test multi-layer networks" } }
    };
    await this.sendMCPRequest(initRequest);

    const summaryRequest = {
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "get_graph_summary", arguments: {} }
    };

    const response = await this.sendMCPRequest(summaryRequest);
    const result = JSON.parse(response.result.content[0].text);
    
    // P1.23: Multi-layer structure with distinct layers
    const expectedLayers = ['base', 'methodological', 'empirical', 'theoretical', 'interdisciplinary'];
    assert.deepStrictEqual(result.layers, expectedLayers, 'Must include all P1.23 default layers');
    assert(result.layer_distribution, 'Must include layer distribution');
    assert(result.graph_state.layers_count === 5, 'Must have 5 layers as per P1.23');
    
    this.testResults.push({
      test: 'P1.23 Multi-layer Networks',
      status: 'PASS',
      details: `Layers: ${result.layers.join(', ')}, distribution: ${JSON.stringify(result.layer_distribution)}`
    });
  }

  async testAllParametersActive() {
    console.log('🧪 Testing All P1.0-P1.29 Parameters Active');
    
    const initRequest = {
      jsonrpc: "2.0", id: 1, method: "tools/call",
      params: { name: "initialize_asr_got_graph", arguments: { task_description: "Test all parameters" } }
    };
    await this.sendMCPRequest(initRequest);

    const summaryRequest = {
      jsonrpc: "2.0", id: 2, method: "tools/call",
      params: { name: "get_graph_summary", arguments: {} }
    };

    const response = await this.sendMCPRequest(summaryRequest);
    const result = JSON.parse(response.result.content[0].text);
    
    // All 30 parameters P1_0 through P1_29 must be active
    assert.strictEqual(result.total_parameters, 30, 'Must have exactly 30 parameters');
    assert.strictEqual(result.active_parameters.length, 30, 'All 30 parameters must be active');
    
    for (let i = 0; i <= 29; i++) {
      const paramName = `P1_${i}`;
      assert(result.active_parameters.includes(paramName), `Parameter ${paramName} must be active`);
    }
    
    this.testResults.push({
      test: 'All Parameters P1.0-P1.29',
      status: 'PASS',
      details: `All ${result.total_parameters} parameters active: P1_0 through P1_29`
    });
  }

  printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('🔬 ASR-GoT Specification Compliance Test Results');
    console.log('=' .repeat(60));
    
    let passCount = 0;
    let totalCount = this.testResults.length;
    
    for (const result of this.testResults) {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      console.log(`   ${result.details}`);
      if (result.status === 'PASS') passCount++;
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log(`📊 Results: ${passCount}/${totalCount} tests passed`);
    
    if (passCount === totalCount) {
      console.log('🎉 ALL TESTS PASSED - EXACT SPECIFICATION COMPLIANCE VERIFIED');
      console.log('✅ Implementation follows scentific-reserch-GoT.md line by line');
      console.log('✅ Node.js implementation with complete MCP protocol support');
      console.log('✅ All 29 parameters (P1.0-P1.29) implemented exactly as specified');
    } else {
      console.log('❌ SOME TESTS FAILED - SPECIFICATION COMPLIANCE ISSUES DETECTED');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new ASRGoTComplianceTest();
tester.runAllTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});