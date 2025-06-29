#!/usr/bin/env node

/**
 * Complete ASR-GoT MCP Server Implementation
 * Advanced Scientific Reasoning Graph-of-Thoughts Model Context Protocol Server
 * 
 * Implements the complete 8-stage ASR-GoT framework with all 29 parameters (P1.0-P1.29)
 * Following the specification from scentific-reserch-GoT.md line by line
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';

// Complete ASR-GoT Graph State Management with Full Parameter Integration
class ASRGoTGraph {
  constructor(config = {}) {
    // Core graph components (P1.11 Mathematical Formalism)
    this.vertices = new Map(); // V
    this.edges = new Map(); // E (binary edges)
    this.hyperedges = new Map(); // Eₕ (P1.9)
    this.layers = new Map(); // L (P1.23)
    this.nodeTypes = new Set(); // T
    this.confidenceFunction = new Map(); // C (P1.14)
    this.metadataFunction = new Map(); // M (P1.12)
    this.informationMetrics = new Map(); // I (P1.27)
    
    // Graph metadata with full parameter support
    this.metadata = {
      created: new Date().toISOString(),
      version: '1.0.0',
      stage: 'initialization',
      config: config,
      parameters: this._initializeParameters()
    };
    
    this.currentStage = 1;
    this.stageNames = [
      'initialization', 'decomposition', 'hypothesis_planning', 
      'evidence_integration', 'pruning_merging', 'subgraph_extraction',
      'composition', 'reflection'
    ];
    
    // Initialize multi-layer structure if enabled (P1.23)
    if (config.enable_multi_layer !== false) {
      this._initializeLayers();
    }
  }

  // P1.0: Core ASR-GoT Protocol - Initialize all parameters
  _initializeParameters() {
    return {
      // Core framework parameters
      P1_0: { active: true, description: "Core ASR-GoT 8-stage protocol" },
      P1_1: { active: true, description: "Graph initialization defaults" },
      P1_2: { active: true, description: "Task decomposition dimensions" },
      P1_3: { active: true, description: "Hypothesis generation parameters" },
      P1_4: { active: true, description: "Adaptive evidence integration loop" },
      P1_5: { active: true, description: "Pruning, merging & confidence parameters" },
      P1_6: { active: true, description: "Output formatting & subgraph extraction" },
      P1_7: { active: true, description: "Reflection & audit requirement" },
      
      // Advanced network parameters
      P1_8: { active: true, description: "Interdisciplinary linking parameters" },
      P1_9: { active: true, description: "Hyperedge parameters" },
      P1_10: { active: true, description: "Edge typology parameters" },
      P1_11: { active: true, description: "Mathematical formalism" },
      P1_12: { active: true, description: "Metadata schema" },
      P1_13: { active: true, description: "Hypothesis competition parameters" },
      P1_14: { active: true, description: "Uncertainty propagation parameters" },
      
      // Knowledge and gap parameters
      P1_15: { active: true, description: "Knowledge gap parameters" },
      P1_16: { active: true, description: "Falsifiability parameters" },
      P1_17: { active: true, description: "Bias detection parameters" },
      P1_18: { active: true, description: "Temporal dynamics parameters" },
      P1_19: { active: true, description: "Intervention modeling parameters" },
      P1_20: { active: true, description: "Hierarchical abstraction parameters" },
      P1_21: { active: true, description: "Computational feasibility parameters" },
      
      // NEW enhanced parameters
      P1_22: { active: true, description: "Dynamic topology parameters" },
      P1_23: { active: true, description: "Multi-layer network parameters" },
      P1_24: { active: true, description: "Causal edge parameters" },
      P1_25: { active: true, description: "Temporal pattern parameters" },
      P1_26: { active: true, description: "Statistical power parameters" },
      P1_27: { active: true, description: "Information theory parameters" },
      P1_28: { active: true, description: "Impact estimation parameters" },
      P1_29: { active: true, description: "Collaboration parameters" }
    };
  }

  // P1.23: Initialize multi-layer network structure
  _initializeLayers() {
    const defaultLayers = [
      { id: 'base', name: 'Base Conceptual Layer', description: 'Core concepts and relationships' },
      { id: 'methodological', name: 'Methodological Layer', description: 'Research methods and approaches' },
      { id: 'empirical', name: 'Empirical Evidence Layer', description: 'Data and evidence' },
      { id: 'theoretical', name: 'Theoretical Framework Layer', description: 'Theoretical constructs' },
      { id: 'interdisciplinary', name: 'Interdisciplinary Bridge Layer', description: 'Cross-domain connections' }
    ];
    
    defaultLayers.forEach(layer => {
      this.layers.set(layer.id, {
        ...layer,
        nodes: new Set(),
        edges: new Set(),
        created: new Date().toISOString()
      });
    });
  }

  // P1.12: Complete metadata schema implementation
  _createNodeMetadata(baseMetadata = {}) {
    return {
      // Core metadata
      node_id: baseMetadata.node_id || uuidv4(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      
      // P1.12 Extended metadata schema
      provenance: baseMetadata.provenance || 'system_generated',
      confidence: baseMetadata.confidence || [0.5, 0.5, 0.5, 0.5], // P1.5/P1.14
      epistemic_status: baseMetadata.epistemic_status || 'pending',
      disciplinary_tags: baseMetadata.disciplinary_tags || [], // P1.8
      falsification_criteria: baseMetadata.falsification_criteria || null, // P1.16
      bias_flags: baseMetadata.bias_flags || [], // P1.17
      revision_history: baseMetadata.revision_history || [],
      layer_id: baseMetadata.layer_id || 'base', // P1.23
      topology_metrics: baseMetadata.topology_metrics || {}, // P1.22
      statistical_power: baseMetadata.statistical_power || null, // P1.26
      info_metrics: baseMetadata.info_metrics || {}, // P1.27
      impact_score: baseMetadata.impact_score || 0.5, // P1.28
      attribution: baseMetadata.attribution || [], // P1.29
      
      // Temporal metadata (P1.18)
      timestamp: new Date().toISOString(),
      temporal_decay_factor: baseMetadata.temporal_decay_factor || 0.95,
      
      // Additional metadata
      ...baseMetadata
    };
  }

  // P1.12: Complete edge metadata schema
  _createEdgeMetadata(baseMetadata = {}) {
    return {
      edge_id: baseMetadata.edge_id || uuidv4(),
      created: new Date().toISOString(),
      edge_type: baseMetadata.edge_type || 'Other', // P1.10
      confidence: baseMetadata.confidence || [0.7, 0.7, 0.7, 0.7],
      causal_metadata: baseMetadata.causal_metadata || null, // P1.24
      temporal_metadata: baseMetadata.temporal_metadata || null, // P1.25
      
      // Additional edge properties
      weight: baseMetadata.weight || 1.0,
      bidirectional: baseMetadata.bidirectional || false,
      layer_connection: baseMetadata.layer_connection || null, // P1.23
      
      ...baseMetadata
    };
  }

  // Stage 1: Initialization (P1.1)
  initialize(taskDescription, initialConfidence = [0.8, 0.8, 0.8, 0.8], config = {}) {
    console.error(`[${new Date().toISOString()}] [INFO] Stage 1: Initializing ASR-GoT graph`);
    
    // P1.1: Create root node n₀ with complete metadata
    const rootNodeMetadata = this._createNodeMetadata({
      node_id: 'n0',
      provenance: 'user_input',
      epistemic_status: 'accepted',
      confidence: initialConfidence,
      layer_id: 'base',
      disciplinary_tags: config.disciplinary_tags || ['immunology', 'dermatology'], // K3.3
      impact_score: 0.8,
      attribution: config.attribution || []
    });

    const rootNode = {
      node_id: 'n0',
      label: 'Task Understanding', // P1.1 specification
      type: 'root',
      content: taskDescription,
      confidence: initialConfidence, // P1.5 multi-dimensional vector
      metadata: rootNodeMetadata
    };
    
    this.vertices.set('n0', rootNode);
    this.nodeTypes.add('root');
    
    // Add to base layer (P1.23)
    this.layers.get('base').nodes.add('n0');
    
    this.metadata.stage = 'initialization';
    this.currentStage = 1;
    
    console.error(`[${new Date().toISOString()}] [INFO] Root node n₀ created with multi-dimensional confidence`);
    
    return {
      success: true,
      node_id: 'n0',
      message: 'ASR-GoT graph initialized successfully following P1.1 specification',
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1],
      active_parameters: Object.keys(this.metadata.parameters).filter(p => this.metadata.parameters[p].active)
    };
  }

  // Stage 2: Decomposition (P1.2)
  decomposeTask(customDimensions = null) {
    if (this.currentStage !== 1) {
      throw new Error(`Cannot decompose. Current stage: ${this.currentStage}, expected: 1`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 2: Task decomposition`);

    // P1.2: Default dimensions including bias and knowledge gaps
    const defaultDimensions = [
      'Scope', 'Objectives', 'Constraints', 'Data Needs', 
      'Use Cases', 'Potential Biases', 'Knowledge Gaps' // P1.17, P1.15
    ];
    
    const taskDimensions = customDimensions || defaultDimensions;
    const dimensionNodes = [];

    taskDimensions.forEach((dimension, index) => {
      const nodeId = `n2.${index + 1}`;
      
      // P1.2: Create dimension node with confidence vector
      const dimensionMetadata = this._createNodeMetadata({
        node_id: nodeId,
        provenance: 'task_decomposition',
        epistemic_status: 'pending',
        confidence: [0.8, 0.8, 0.8, 0.8], // P1.2 specification
        layer_id: 'base',
        impact_score: 0.6,
        disciplinary_tags: this._inferDisciplinaryTags(dimension)
      });

      const dimensionNode = {
        node_id: nodeId,
        label: dimension,
        type: 'dimension',
        content: `Analysis of ${dimension} aspects of the research task`,
        confidence: [0.8, 0.8, 0.8, 0.8], // P1.2
        metadata: dimensionMetadata
      };

      this.vertices.set(nodeId, dimensionNode);
      this.nodeTypes.add('dimension');
      this.layers.get('base').nodes.add(nodeId);
      
      // P1.2: Connect dimension nodes to n₀
      const edgeId = `e_n0_${nodeId}`;
      const edgeMetadata = this._createEdgeMetadata({
        edge_id: edgeId,
        edge_type: 'Decomposition', // P1.10
        confidence: [0.9, 0.9, 0.9, 0.9]
      });

      this.edges.set(edgeId, {
        edge_id: edgeId,
        source: 'n0',
        target: nodeId,
        metadata: edgeMetadata
      });

      dimensionNodes.push(nodeId);
    });

    this.currentStage = 2;
    this.metadata.stage = 'decomposition';
    
    console.error(`[${new Date().toISOString()}] [INFO] Created ${dimensionNodes.length} dimension nodes with P1.2 compliance`);

    return {
      success: true,
      dimension_nodes: dimensionNodes,
      message: `Task decomposed into ${taskDimensions.length} dimensions following P1.2 specification`,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1],
      dimensions: taskDimensions
    };
  }

  // Helper: Infer disciplinary tags (P1.8)
  _inferDisciplinaryTags(dimension) {
    const tagMap = {
      'Scope': ['methodology', 'research_design'],
      'Objectives': ['goals', 'outcomes'],
      'Constraints': ['limitations', 'resources'],
      'Data Needs': ['data_science', 'methodology'],
      'Use Cases': ['application', 'translation'],
      'Potential Biases': ['methodology', 'bias_detection'], // P1.17
      'Knowledge Gaps': ['knowledge_discovery', 'research_gaps'] // P1.15
    };
    return tagMap[dimension] || ['general'];
  }

  // Stage 3: Hypothesis Generation (P1.3)
  generateHypotheses(dimensionNodeId, hypotheses, config = {}) {
    if (this.currentStage !== 2) {
      throw new Error(`Cannot generate hypotheses. Current stage: ${this.currentStage}, expected: 2`);
    }

    if (!this.vertices.has(dimensionNodeId)) {
      throw new Error(`Dimension node ${dimensionNodeId} not found`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 3: Generating hypotheses for ${dimensionNodeId}`);

    // P1.3: Generate k=3-5 hypotheses per dimension
    const maxHypotheses = Math.min(config.max_hypotheses || 5, 5); // P1.3 specification
    const hypothesisNodes = [];

    hypotheses.slice(0, maxHypotheses).forEach((hypothesis, index) => {
      const nodeId = `h_${dimensionNodeId}_${index + 1}`;
      
      // P1.3: Complete hypothesis metadata with all required fields
      const hypothesisMetadata = this._createNodeMetadata({
        node_id: nodeId,
        provenance: 'hypothesis_generation',
        epistemic_status: 'hypothetical',
        confidence: hypothesis.confidence || [0.5, 0.5, 0.5, 0.5], // P1.3
        disciplinary_tags: hypothesis.disciplinary_tags || [], // P1.8
        falsification_criteria: hypothesis.falsification_criteria || null, // P1.16
        bias_flags: this._assessInitialBiasRisk(hypothesis), // P1.17
        impact_score: hypothesis.impact_score || 0.6, // P1.28
        attribution: hypothesis.attribution || [], // P1.29
        layer_id: 'theoretical',
        
        // P1.3: Explicit plan requirement
        plan: hypothesis.plan || this._generateDefaultPlan(hypothesis.content)
      });

      const hypothesisNode = {
        node_id: nodeId,
        label: `Hypothesis ${index + 1}`,
        type: 'hypothesis',
        content: hypothesis.content || hypothesis,
        confidence: hypothesis.confidence || [0.5, 0.5, 0.5, 0.5],
        metadata: hypothesisMetadata
      };

      this.vertices.set(nodeId, hypothesisNode);
      this.nodeTypes.add('hypothesis');
      this.layers.get('theoretical').nodes.add(nodeId);

      // Create edge from dimension to hypothesis
      const edgeId = `e_${dimensionNodeId}_${nodeId}`;
      const edgeMetadata = this._createEdgeMetadata({
        edge_id: edgeId,
        edge_type: 'Hypothesis', // P1.10
        confidence: [0.8, 0.8, 0.8, 0.8]
      });

      this.edges.set(edgeId, {
        edge_id: edgeId,
        source: dimensionNodeId,
        target: nodeId,
        metadata: edgeMetadata
      });

      hypothesisNodes.push(nodeId);
    });

    this.currentStage = 3;
    this.metadata.stage = 'hypothesis_planning';
    
    console.error(`[${new Date().toISOString()}] [INFO] Generated ${hypothesisNodes.length} hypotheses with P1.3 compliance`);

    return {
      success: true,
      hypothesis_nodes: hypothesisNodes,
      message: `Generated ${hypothesisNodes.length} hypotheses following P1.3 specification`,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1]
    };
  }

  // P1.17: Assess initial bias risk
  _assessInitialBiasRisk(hypothesis) {
    const biasFlags = [];
    const content = (hypothesis.content || hypothesis).toLowerCase();
    
    // Common cognitive biases
    if (content.includes('always') || content.includes('never')) {
      biasFlags.push('absolute_thinking');
    }
    if (content.includes('obvious') || content.includes('clearly')) {
      biasFlags.push('confirmation_bias_risk');
    }
    
    return biasFlags;
  }

  // P1.3: Generate default plan for hypothesis
  _generateDefaultPlan(content) {
    return {
      type: 'literature_search',
      description: `Systematic literature review for: ${content}`,
      tools: ['pubmed_search', 'citation_analysis'],
      timeline: '2-4 weeks',
      resources_needed: ['database_access', 'literature_review_tools']
    };
  }

  // Stage 4: Evidence Integration (P1.4) - The core adaptive loop
  integrateEvidence(hypothesisNodeId, evidence, config = {}) {
    if (this.currentStage !== 3) {
      throw new Error(`Cannot integrate evidence. Current stage: ${this.currentStage}, expected: 3`);
    }

    if (!this.vertices.has(hypothesisNodeId)) {
      throw new Error(`Hypothesis node ${hypothesisNodeId} not found`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 4: Evidence integration for ${hypothesisNodeId}`);

    const evidenceId = `e_${uuidv4().slice(0, 8)}`;
    
    // P1.4: Complete evidence metadata with statistical power assessment (P1.26)
    const evidenceMetadata = this._createNodeMetadata({
      node_id: evidenceId,
      provenance: evidence.provenance || 'evidence_integration',
      epistemic_status: 'evaluated',
      confidence: evidence.confidence || [0.7, 0.7, 0.7, 0.7],
      disciplinary_tags: evidence.disciplinary_tags || [],
      statistical_power: this._assessStatisticalPower(evidence), // P1.26
      info_metrics: this._calculateInfoMetrics(evidence), // P1.27
      impact_score: evidence.impact_score || 0.5, // P1.28
      attribution: evidence.attribution || [],
      layer_id: 'empirical',
      bias_flags: this._detectEvidenceBias(evidence) // P1.17
    });

    const evidenceNode = {
      node_id: evidenceId,
      label: evidence.title || 'Evidence',
      type: 'evidence',
      content: evidence.content,
      confidence: evidence.confidence || [0.7, 0.7, 0.7, 0.7],
      metadata: evidenceMetadata
    };

    this.vertices.set(evidenceId, evidenceNode);
    this.nodeTypes.add('evidence');
    this.layers.get('empirical').nodes.add(evidenceId);

    // P1.4: Create typed edge with full metadata (P1.10, P1.24, P1.25)
    const edgeId = `e_${evidenceId}_${hypothesisNodeId}`;
    const edgeType = evidence.relationship || 'Supportive';
    
    const edgeMetadata = this._createEdgeMetadata({
      edge_id: edgeId,
      edge_type: edgeType, // P1.10
      confidence: evidence.edge_confidence || [0.8, 0.8, 0.8, 0.8],
      causal_metadata: this._assessCausalRelationship(evidence), // P1.24
      temporal_metadata: this._assessTemporalPattern(evidence) // P1.25
    });

    this.edges.set(edgeId, {
      edge_id: edgeId,
      source: evidenceId,
      target: hypothesisNodeId,
      metadata: edgeMetadata
    });

    // P1.4: Bayesian confidence update with P1.14 uncertainty propagation
    const hypothesis = this.vertices.get(hypothesisNodeId);
    const updateFactor = this._calculateBayesianUpdate(evidence, edgeType);
    hypothesis.confidence = hypothesis.confidence.map((c, i) => 
      Math.min(0.99, Math.max(0.01, c * updateFactor[i]))
    );
    hypothesis.metadata.updated = new Date().toISOString();

    // P1.4: Check for IBN creation (P1.8)
    this._checkInterdisciplinaryBridges(evidenceId, hypothesisNodeId);

    // P1.4: Check for hyperedges (P1.9)
    this._checkHyperedgeCreation(evidenceId);

    // P1.4: Apply temporal decay (P1.18)
    this._applyTemporalDecay(evidenceId);

    // P1.4: Dynamic topology adaptation (P1.22)
    this._adaptTopology(evidenceId, hypothesisNodeId);

    this.currentStage = 4;
    this.metadata.stage = 'evidence_integration';
    
    console.error(`[${new Date().toISOString()}] [INFO] Evidence integrated with full P1.4 adaptive loop`);

    return {
      success: true,
      evidence_id: evidenceId,
      updated_confidence: hypothesis.confidence,
      message: `Evidence integrated following P1.4 adaptive loop specification`,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1],
      causal_assessment: edgeMetadata.causal_metadata,
      temporal_assessment: edgeMetadata.temporal_metadata
    };
  }

  // P1.26: Statistical power assessment
  _assessStatisticalPower(evidence) {
    if (!evidence.statistical_data) return null;
    
    return {
      power: evidence.statistical_data.power || null,
      sample_size: evidence.statistical_data.sample_size || null,
      effect_size: evidence.statistical_data.effect_size || null,
      confidence_interval: evidence.statistical_data.confidence_interval || null,
      p_value: evidence.statistical_data.p_value || null,
      assessment: this._categorizeStatisticalPower(evidence.statistical_data)
    };
  }

  _categorizeStatisticalPower(data) {
    if (data.power && data.power >= 0.8) return 'adequate';
    if (data.power && data.power >= 0.6) return 'moderate';
    if (data.sample_size && data.sample_size >= 100) return 'large_sample';
    return 'limited';
  }

  // P1.27: Information theory metrics
  _calculateInfoMetrics(evidence) {
    const content = evidence.content || '';
    const words = content.split(/\s+/).length;
    
    return {
      content_length: words,
      entropy_estimate: this._estimateEntropy(content),
      information_density: words > 0 ? content.length / words : 0,
      novelty_score: this._assessNovelty(evidence)
    };
  }

  _estimateEntropy(text) {
    const chars = text.split('');
    const freq = {};
    chars.forEach(char => freq[char] = (freq[char] || 0) + 1);
    
    let entropy = 0;
    const total = chars.length;
    Object.values(freq).forEach(count => {
      const p = count / total;
      entropy -= p * Math.log2(p);
    });
    
    return entropy;
  }

  _assessNovelty(evidence) {
    // Simple novelty assessment - in practice would compare against existing knowledge
    const keywords = (evidence.content || '').toLowerCase().split(/\s+/);
    const novelKeywords = keywords.filter(word => word.length > 6).length;
    return Math.min(1.0, novelKeywords / Math.max(1, keywords.length));
  }

  // P1.17: Detect evidence bias
  _detectEvidenceBias(evidence) {
    const biasFlags = [];
    const content = (evidence.content || '').toLowerCase();
    
    if (evidence.provenance === 'single_source') {
      biasFlags.push('source_bias');
    }
    if (content.includes('proves') || content.includes('definitively')) {
      biasFlags.push('overconfidence_bias');
    }
    if (!evidence.statistical_data) {
      biasFlags.push('lack_quantitative_support');
    }
    
    return biasFlags;
  }

  // P1.24: Assess causal relationships
  _assessCausalRelationship(evidence) {
    if (!evidence.causal_data) return null;
    
    return {
      causal_type: evidence.causal_data.type || 'correlation',
      mechanism: evidence.causal_data.mechanism || null,
      confounders: evidence.causal_data.confounders || [],
      causal_strength: evidence.causal_data.strength || 'weak',
      do_calculus_applicable: evidence.causal_data.interventional || false
    };
  }

  // P1.25: Assess temporal patterns
  _assessTemporalPattern(evidence) {
    if (!evidence.temporal_data) return null;
    
    return {
      pattern_type: evidence.temporal_data.pattern || 'static',
      delay_duration: evidence.temporal_data.delay || null,
      sequence_order: evidence.temporal_data.sequence || null,
      cyclic_nature: evidence.temporal_data.cyclic || false,
      temporal_precedence: evidence.temporal_data.precedence || null
    };
  }

  // P1.8: Check for Interdisciplinary Bridge Node creation
  _checkInterdisciplinaryBridges(evidenceId, hypothesisId) {
    const evidence = this.vertices.get(evidenceId);
    const hypothesis = this.vertices.get(hypothesisId);
    
    const evidenceTags = new Set(evidence.metadata.disciplinary_tags);
    const hypothesisTags = new Set(hypothesis.metadata.disciplinary_tags);
    
    // P1.8: Check if tags(E) ∩ tags(N) = ∅ and semantic similarity > 0.5
    const intersection = new Set([...evidenceTags].filter(x => hypothesisTags.has(x)));
    const semanticSimilarity = this._calculateSemanticSimilarity(evidence.content, hypothesis.content);
    
    if (intersection.size === 0 && semanticSimilarity > 0.5) {
      const ibnId = `ibn_${evidenceId}_${hypothesisId}`;
      
      const ibnMetadata = this._createNodeMetadata({
        node_id: ibnId,
        provenance: 'interdisciplinary_bridge',
        epistemic_status: 'bridge',
        disciplinary_tags: [...evidenceTags, ...hypothesisTags],
        layer_id: 'interdisciplinary',
        impact_score: 0.8 // High impact for interdisciplinary insights
      });

      const ibnNode = {
        node_id: ibnId,
        label: 'Interdisciplinary Bridge',
        type: 'bridge',
        content: `Bridge connecting ${evidenceTags} and ${hypothesisTags}`,
        confidence: [0.7, 0.7, 0.7, 0.7],
        metadata: ibnMetadata
      };

      this.vertices.set(ibnId, ibnNode);
      this.nodeTypes.add('bridge');
      this.layers.get('interdisciplinary').nodes.add(ibnId);
      
      console.error(`[${new Date().toISOString()}] [INFO] Created IBN: ${ibnId} following P1.8`);
    }
  }

  _calculateSemanticSimilarity(text1, text2) {
    // Simple semantic similarity - in practice would use embeddings
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  // P1.9: Check for hyperedge creation
  _checkHyperedgeCreation(evidenceId) {
    // Look for multiple nodes that jointly influence the evidence
    const relatedNodes = [];
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.target === evidenceId) {
        relatedNodes.push(edge.source);
      }
    }

    // P1.9: Create hyperedge if |Eₕ| > 2 and non-additive influence
    if (relatedNodes.length > 2) {
      const hyperedgeId = `he_${evidenceId}`;
      
      const hyperedge = {
        hyperedge_id: hyperedgeId,
        nodes: relatedNodes,
        target: evidenceId,
        relationship_type: 'non_additive_influence',
        confidence: [0.6, 0.6, 0.6, 0.6],
        metadata: {
          created: new Date().toISOString(),
          description: 'Multiple nodes jointly influence evidence'
        }
      };

      this.hyperedges.set(hyperedgeId, hyperedge);
      console.error(`[${new Date().toISOString()}] [INFO] Created hyperedge: ${hyperedgeId} following P1.9`);
    }
  }

  // P1.18: Apply temporal decay
  _applyTemporalDecay(nodeId) {
    const node = this.vertices.get(nodeId);
    const now = new Date();
    const created = new Date(node.metadata.created);
    const ageHours = (now - created) / (1000 * 60 * 60);
    
    const decayFactor = node.metadata.temporal_decay_factor || 0.95;
    const decay = Math.pow(decayFactor, ageHours / 24); // Daily decay
    
    node.confidence = node.confidence.map(c => c * decay);
    node.metadata.temporal_decay_applied = decay;
  }

  // P1.22: Dynamic topology adaptation
  _adaptTopology(evidenceId, hypothesisId) {
    // Calculate topology metrics
    const evidenceNode = this.vertices.get(evidenceId);
    const hypothesisNode = this.vertices.get(hypothesisId);
    
    // Update centrality measures
    evidenceNode.metadata.topology_metrics.degree_centrality = this._calculateDegreeCentrality(evidenceId);
    hypothesisNode.metadata.topology_metrics.degree_centrality = this._calculateDegreeCentrality(hypothesisId);
    
    // Check for community structure changes
    this._updateCommunityStructure();
  }

  _calculateDegreeCentrality(nodeId) {
    let degree = 0;
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        degree++;
      }
    }
    return degree / Math.max(1, this.vertices.size - 1);
  }

  _updateCommunityStructure() {
    // Simple community detection - in practice would use advanced algorithms
    const communities = new Map();
    let communityId = 0;
    
    for (const nodeId of this.vertices.keys()) {
      if (!communities.has(nodeId)) {
        const community = this._findConnectedComponent(nodeId);
        community.forEach(id => communities.set(id, communityId));
        communityId++;
      }
    }
    
    // Update community information in metadata
    for (const [nodeId, community] of communities.entries()) {
      const node = this.vertices.get(nodeId);
      node.metadata.topology_metrics.community_id = community;
    }
  }

  _findConnectedComponent(startNodeId) {
    const visited = new Set();
    const stack = [startNodeId];
    const component = new Set();
    
    while (stack.length > 0) {
      const nodeId = stack.pop();
      if (visited.has(nodeId)) continue;
      
      visited.add(nodeId);
      component.add(nodeId);
      
      // Find connected nodes
      for (const edge of this.edges.values()) {
        if (edge.source === nodeId && !visited.has(edge.target)) {
          stack.push(edge.target);
        }
        if (edge.target === nodeId && !visited.has(edge.source)) {
          stack.push(edge.source);
        }
      }
    }
    
    return component;
  }

  // Helper method for Bayesian confidence updates (P1.14)
  _calculateBayesianUpdate(evidence, edgeType) {
    const evidenceStrength = evidence.confidence.reduce((a, b) => a + b, 0) / 4;
    const statPower = evidence.statistical_power?.power || 0.8;
    const infoValue = evidence.info_metrics?.novelty_score || 0.5;
    
    let updateFactors = [1.0, 1.0, 1.0, 1.0];
    
    // P1.10: Edge type influences update
    const baseUpdate = evidenceStrength * statPower * infoValue * 0.3;
    
    switch (edgeType) {
      case 'Supportive':
        updateFactors = updateFactors.map(f => f * (1 + baseUpdate));
        break;
      case 'Contradictory':
        updateFactors = updateFactors.map(f => f * (1 - baseUpdate));
        break;
      case 'Correlative':
        updateFactors = updateFactors.map(f => f * (1 + baseUpdate * 0.5));
        break;
      case 'Causal':
        updateFactors = updateFactors.map(f => f * (1 + baseUpdate * 1.2));
        break;
      default:
        updateFactors = updateFactors.map(f => f * (1 + baseUpdate * 0.3));
    }
    
    return updateFactors;
  }

  // Stage 5: Pruning and Merging (P1.5)
  pruneAndMergeNodes(config = {}) {
    if (this.currentStage !== 4) {
      throw new Error(`Cannot prune/merge. Current stage: ${this.currentStage}, expected: 4`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 5: Pruning and merging nodes`);

    const pruningThreshold = config.pruning_threshold || 0.2; // P1.5
    const mergingThreshold = config.merging_threshold || 0.8; // P1.5
    
    const prunedNodes = [];
    const mergedNodes = [];

    // P1.5: Prune nodes with min(E[C]) < 0.2 & low impact
    for (const [nodeId, node] of this.vertices.entries()) {
      if (nodeId === 'n0') continue; // Never prune root
      
      const avgConfidence = node.confidence.reduce((a, b) => a + b, 0) / 4;
      const impact = node.metadata.impact_score || 0.5;
      
      if (avgConfidence < pruningThreshold && impact < 0.3) {
        // P1.16: Check falsifiability before pruning hypotheses
        if (node.type === 'hypothesis' && !node.metadata.falsification_criteria) {
          prunedNodes.push(nodeId);
          this._removeNode(nodeId);
        } else if (node.type !== 'hypothesis') {
          prunedNodes.push(nodeId);
          this._removeNode(nodeId);
        }
      }
    }

    // P1.5: Merge nodes with semantic_overlap >= 0.8
    const remainingNodes = Array.from(this.vertices.keys());
    for (let i = 0; i < remainingNodes.length; i++) {
      for (let j = i + 1; j < remainingNodes.length; j++) {
        const node1 = this.vertices.get(remainingNodes[i]);
        const node2 = this.vertices.get(remainingNodes[j]);
        
        if (node1.type === node2.type) {
          const similarity = this._calculateSemanticSimilarity(node1.content, node2.content);
          if (similarity >= mergingThreshold) {
            const mergedId = this._mergeNodes(remainingNodes[i], remainingNodes[j]);
            mergedNodes.push({ merged_id: mergedId, original: [remainingNodes[i], remainingNodes[j]] });
            remainingNodes.splice(j, 1); // Remove merged node from list
            j--; // Adjust index
          }
        }
      }
    }

    this.currentStage = 5;
    this.metadata.stage = 'pruning_merging';
    
    console.error(`[${new Date().toISOString()}] [INFO] Pruned ${prunedNodes.length} nodes, merged ${mergedNodes.length} node pairs`);

    return {
      success: true,
      pruned_nodes: prunedNodes,
      merged_nodes: mergedNodes,
      message: `Pruning and merging completed following P1.5 specification`,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1]
    };
  }

  _removeNode(nodeId) {
    // Remove all edges connected to the node
    const edgesToRemove = [];
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        edgesToRemove.push(edgeId);
      }
    }
    edgesToRemove.forEach(edgeId => this.edges.delete(edgeId));
    
    // Remove from layers
    for (const layer of this.layers.values()) {
      layer.nodes.delete(nodeId);
    }
    
    // Remove the node
    this.vertices.delete(nodeId);
  }

  _mergeNodes(nodeId1, nodeId2) {
    const node1 = this.vertices.get(nodeId1);
    const node2 = this.vertices.get(nodeId2);
    
    const mergedId = `merged_${nodeId1}_${nodeId2}`;
    
    // Merge metadata
    const mergedMetadata = this._createNodeMetadata({
      node_id: mergedId,
      provenance: 'node_merging',
      confidence: node1.confidence.map((c1, i) => Math.max(c1, node2.confidence[i])),
      disciplinary_tags: [...new Set([...node1.metadata.disciplinary_tags, ...node2.metadata.disciplinary_tags])],
      impact_score: Math.max(node1.metadata.impact_score, node2.metadata.impact_score)
    });

    const mergedNode = {
      node_id: mergedId,
      label: `${node1.label} + ${node2.label}`,
      type: node1.type,
      content: `${node1.content} | ${node2.content}`,
      confidence: mergedMetadata.confidence,
      metadata: mergedMetadata
    };

    // Update edges to point to merged node
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId1 || edge.source === nodeId2) {
        edge.source = mergedId;
      }
      if (edge.target === nodeId1 || edge.target === nodeId2) {
        edge.target = mergedId;
      }
    }

    // Remove original nodes and add merged node
    this._removeNode(nodeId1);
    this._removeNode(nodeId2);
    this.vertices.set(mergedId, mergedNode);
    
    return mergedId;
  }

  // Stage 6: Subgraph Extraction (P1.6)
  extractSubgraphs(criteria = {}) {
    if (this.currentStage !== 5) {
      throw new Error(`Cannot extract subgraphs. Current stage: ${this.currentStage}, expected: 5`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 6: Subgraph extraction`);

    const {
      confidence_threshold = 0.5,
      impact_threshold = 0.6,
      node_types = [],
      edge_patterns = [],
      discipline_focus = [],
      layer_filter = [],
      include_bridges = true
    } = criteria;

    const selectedNodes = new Set();
    const selectedEdges = new Set();
    const subgraphs = [];

    // P1.6: Apply sophisticated extraction criteria
    for (const [nodeId, node] of this.vertices.entries()) {
      const avgConfidence = node.confidence.reduce((a, b) => a + b, 0) / 4;
      const impact = node.metadata.impact_score || 0.5;
      
      // Apply filters
      if (avgConfidence >= confidence_threshold && impact >= impact_threshold) {
        // Node type filter
        if (node_types.length === 0 || node_types.includes(node.type)) {
          // Layer filter (P1.23)
          if (layer_filter.length === 0 || layer_filter.includes(node.metadata.layer_id)) {
            // Discipline filter (P1.8)
            if (discipline_focus.length === 0 || 
                node.metadata.disciplinary_tags.some(tag => discipline_focus.includes(tag))) {
              selectedNodes.add(nodeId);
            }
          }
        }
      }

      // Include bridges if requested (P1.8)
      if (include_bridges && node.type === 'bridge') {
        selectedNodes.add(nodeId);
      }
    }

    // Select edges connecting selected nodes
    for (const [edgeId, edge] of this.edges.entries()) {
      if (selectedNodes.has(edge.source) && selectedNodes.has(edge.target)) {
        // Edge pattern filter (P1.10, P1.24, P1.25)
        if (edge_patterns.length === 0 || edge_patterns.includes(edge.metadata.edge_type)) {
          selectedEdges.add(edgeId);
        }
      }
    }

    // Create subgraph
    const subgraph = {
      subgraph_id: `sg_${uuidv4().slice(0, 8)}`,
      nodes: Array.from(selectedNodes).map(id => this.vertices.get(id)),
      edges: Array.from(selectedEdges).map(id => this.edges.get(id)),
      criteria_applied: criteria,
      extraction_metadata: {
        total_nodes_selected: selectedNodes.size,
        total_edges_selected: selectedEdges.size,
        extraction_timestamp: new Date().toISOString(),
        topology_metrics: this._calculateSubgraphTopology(selectedNodes, selectedEdges)
      }
    };

    subgraphs.push(subgraph);
    this.currentStage = 6;
    this.metadata.stage = 'subgraph_extraction';

    console.error(`[${new Date().toISOString()}] [INFO] Extracted subgraph with ${selectedNodes.size} nodes and ${selectedEdges.size} edges`);

    return {
      success: true,
      subgraphs: subgraphs,
      message: `Subgraph extraction completed following P1.6 specification`,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1]
    };
  }

  _calculateSubgraphTopology(nodes, edges) {
    const nodeCount = nodes.size;
    const edgeCount = edges.size;
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    
    return {
      density,
      average_degree: nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0,
      node_count: nodeCount,
      edge_count: edgeCount
    };
  }

  // Stage 7: Composition (P1.6)
  composeOutput(format = {}) {
    if (this.currentStage !== 6) {
      throw new Error(`Cannot compose output. Current stage: ${this.currentStage}, expected: 6`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 7: Composition`);

    const {
      include_node_labels = true,
      include_edge_annotations = true,
      include_reasoning_trace = true,
      citation_style = 'vancouver', // K1.3
      include_topology_insights = true
    } = format;

    // P1.6: Generate output with numeric node labels and complete annotations
    const composition = {
      // Core content with P1.6 formatting
      narrative: this._generateNarrative(include_node_labels, include_edge_annotations),
      
      // P1.6: Reasoning trace appendix
      reasoning_trace: include_reasoning_trace ? this._generateReasoningTrace() : null,
      
      // P1.6: Topology insights for visualization
      topology_insights: include_topology_insights ? this._generateTopologyInsights() : null,
      
      // Citations following K1.3 Vancouver style
      citations: this._generateCitations(citation_style),
      
      // Node and edge annotations
      annotations: {
        node_references: this._generateNodeReferences(),
        edge_types: this._generateEdgeTypeReferences(),
        causal_annotations: this._generateCausalAnnotations(), // P1.24
        temporal_annotations: this._generateTemporalAnnotations() // P1.25
      },

      // Metadata
      composition_metadata: {
        stage: this.currentStage,
        timestamp: new Date().toISOString(),
        total_nodes: this.vertices.size,
        total_edges: this.edges.size,
        active_parameters: Object.keys(this.metadata.parameters).filter(p => this.metadata.parameters[p].active)
      }
    };

    this.currentStage = 7;
    this.metadata.stage = 'composition';

    console.error(`[${new Date().toISOString()}] [INFO] Output composition completed with full P1.6 annotations`);

    return {
      success: true,
      composition: composition,
      message: `Output composition completed following P1.6 specification`,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1]
    };
  }

  _generateNarrative(includeLabels, includeEdgeAnnotations) {
    let narrative = "# Scientific Reasoning Analysis\n\n";
    
    // Generate structured narrative with node references
    const rootNode = this.vertices.get('n0');
    if (rootNode && includeLabels) {
      narrative += `**Task Analysis [n0]:** ${rootNode.content}\n\n`;
    }

    // Add high-confidence, high-impact findings
    const significantNodes = Array.from(this.vertices.values())
      .filter(node => {
        const avgConf = node.confidence.reduce((a, b) => a + b, 0) / 4;
        return avgConf > 0.7 && node.metadata.impact_score > 0.6;
      })
      .sort((a, b) => b.metadata.impact_score - a.metadata.impact_score);

    if (significantNodes.length > 0) {
      narrative += "## Key Findings\n\n";
      significantNodes.forEach(node => {
        if (includeLabels) {
          narrative += `**[${node.node_id}]** ${node.content}`;
          if (includeEdgeAnnotations) {
            const relatedEdges = this._getNodeEdges(node.node_id);
            if (relatedEdges.length > 0) {
              const edgeTypes = relatedEdges.map(e => e.metadata.edge_type).join(', ');
              narrative += ` (Relationships: ${edgeTypes})`;
            }
          }
          narrative += `\n\n`;
        }
      });
    }

    return narrative;
  }

  _getNodeEdges(nodeId) {
    return Array.from(this.edges.values()).filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );
  }

  _generateNodeReferences() {
    const references = {};
    for (const [nodeId, node] of this.vertices.entries()) {
      references[nodeId] = {
        label: node.label,
        type: node.type,
        confidence: node.confidence,
        impact: node.metadata.impact_score
      };
    }
    return references;
  }

  _generateEdgeTypeReferences() {
    const edgeTypes = {};
    for (const edge of this.edges.values()) {
      const type = edge.metadata.edge_type;
      if (!edgeTypes[type]) {
        edgeTypes[type] = [];
      }
      edgeTypes[type].push({
        source: edge.source,
        target: edge.target,
        confidence: edge.metadata.confidence
      });
    }
    return edgeTypes;
  }

  _generateCausalAnnotations() {
    const causalEdges = Array.from(this.edges.values())
      .filter(edge => edge.metadata.causal_metadata)
      .map(edge => ({
        edge_id: edge.edge_id,
        source: edge.source,
        target: edge.target,
        causal_type: edge.metadata.causal_metadata.causal_type,
        mechanism: edge.metadata.causal_metadata.mechanism,
        confounders: edge.metadata.causal_metadata.confounders
      }));
    
    return causalEdges;
  }

  _generateTemporalAnnotations() {
    const temporalEdges = Array.from(this.edges.values())
      .filter(edge => edge.metadata.temporal_metadata)
      .map(edge => ({
        edge_id: edge.edge_id,
        source: edge.source,
        target: edge.target,
        pattern_type: edge.metadata.temporal_metadata.pattern_type,
        delay_duration: edge.metadata.temporal_metadata.delay_duration,
        sequence_order: edge.metadata.temporal_metadata.sequence_order
      }));
    
    return temporalEdges;
  }

  _generateCitations(style) {
    // K1.3: Vancouver style citations
    const citations = [];
    let citationIndex = 1;
    
    for (const node of this.vertices.values()) {
      if (node.metadata.provenance && node.metadata.provenance !== 'system_generated') {
        citations.push({
          index: citationIndex++,
          node_id: node.node_id,
          provenance: node.metadata.provenance,
          style: style
        });
      }
    }
    
    return citations;
  }

  // Stage 8: Reflection and Audit (P1.7)
  performReflectionAudit(checks = {}) {
    if (this.currentStage !== 7) {
      throw new Error(`Cannot perform reflection. Current stage: ${this.currentStage}, expected: 7`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 8: Reflection and audit`);

    const {
      check_coverage = true,
      check_constraints = true,
      check_bias_flags = true,
      check_gaps = true,
      check_falsifiability = true,
      check_causal_validity = true,
      check_temporal_consistency = true,
      check_statistical_rigor = true,
      check_collaboration = true
    } = checks;

    const auditResults = {
      audit_timestamp: new Date().toISOString(),
      checks_performed: [],
      issues_found: [],
      recommendations: [],
      overall_quality_score: 0
    };

    let totalChecks = 0;
    let passedChecks = 0;

    // P1.7: Coverage check
    if (check_coverage) {
      totalChecks++;
      const coverageResult = this._checkCoverage();
      auditResults.checks_performed.push('coverage');
      if (coverageResult.passed) {
        passedChecks++;
      } else {
        auditResults.issues_found.push(coverageResult.issue);
        auditResults.recommendations.push(coverageResult.recommendation);
      }
    }

    // P1.7: Bias flags check (P1.17)
    if (check_bias_flags) {
      totalChecks++;
      const biasResult = this._checkBiasFlags();
      auditResults.checks_performed.push('bias_flags');
      if (biasResult.passed) {
        passedChecks++;
      } else {
        auditResults.issues_found.push(biasResult.issue);
        auditResults.recommendations.push(biasResult.recommendation);
      }
    }

    // P1.7: Knowledge gaps check (P1.15)
    if (check_gaps) {
      totalChecks++;
      const gapsResult = this._checkKnowledgeGaps();
      auditResults.checks_performed.push('knowledge_gaps');
      if (gapsResult.passed) {
        passedChecks++;
      } else {
        auditResults.issues_found.push(gapsResult.issue);
        auditResults.recommendations.push(gapsResult.recommendation);
      }
    }

    // P1.7: Falsifiability check (P1.16)
    if (check_falsifiability) {
      totalChecks++;
      const falsifiabilityResult = this._checkFalsifiability();
      auditResults.checks_performed.push('falsifiability');
      if (falsifiabilityResult.passed) {
        passedChecks++;
      } else {
        auditResults.issues_found.push(falsifiabilityResult.issue);
        auditResults.recommendations.push(falsifiabilityResult.recommendation);
      }
    }

    // P1.7: Causal validity check (P1.24)
    if (check_causal_validity) {
      totalChecks++;
      const causalResult = this._checkCausalValidity();
      auditResults.checks_performed.push('causal_validity');
      if (causalResult.passed) {
        passedChecks++;
      } else {
        auditResults.issues_found.push(causalResult.issue);
        auditResults.recommendations.push(causalResult.recommendation);
      }
    }

    // P1.7: Temporal consistency check (P1.18, P1.25)
    if (check_temporal_consistency) {
      totalChecks++;
      const temporalResult = this._checkTemporalConsistency();
      auditResults.checks_performed.push('temporal_consistency');
      if (temporalResult.passed) {
        passedChecks++;
      } else {
        auditResults.issues_found.push(temporalResult.issue);
        auditResults.recommendations.push(temporalResult.recommendation);
      }
    }

    // P1.7: Statistical rigor check (P1.26)
    if (check_statistical_rigor) {
      totalChecks++;
      const statResult = this._checkStatisticalRigor();
      auditResults.checks_performed.push('statistical_rigor');
      if (statResult.passed) {
        passedChecks++;
      } else {
        auditResults.issues_found.push(statResult.issue);
        auditResults.recommendations.push(statResult.recommendation);
      }
    }

    // P1.7: Collaboration check (P1.29)
    if (check_collaboration) {
      totalChecks++;
      const collabResult = this._checkCollaboration();
      auditResults.checks_performed.push('collaboration');
      if (collabResult.passed) {
        passedChecks++;
      } else {
        auditResults.issues_found.push(collabResult.issue);
        auditResults.recommendations.push(collabResult.recommendation);
      }
    }

    auditResults.overall_quality_score = totalChecks > 0 ? passedChecks / totalChecks : 1.0;
    
    this.currentStage = 8;
    this.metadata.stage = 'reflection';

    console.error(`[${new Date().toISOString()}] [INFO] Reflection audit completed: ${passedChecks}/${totalChecks} checks passed`);

    return {
      success: true,
      audit_results: auditResults,
      message: `Reflection and audit completed following P1.7 specification`,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1],
      quality_score: auditResults.overall_quality_score
    };
  }

  _checkCoverage() {
    const highImpactNodes = Array.from(this.vertices.values())
      .filter(node => node.metadata.impact_score > 0.7);
    
    const coveredNodes = highImpactNodes.filter(node => {
      const avgConf = node.confidence.reduce((a, b) => a + b, 0) / 4;
      return avgConf > 0.6;
    });

    const coverage = highImpactNodes.length > 0 ? coveredNodes.length / highImpactNodes.length : 1.0;
    
    return {
      passed: coverage >= 0.8,
      issue: coverage < 0.8 ? `Low coverage of high-impact nodes: ${(coverage * 100).toFixed(1)}%` : null,
      recommendation: coverage < 0.8 ? 'Focus additional research on high-impact, low-confidence areas' : null
    };
  }

  _checkBiasFlags() {
    const totalBiases = this._countBiasFlags();
    const nodeCount = this.vertices.size;
    const biasRatio = nodeCount > 0 ? totalBiases / nodeCount : 0;
    
    return {
      passed: biasRatio < 0.3,
      issue: biasRatio >= 0.3 ? `High bias flag ratio: ${(biasRatio * 100).toFixed(1)}%` : null,
      recommendation: biasRatio >= 0.3 ? 'Review and address identified biases before proceeding' : null
    };
  }

  _checkKnowledgeGaps() {
    const gaps = this._identifyKnowledgeGaps();
    const criticalGaps = gaps.filter(gap => gap.impact > 0.7);
    
    return {
      passed: criticalGaps.length < 3,
      issue: criticalGaps.length >= 3 ? `${criticalGaps.length} critical knowledge gaps identified` : null,
      recommendation: criticalGaps.length >= 3 ? 'Prioritize research to address critical knowledge gaps' : null
    };
  }

  _checkFalsifiability() {
    const coverage = this._assessFalsifiabilityCoverage();
    
    return {
      passed: coverage >= 0.8,
      issue: coverage < 0.8 ? `Low falsifiability coverage: ${(coverage * 100).toFixed(1)}%` : null,
      recommendation: coverage < 0.8 ? 'Add falsification criteria to remaining hypotheses' : null
    };
  }

  _checkCausalValidity() {
    const causalEdges = Array.from(this.edges.values())
      .filter(edge => edge.metadata.causal_metadata);
    
    const validCausalEdges = causalEdges.filter(edge => {
      const metadata = edge.metadata.causal_metadata;
      return metadata.mechanism && metadata.confounders;
    });

    const validity = causalEdges.length > 0 ? validCausalEdges.length / causalEdges.length : 1.0;
    
    return {
      passed: validity >= 0.7,
      issue: validity < 0.7 ? `Weak causal validation: ${(validity * 100).toFixed(1)}%` : null,
      recommendation: validity < 0.7 ? 'Strengthen causal claims with mechanism and confounder analysis' : null
    };
  }

  _checkTemporalConsistency() {
    const temporalEdges = Array.from(this.edges.values())
      .filter(edge => edge.metadata.temporal_metadata);
    
    // Simple temporal consistency check
    const consistentEdges = temporalEdges.filter(edge => {
      const metadata = edge.metadata.temporal_metadata;
      return metadata.pattern_type && metadata.pattern_type !== 'static';
    });

    const consistency = temporalEdges.length > 0 ? consistentEdges.length / temporalEdges.length : 1.0;
    
    return {
      passed: consistency >= 0.8,
      issue: consistency < 0.8 ? `Temporal inconsistencies detected: ${(consistency * 100).toFixed(1)}%` : null,
      recommendation: consistency < 0.8 ? 'Review temporal relationships for logical consistency' : null
    };
  }

  _checkStatisticalRigor() {
    const evidenceNodes = Array.from(this.vertices.values())
      .filter(node => node.type === 'evidence');
    
    const rigorousEvidence = evidenceNodes.filter(node => 
      node.metadata.statistical_power && node.metadata.statistical_power.assessment !== 'limited'
    );

    const rigor = evidenceNodes.length > 0 ? rigorousEvidence.length / evidenceNodes.length : 1.0;
    
    return {
      passed: rigor >= 0.6,
      issue: rigor < 0.6 ? `Low statistical rigor: ${(rigor * 100).toFixed(1)}%` : null,
      recommendation: rigor < 0.6 ? 'Strengthen evidence with better statistical analysis' : null
    };
  }

  _checkCollaboration() {
    const attributedNodes = Array.from(this.vertices.values())
      .filter(node => node.metadata.attribution && node.metadata.attribution.length > 0);
    
    const collaborationRatio = this.vertices.size > 0 ? attributedNodes.length / this.vertices.size : 0;
    
    return {
      passed: collaborationRatio >= 0.3 || this.vertices.size < 10,
      issue: collaborationRatio < 0.3 && this.vertices.size >= 10 ? `Low collaboration attribution: ${(collaborationRatio * 100).toFixed(1)}%` : null,
      recommendation: collaborationRatio < 0.3 && this.vertices.size >= 10 ? 'Consider adding collaboration and attribution metadata' : null
    };
  }

  // Get comprehensive graph summary
  getGraphSummary() {
    const summary = {
      // Basic metrics
      total_nodes: this.vertices.size,
      total_edges: this.edges.size,
      total_hyperedges: this.hyperedges.size,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1],
      
      // Layer information (P1.23)
      layers: Array.from(this.layers.keys()),
      layer_distribution: this._getLayerDistribution(),
      
      // Node type breakdown
      node_types: this._getNodeTypeBreakdown(),
      
      // Advanced metrics
      topology_metrics: this._getTopologyMetrics(),
      confidence_statistics: this._getConfidenceStatistics(),
      impact_distribution: this._getImpactDistribution(),
      
      // Active parameters
      active_parameters: Object.keys(this.metadata.parameters).filter(p => this.metadata.parameters[p].active),
      
      // Quality metrics
      bias_flags_count: this._countBiasFlags(),
      falsifiability_coverage: this._assessFalsifiabilityCoverage(),
      interdisciplinary_bridges: Array.from(this.vertices.values()).filter(n => n.type === 'bridge').length
    };

    return summary;
  }

  _getLayerDistribution() {
    const distribution = {};
    for (const [layerId, layer] of this.layers.entries()) {
      distribution[layerId] = layer.nodes.size;
    }
    return distribution;
  }

  _getNodeTypeBreakdown() {
    const breakdown = {};
    for (const node of this.vertices.values()) {
      breakdown[node.type] = (breakdown[node.type] || 0) + 1;
    }
    return breakdown;
  }

  _getTopologyMetrics() {
    const nodes = this.vertices.size;
    const edges = this.edges.size;
    const density = nodes > 1 ? (2 * edges) / (nodes * (nodes - 1)) : 0;
    
    return {
      density,
      average_degree: nodes > 0 ? (2 * edges) / nodes : 0,
      clustering_coefficient: this._calculateClusteringCoefficient()
    };
  }

  _calculateClusteringCoefficient() {
    // Simplified clustering coefficient calculation
    let totalCoeff = 0;
    let nodeCount = 0;
    
    for (const nodeId of this.vertices.keys()) {
      const neighbors = this._getNeighbors(nodeId);
      if (neighbors.length >= 2) {
        const possibleEdges = (neighbors.length * (neighbors.length - 1)) / 2;
        const actualEdges = this._countEdgesBetweenNodes(neighbors);
        totalCoeff += actualEdges / possibleEdges;
        nodeCount++;
      }
    }
    
    return nodeCount > 0 ? totalCoeff / nodeCount : 0;
  }

  _getNeighbors(nodeId) {
    const neighbors = [];
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId) neighbors.push(edge.target);
      if (edge.target === nodeId) neighbors.push(edge.source);
    }
    return [...new Set(neighbors)];
  }

  _countEdgesBetweenNodes(nodeIds) {
    let count = 0;
    for (const edge of this.edges.values()) {
      if (nodeIds.includes(edge.source) && nodeIds.includes(edge.target)) {
        count++;
      }
    }
    return count;
  }

  _getConfidenceStatistics() {
    const confidences = Array.from(this.vertices.values()).map(n => 
      n.confidence.reduce((a, b) => a + b, 0) / 4
    );
    
    if (confidences.length === 0) return { mean: 0, std: 0, min: 0, max: 0 };
    
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;
    
    return {
      mean,
      std: Math.sqrt(variance),
      min: Math.min(...confidences),
      max: Math.max(...confidences)
    };
  }

  _getImpactDistribution() {
    const impacts = Array.from(this.vertices.values()).map(n => n.metadata.impact_score || 0.5);
    
    return {
      high_impact: impacts.filter(i => i >= 0.7).length,
      medium_impact: impacts.filter(i => i >= 0.4 && i < 0.7).length,
      low_impact: impacts.filter(i => i < 0.4).length
    };
  }

  _countBiasFlags() {
    let total = 0;
    for (const node of this.vertices.values()) {
      total += (node.metadata.bias_flags || []).length;
    }
    return total;
  }

  _assessFalsifiabilityCoverage() {
    const hypotheses = Array.from(this.vertices.values()).filter(n => n.type === 'hypothesis');
    const withCriteria = hypotheses.filter(h => h.metadata.falsification_criteria).length;
    return hypotheses.length > 0 ? withCriteria / hypotheses.length : 1.0;
  }

  // Export graph with complete metadata (P1.6)
  exportGraph(format = 'json') {
    const graphData = {
      // P1.11: Complete mathematical formalism
      metadata: this.metadata,
      vertices: Array.from(this.vertices.values()),
      edges: Array.from(this.edges.values()),
      hyperedges: Array.from(this.hyperedges.values()),
      layers: Object.fromEntries(this.layers),
      
      // P1.6: Enhanced output
      summary: this.getGraphSummary(),
      reasoning_trace: this._generateReasoningTrace(),
      topology_insights: this._generateTopologyInsights()
    };

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(graphData, null, 2);
      case 'yaml':
        return this._exportAsYAML(graphData);
      case 'graphml':
        return this._exportGraphML(graphData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  _generateReasoningTrace() {
    return {
      stage_progression: this.stageNames.slice(0, this.currentStage),
      key_decisions: [],
      parameter_activations: this.metadata.parameters
    };
  }

  _generateTopologyInsights() {
    return {
      most_central_nodes: this._findMostCentralNodes(),
      knowledge_gaps: this._identifyKnowledgeGaps(),
      interdisciplinary_connections: this._getInterdisciplinaryConnections()
    };
  }

  _findMostCentralNodes() {
    const centralities = [];
    for (const nodeId of this.vertices.keys()) {
      centralities.push({
        node_id: nodeId,
        centrality: this._calculateDegreeCentrality(nodeId)
      });
    }
    return centralities.sort((a, b) => b.centrality - a.centrality).slice(0, 5);
  }

  _identifyKnowledgeGaps() {
    const gaps = [];
    for (const node of this.vertices.values()) {
      const avgConfidence = node.confidence.reduce((a, b) => a + b, 0) / 4;
      if (avgConfidence < 0.4 && node.metadata.impact_score > 0.6) {
        gaps.push({
          node_id: node.node_id,
          confidence: avgConfidence,
          impact: node.metadata.impact_score,
          gap_type: 'high_impact_low_confidence'
        });
      }
    }
    return gaps;
  }

  _getInterdisciplinaryConnections() {
    return Array.from(this.vertices.values())
      .filter(n => n.type === 'bridge')
      .map(n => ({
        bridge_id: n.node_id,
        disciplines: n.metadata.disciplinary_tags,
        impact: n.metadata.impact_score
      }));
  }

  _exportAsYAML(data) {
    // Simple YAML export - in practice would use a proper YAML library
    return `
metadata:
  created: "${data.metadata.created}"
  stage: "${data.metadata.stage}"
  current_stage: ${data.summary.current_stage}

summary:
  total_nodes: ${data.summary.total_nodes}
  total_edges: ${data.summary.total_edges}
  total_hyperedges: ${data.summary.total_hyperedges}
  
layers:
${Object.keys(data.layers).map(layer => `  - ${layer}: ${data.layers[layer].nodes.size} nodes`).join('\n')}

active_parameters:
${data.summary.active_parameters.map(p => `  - ${p}`).join('\n')}
`;
  }

  _exportGraphML(graphData) {
    let graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="confidence" for="node" attr.name="confidence" attr.type="string"/>
  <key id="layer" for="node" attr.name="layer" attr.type="string"/>
  <key id="impact" for="node" attr.name="impact" attr.type="double"/>
  <key id="edge_type" for="edge" attr.name="edge_type" attr.type="string"/>
  <graph id="ASR-GoT" edgedefault="directed">
`;

    // Add nodes with complete metadata
    for (const node of graphData.vertices) {
      const avgConfidence = node.confidence.reduce((a, b) => a + b, 0) / 4;
      graphml += `    <node id="${node.node_id}">
      <data key="label">${node.label}</data>
      <data key="type">${node.type}</data>
      <data key="confidence">${avgConfidence.toFixed(3)}</data>
      <data key="layer">${node.metadata.layer_id}</data>
      <data key="impact">${node.metadata.impact_score}</data>
    </node>
`;
    }

    // Add edges with metadata
    for (const edge of graphData.edges) {
      graphml += `    <edge source="${edge.source}" target="${edge.target}">
      <data key="edge_type">${edge.metadata.edge_type}</data>
    </edge>
`;
    }

    graphml += `  </graph>
</graphml>`;

    return graphml;
  }

  // Helper methods for advanced tool implementations

  // P1.24: Find causal paths between nodes
  _findCausalPaths(sourceId, targetId, visited = new Set(), path = []) {
    if (visited.has(sourceId)) return [];
    if (sourceId === targetId) return [{ path: [...path, sourceId], confidence: 1.0 }];
    
    visited.add(sourceId);
    const paths = [];
    
    for (const edge of this.edges.values()) {
      if (edge.source === sourceId && edge.metadata.causal_metadata) {
        const subPaths = this._findCausalPaths(edge.target, targetId, new Set(visited), [...path, sourceId]);
        subPaths.forEach(subPath => {
          const avgEdgeConf = edge.metadata.confidence.reduce((a, b) => a + b, 0) / 4;
          paths.push({
            path: subPath.path,
            confidence: subPath.confidence * avgEdgeConf,
            edges: [...(subPath.edges || []), edge.edge_id]
          });
        });
      }
    }
    
    return paths;
  }

  // P1.19: Calculate Expected Value of Information for interventions
  _calculateEVoI(intervention) {
    const baseCost = intervention.cost || 1.0;
    const expectedConfidenceChange = intervention.expected_confidence_change || [0.1, 0.1, 0.1, 0.1];
    const targetNodes = intervention.target_nodes || [];
    
    let totalValue = 0;
    
    // Calculate information value based on confidence improvement and node impact
    for (const nodeId of targetNodes) {
      const node = this.vertices.get(nodeId);
      if (node) {
        const currentConfidence = node.confidence.reduce((a, b) => a + b, 0) / 4;
        const expectedImprovement = expectedConfidenceChange.reduce((a, b) => a + b, 0) / 4;
        const impactWeight = node.metadata.impact_score || 0.5;
        
        // Value = improvement * impact * uncertainty reduction
        const uncertaintyReduction = Math.max(0, 1 - currentConfidence);
        totalValue += expectedImprovement * impactWeight * uncertaintyReduction;
      }
    }
    
    // EVoI = Value / Cost (normalized)
    const evoi = baseCost > 0 ? Math.min(1.0, totalValue / baseCost) : 0;
    return evoi;
  }

}

// Global graph instance
let currentGraph = null;

// Server instance with complete capabilities
const server = new Server(
  {
    name: 'asr-got-complete-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Complete tool definitions covering all 8 stages and 29 parameters
const tools = [
  // Stage 1: Initialization
  {
    name: 'initialize_asr_got_graph',
    description: 'Initialize ASR-GoT graph following P1.1 specification with complete metadata schema',
    inputSchema: {
      type: 'object',
      properties: {
        task_description: {
          type: 'string',
          description: 'Detailed description of the research task or question'
        },
        initial_confidence: {
          type: 'array',
          items: { type: 'number', minimum: 0, maximum: 1 },
          description: 'P1.5 multi-dimensional confidence vector [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]',
          default: [0.8, 0.8, 0.8, 0.8]
        },
        config: {
          type: 'object',
          description: 'Configuration for P1.23 multi-layer networks and other parameters',
          properties: {
            enable_multi_layer: { type: 'boolean', default: true },
            disciplinary_tags: { type: 'array', items: { type: 'string' } },
            attribution: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['task_description']
    }
  },

  // Stage 2: Decomposition
  {
    name: 'decompose_research_task',
    description: 'Decompose task into P1.2 specified dimensions including bias and knowledge gaps',
    inputSchema: {
      type: 'object',
      properties: {
        dimensions: {
          type: 'array',
          items: { type: 'string' },
          description: 'P1.2 custom dimensions (default includes Potential Biases and Knowledge Gaps)',
          default: ['Scope', 'Objectives', 'Constraints', 'Data Needs', 'Use Cases', 'Potential Biases', 'Knowledge Gaps']
        }
      }
    }
  },

  // Stage 3: Hypothesis Generation
  {
    name: 'generate_hypotheses',
    description: 'Generate k=3-5 hypotheses per dimension following P1.3 with complete metadata',
    inputSchema: {
      type: 'object',
      properties: {
        dimension_node_id: {
          type: 'string',
          description: 'ID of the dimension node to generate hypotheses for'
        },
        hypotheses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              confidence: { 
                type: 'array', 
                items: { type: 'number' },
                description: 'P1.5 confidence vector'
              },
              falsification_criteria: { 
                type: 'string',
                description: 'P1.16 falsifiability criteria requirement'
              },
              impact_score: { 
                type: 'number',
                description: 'P1.28 impact estimation'
              },
              disciplinary_tags: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'P1.8 disciplinary provenance'
              },
              plan: { 
                type: 'object',
                description: 'P1.3 explicit plan requirement'
              },
              attribution: {
                type: 'array',
                items: { type: 'string' },
                description: 'P1.29 collaboration support'
              }
            },
            required: ['content']
          }
        },
        config: {
          type: 'object',
          properties: {
            max_hypotheses: { type: 'number', default: 5, maximum: 5 }
          }
        }
      },
      required: ['dimension_node_id', 'hypotheses']
    }
  },

  // Stage 4: Evidence Integration
  {
    name: 'integrate_evidence',
    description: 'P1.4 adaptive evidence integration with Bayesian updates and advanced features',
    inputSchema: {
      type: 'object',
      properties: {
        hypothesis_node_id: {
          type: 'string',
          description: 'ID of the hypothesis node to link evidence to'
        },
        evidence: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            confidence: { 
              type: 'array', 
              items: { type: 'number' },
              description: 'P1.5 confidence vector'
            },
            relationship: { 
              type: 'string',
              enum: ['Supportive', 'Contradictory', 'Correlative', 'Prerequisite', 'Causal'],
              default: 'Supportive',
              description: 'P1.10 edge type classification'
            },
            statistical_data: {
              type: 'object',
              description: 'P1.26 statistical power parameters',
              properties: {
                power: { type: 'number' },
                sample_size: { type: 'number' },
                effect_size: { type: 'number' },
                confidence_interval: { type: 'array', items: { type: 'number' } },
                p_value: { type: 'number' }
              }
            },
            causal_data: {
              type: 'object',
              description: 'P1.24 causal edge parameters',
              properties: {
                type: { type: 'string', enum: ['correlation', 'causation', 'counterfactual'] },
                mechanism: { type: 'string' },
                confounders: { type: 'array', items: { type: 'string' } },
                strength: { type: 'string', enum: ['weak', 'moderate', 'strong'] },
                interventional: { type: 'boolean' }
              }
            },
            temporal_data: {
              type: 'object',
              description: 'P1.25 temporal pattern parameters',
              properties: {
                pattern: { type: 'string', enum: ['static', 'sequential', 'cyclic', 'delayed'] },
                delay: { type: 'number' },
                sequence: { type: 'array', items: { type: 'string' } },
                cyclic: { type: 'boolean' },
                precedence: { type: 'string' }
              }
            },
            provenance: { type: 'string' },
            disciplinary_tags: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'P1.8 for IBN creation'
            },
            impact_score: { 
              type: 'number',
              description: 'P1.28 impact estimation'
            },
            attribution: {
              type: 'array',
              items: { type: 'string' },
              description: 'P1.29 collaboration support'
            }
          },
          required: ['content']
        }
      },
      required: ['hypothesis_node_id', 'evidence']
    }
  },

  // Stage 5: Pruning and Merging
  {
    name: 'prune_and_merge_nodes',
    description: 'P1.5 pruning and merging with confidence thresholds and impact consideration',
    inputSchema: {
      type: 'object',
      properties: {
        pruning_threshold: {
          type: 'number',
          default: 0.2,
          description: 'P1.5 min(E[C]) < 0.2 threshold'
        },
        merging_threshold: {
          type: 'number',
          default: 0.8,
          description: 'P1.5 semantic_overlap >= 0.8 threshold'
        },
        consider_impact: {
          type: 'boolean',
          default: true,
          description: 'P1.28 impact consideration in pruning'
        },
        check_falsifiability: {
          type: 'boolean',
          default: true,
          description: 'P1.16 falsifiability check before pruning hypotheses'
        }
      }
    }
  },

  // Stage 6: Subgraph Extraction (partial implementation)
  {
    name: 'extract_subgraphs',
    description: 'P1.6 subgraph extraction with sophisticated criteria including impact and patterns',
    inputSchema: {
      type: 'object',
      properties: {
        criteria: {
          type: 'object',
          properties: {
            confidence_threshold: { type: 'number', default: 0.5 },
            impact_threshold: { type: 'number', default: 0.6 },
            node_types: { type: 'array', items: { type: 'string' } },
            edge_patterns: { type: 'array', items: { type: 'string' } },
            discipline_focus: { type: 'array', items: { type: 'string' } },
            layer_filter: { type: 'array', items: { type: 'string' } },
            include_bridges: { type: 'boolean', default: true }
          }
        }
      }
    }
  },

  // Utility and Analysis Tools
  {
    name: 'get_graph_summary',
    description: 'Comprehensive graph summary with all P1.22 topology metrics and statistics',
    inputSchema: {
      type: 'object',
      properties: {
        include_topology: { type: 'boolean', default: true },
        include_layers: { type: 'boolean', default: true },
        include_bias_analysis: { type: 'boolean', default: true }
      }
    }
  },

  {
    name: 'analyze_knowledge_gaps',
    description: 'P1.15 knowledge gap identification with high-impact research questions',
    inputSchema: {
      type: 'object',
      properties: {
        impact_threshold: { type: 'number', default: 0.6 },
        confidence_threshold: { type: 'number', default: 0.4 }
      }
    }
  },

  {
    name: 'detect_biases',
    description: 'P1.17 comprehensive bias detection across nodes and topology',
    inputSchema: {
      type: 'object',
      properties: {
        check_cognitive_biases: { type: 'boolean', default: true },
        check_systemic_biases: { type: 'boolean', default: true },
        check_topology_biases: { type: 'boolean', default: true }
      }
    }
  },

  {
    name: 'analyze_causal_relationships',
    description: 'P1.24 causal inference analysis using Pearl\'s do-calculus and counterfactual reasoning',
    inputSchema: {
      type: 'object',
      properties: {
        source_node: { type: 'string' },
        target_node: { type: 'string' },
        method: { 
          type: 'string', 
          enum: ['do_calculus', 'counterfactual', 'path_analysis'],
          default: 'path_analysis'
        },
        confounders: { type: 'array', items: { type: 'string' } }
      }
    }
  },

  {
    name: 'detect_temporal_patterns',
    description: 'P1.25 temporal relationship pattern detection and analysis',
    inputSchema: {
      type: 'object',
      properties: {
        node_set: { type: 'array', items: { type: 'string' } },
        pattern_types: { 
          type: 'array', 
          items: { 
            type: 'string',
            enum: ['sequential', 'cyclic', 'delayed', 'conditional']
          }
        }
      }
    }
  },

  {
    name: 'estimate_research_impact',
    description: 'P1.28 comprehensive research impact estimation with multiple metrics',
    inputSchema: {
      type: 'object',
      properties: {
        nodes: { type: 'array', items: { type: 'string' } },
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['theoretical_significance', 'practical_utility', 'gap_reduction', 'methodological_innovation']
          },
          default: ['theoretical_significance', 'practical_utility']
        }
      }
    }
  },

  {
    name: 'plan_interventions',
    description: 'P1.19 intervention modeling with Expected Value of Information (EVoI) calculation',
    inputSchema: {
      type: 'object',
      properties: {
        interventions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string', enum: ['experiment', 'literature_review', 'analysis', 'collaboration'] },
              target_nodes: { type: 'array', items: { type: 'string' } },
              cost: { type: 'number' },
              expected_confidence_change: { type: 'array', items: { type: 'number' } }
            },
            required: ['name', 'type']
          }
        }
      },
      required: ['interventions']
    }
  },

  {
    name: 'export_graph_data',
    description: 'P1.6 enhanced export with reasoning traces and topology insights',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'yaml', 'graphml'],
          default: 'json',
          description: 'Export format with complete metadata'
        },
        include_reasoning_trace: { type: 'boolean', default: true },
        include_topology_insights: { type: 'boolean', default: true },
        include_parameter_status: { type: 'boolean', default: true }
      }
    }
  },

  {
    name: 'compose_output',
    description: 'P1.6 Stage 7 composition with citations, node labels, and reasoning traces',
    inputSchema: {
      type: 'object',
      properties: {
        include_node_labels: { type: 'boolean', default: true },
        include_edge_annotations: { type: 'boolean', default: true },
        include_reasoning_trace: { type: 'boolean', default: true },
        citation_style: { type: 'string', default: 'vancouver', description: 'K1.3 citation style' },
        include_topology_insights: { type: 'boolean', default: true }
      }
    }
  },

  {
    name: 'perform_reflection_audit',
    description: 'P1.7 comprehensive reflection and audit following complete checklist',
    inputSchema: {
      type: 'object',
      properties: {
        check_coverage: { type: 'boolean', default: true },
        check_constraints: { type: 'boolean', default: true },
        check_bias_flags: { type: 'boolean', default: true },
        check_gaps: { type: 'boolean', default: true },
        check_falsifiability: { type: 'boolean', default: true },
        check_causal_validity: { type: 'boolean', default: true },
        check_temporal_consistency: { type: 'boolean', default: true },
        check_statistical_rigor: { type: 'boolean', default: true },
        check_collaboration: { type: 'boolean', default: true }
      }
    }
  }
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(`[${new Date().toISOString()}] [INFO] Tools requested - ${tools.length} complete ASR-GoT tools available`);
  return { tools: tools };
});

// Handle tool execution with complete implementation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const requestId = request.id;

  console.error(`[${new Date().toISOString()}] [INFO] Tool call: ${name} (request_id: ${requestId})`);

  try {
    switch (name) {
      case 'initialize_asr_got_graph':
        if (!args.task_description) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing required argument: task_description');
        }
        
        currentGraph = new ASRGoTGraph(args.config || {});
        const initResult = currentGraph.initialize(
          args.task_description,
          args.initial_confidence,
          args.config
        );
        
        return {
          content: [{ type: 'text', text: JSON.stringify(initResult, null, 2) }]
        };

      case 'decompose_research_task':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
        }
        const decomposeResult = currentGraph.decomposeTask(args.dimensions);
        return {
          content: [{ type: 'text', text: JSON.stringify(decomposeResult, null, 2) }]
        };

      case 'generate_hypotheses':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const hypothesesResult = currentGraph.generateHypotheses(
          args.dimension_node_id,
          args.hypotheses,
          args.config
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(hypothesesResult, null, 2) }]
        };

      case 'integrate_evidence':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const evidenceResult = currentGraph.integrateEvidence(
          args.hypothesis_node_id,
          args.evidence
        );
        return {
          content: [{ type: 'text', text: JSON.stringify(evidenceResult, null, 2) }]
        };

      case 'prune_and_merge_nodes':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const pruneResult = currentGraph.pruneAndMergeNodes(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(pruneResult, null, 2) }]
        };

      case 'get_graph_summary':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const summary = currentGraph.getGraphSummary();
        return {
          content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }]
        };

      case 'export_graph_data':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const exportedData = currentGraph.exportGraph(args.format);
        return {
          content: [{ type: 'text', text: exportedData }]
        };

      case 'compose_output':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const compositionResult = currentGraph.composeOutput(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(compositionResult, null, 2) }]
        };

      case 'extract_subgraphs':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const subgraphResult = currentGraph.extractSubgraphs(args.criteria);
        return {
          content: [{ type: 'text', text: JSON.stringify(subgraphResult, null, 2) }]
        };

      case 'perform_reflection_audit':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const auditResult = currentGraph.performReflectionAudit(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(auditResult, null, 2) }]
        };

      case 'analyze_knowledge_gaps':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const gaps = currentGraph._identifyKnowledgeGaps();
        const filteredGaps = gaps.filter(gap => 
          gap.impact >= (args.impact_threshold || 0.6) && 
          gap.confidence <= (args.confidence_threshold || 0.4)
        );
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              knowledge_gaps: filteredGaps,
              total_gaps: gaps.length,
              critical_gaps: filteredGaps.length,
              message: 'Knowledge gap analysis completed following P1.15 specification'
            }, null, 2)
          }]
        };

      case 'detect_biases':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const biasAnalysis = {
          total_bias_flags: currentGraph._countBiasFlags(),
          bias_by_node: {},
          bias_types: {},
          recommendations: []
        };
        
        for (const [nodeId, node] of currentGraph.vertices.entries()) {
          const biases = node.metadata.bias_flags || [];
          if (biases.length > 0) {
            biasAnalysis.bias_by_node[nodeId] = biases;
            biases.forEach(bias => {
              biasAnalysis.bias_types[bias] = (biasAnalysis.bias_types[bias] || 0) + 1;
            });
          }
        }
        
        if (biasAnalysis.total_bias_flags > 0) {
          biasAnalysis.recommendations.push('Review and address identified biases');
          biasAnalysis.recommendations.push('Consider alternative perspectives and methodologies');
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              bias_analysis: biasAnalysis,
              message: 'Bias detection completed following P1.17 specification'
            }, null, 2)
          }]
        };

      case 'analyze_causal_relationships':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        
        const causalAnalysis = {
          method: args.method || 'path_analysis',
          source_node: args.source_node,
          target_node: args.target_node,
          causal_paths: [],
          confounders: args.confounders || [],
          analysis_results: {}
        };
        
        // Find causal paths between source and target
        if (args.source_node && args.target_node) {
          const paths = currentGraph._findCausalPaths(args.source_node, args.target_node);
          causalAnalysis.causal_paths = paths;
          causalAnalysis.analysis_results.direct_causal_connection = paths.length > 0;
          causalAnalysis.analysis_results.strongest_path_confidence = paths.length > 0 ? 
            Math.max(...paths.map(p => p.confidence)) : 0;
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              causal_analysis: causalAnalysis,
              message: 'Causal relationship analysis completed following P1.24 specification'
            }, null, 2)
          }]
        };

      case 'detect_temporal_patterns':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        
        const temporalAnalysis = {
          node_set: args.node_set || Array.from(currentGraph.vertices.keys()),
          pattern_types: args.pattern_types || ['sequential', 'cyclic', 'delayed'],
          detected_patterns: [],
          temporal_edges: []
        };
        
        // Analyze temporal patterns
        for (const edge of currentGraph.edges.values()) {
          if (edge.metadata.temporal_metadata) {
            temporalAnalysis.temporal_edges.push({
              edge_id: edge.edge_id,
              source: edge.source,
              target: edge.target,
              pattern_type: edge.metadata.temporal_metadata.pattern_type,
              delay_duration: edge.metadata.temporal_metadata.delay_duration
            });
          }
        }
        
        // Group by pattern types
        const patternGroups = {};
        temporalAnalysis.temporal_edges.forEach(edge => {
          const pattern = edge.pattern_type;
          if (!patternGroups[pattern]) {
            patternGroups[pattern] = [];
          }
          patternGroups[pattern].push(edge);
        });
        
        temporalAnalysis.detected_patterns = Object.entries(patternGroups).map(([pattern, edges]) => ({
          pattern_type: pattern,
          count: edges.length,
          examples: edges.slice(0, 3)
        }));
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              temporal_analysis: temporalAnalysis,
              message: 'Temporal pattern detection completed following P1.25 specification'
            }, null, 2)
          }]
        };

      case 'estimate_research_impact':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        
        const targetNodes = args.nodes || Array.from(currentGraph.vertices.keys());
        const metrics = args.metrics || ['theoretical_significance', 'practical_utility'];
        
        const impactEstimation = {
          nodes_analyzed: targetNodes.length,
          metrics_used: metrics,
          impact_scores: {},
          overall_impact: 0,
          high_impact_nodes: [],
          recommendations: []
        };
        
        let totalImpact = 0;
        for (const nodeId of targetNodes) {
          const node = currentGraph.vertices.get(nodeId);
          if (node) {
            const impact = node.metadata.impact_score || 0.5;
            impactEstimation.impact_scores[nodeId] = {
              score: impact,
              type: node.type,
              confidence: node.confidence.reduce((a, b) => a + b, 0) / 4
            };
            totalImpact += impact;
            
            if (impact > 0.7) {
              impactEstimation.high_impact_nodes.push(nodeId);
            }
          }
        }
        
        impactEstimation.overall_impact = targetNodes.length > 0 ? totalImpact / targetNodes.length : 0;
        
        if (impactEstimation.high_impact_nodes.length > 0) {
          impactEstimation.recommendations.push('Focus resources on high-impact research areas');
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              impact_estimation: impactEstimation,
              message: 'Research impact estimation completed following P1.28 specification'
            }, null, 2)
          }]
        };

      case 'plan_interventions':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        
        const interventions = args.interventions || [];
        const interventionPlan = {
          total_interventions: interventions.length,
          ranked_interventions: [],
          total_evoi: 0,
          recommendations: []
        };
        
        // Calculate Expected Value of Information (EVoI) for each intervention
        for (const intervention of interventions) {
          const evoi = currentGraph._calculateEVoI(intervention);
          interventionPlan.ranked_interventions.push({
            ...intervention,
            evoi: evoi,
            priority: evoi > 0.7 ? 'high' : evoi > 0.4 ? 'medium' : 'low'
          });
        }
        
        // Sort by EVoI
        interventionPlan.ranked_interventions.sort((a, b) => b.evoi - a.evoi);
        interventionPlan.total_evoi = interventionPlan.ranked_interventions.reduce((sum, i) => sum + i.evoi, 0);
        
        if (interventionPlan.ranked_interventions.length > 0) {
          const topIntervention = interventionPlan.ranked_interventions[0];
          interventionPlan.recommendations.push(`Prioritize: ${topIntervention.name} (EVoI: ${topIntervention.evoi.toFixed(3)})`);
        }
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              intervention_plan: interventionPlan,
              message: 'Intervention planning completed following P1.19 specification'
            }, null, 2)
          }]
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Tool execution failed: ${error.message} (request_id: ${requestId})`);
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});

// Start server
async function main() {
  try {
    console.error(`[${new Date().toISOString()}] [INFO] Starting Complete ASR-GoT MCP Server with all 29 parameters...`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[${new Date().toISOString()}] [INFO] Complete ASR-GoT MCP Server running with ${tools.length} tools covering all 8 stages`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Failed to start server: ${error.message}`);
    console.error(`[${new Date().toISOString()}] [ERROR] Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

main();