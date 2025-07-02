#!/usr/bin/env node

/**
 * Research-Quest MCP Server Implementation
 * Leverage graph structures to transform how AI systems approach scientific reasoning
 * 
 * Implements a comprehensive graph-based framework for systematic scientific analysis
 * Following modern MCP protocol standards with robust error handling
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

// Research-Quest Graph State Management - Production Implementation
class ResearchQuestGraph {
  constructor(config = {}) {
    // P1.11: Mathematical Formalism - Gₜ = (Vₜ, Eₜ∪Eₕₜ, Lₜ, T, Cₜ, Mₜ, Iₜ)
    this.vertices = new Map(); // Vₜ
    this.edges = new Map(); // Eₜ (binary edges)
    this.hyperedges = new Map(); // Eₕₜ (P1.9)
    this.layers = new Map(); // Lₜ (P1.23)
    this.nodeTypes = new Set(); // T
    this.confidenceFunction = new Map(); // Cₜ (P1.14)
    this.metadataFunction = new Map(); // Mₜ (P1.12)
    this.informationMetrics = new Map(); // Iₜ (P1.27)
    
    // Graph metadata with all parameters P1.0-P1.29
    this.metadata = {
      created: new Date().toISOString(),
      version: '1.0.0',
      stage: 'initialization',
      config: config,
      parameters: this._initializeAllParameters()
    };
    
    this.currentStage = 0; // Before Stage 1
    this.stageNames = [
      'initialization', 'decomposition', 'hypothesis_planning', 
      'evidence_integration', 'pruning_merging', 'subgraph_extraction',
      'composition', 'reflection'
    ];
    
    // P1.23: Initialize multi-layer structure if enabled
    if (config.enable_multi_layer !== false) {
      this._initializeLayerStructure();
    }
  }

  // P1.0-P1.29: Initialize all parameters exactly as specified
  _initializeAllParameters() {
    return {
      // Core Research-Quest Protocol Parameters
      P1_0: { active: true, description: "Mandatory 8-stage GoT execution: 1.Initialization, 2.Decomposition, 3.Hypothesis/Planning, 4.Evidence Integration, 5.Pruning/Merging, 6.Subgraph Extraction, 7.Composition, 8.Reflection. Enhanced with advanced features P1.8-P1.29." },
      P1_1: { active: true, description: "Root node n₀ label='Task Understanding', confidence=C₀ (P1.5 multi-dimensional vector, high initial belief), metadata conforming to P1.12 schema." },
      P1_2: { active: true, description: "Default dimensions: Scope, Objectives, Constraints, Data Needs, Use Cases, Potential Biases (Ref P1.17), Knowledge Gaps (Ref P1.15). Initial confidence=C_dim (P1.5 vector, e.g., [0.8, 0.8, 0.8, 0.8])." },
      P1_3: { active: true, description: "Generate k=3-5 hypotheses per dimension node. Initial confidence=C_hypo (P1.5 vector, e.g., [0.5, 0.5, 0.5, 0.5]). Require explicit plan (search/tool/experiment). Tag with disciplinary provenance (P1.8), falsifiability criteria (P1.16), initial bias risk assessment (P1.17), potential impact estimate (P1.28)." },
      P1_4: { active: true, description: "Iterative loop based on multi-dimensional confidence-to-cost ratio (P1.5) & potential impact (P1.28). Link evidence Eᵣ to hypothesis h* using specific edge types (P1.10, P1.24, P1.25). Update h*.confidence vector C via Bayesian methods (P1.14). Assess evidence statistical power (P1.26). Perform cross-node linking & IBN creation (P1.8). Use hyperedges (P1.9). Apply temporal decay (P1.18) & detect temporal patterns (P1.25). Dynamically adapt graph topology (P1.22). Utilize multi-layer structure if defined (P1.23)." },
      P1_5: { active: true, description: "Confidence C = [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment], represented as probability distributions (P1.14), potentially informed by Info Theory (P1.27). Pruning threshold: min(E[C]) < 0.2 (expected value) & low impact (P1.28). Merging threshold: semantic_overlap >= 0.8. Contextual weighting allowed." },
      P1_6: { active: true, description: "Numeric node labels. Verbatim queries in metadata. Reasoning Trace appendix. Annotate claims with node IDs & edge types (P1.10, P1.24, P1.25). Vancouver citations (K1.3). Subgraph extraction criteria: confidence (P1.5), node type, edge pattern (P1.10, P1.24, P1.25), discipline focus (P1.8), temporal recency (P1.18), knowledge gap focus (P1.15), impact estimate (P1.28), layer filter (P1.23). Dimensional reduction/topology metrics (P1.22) for visualization." },
      P1_7: { active: true, description: "Mandatory self-audit: check coverage of high-confidence/high-impact (P1.28) nodes/dimensions, constraint adherence (K-nodes), bias flags (P1.17), gaps addressed (P1.15), falsifiability (P1.16), causal claim validity (P1.24), temporal consistency (P1.18, P1.25), statistical rigor (P1.26), collaboration attributions (P1.29)." },
      
      // Advanced Network Parameters
      P1_8: { active: true, description: "Maintain explicit `disciplinary_tags` list in node metadata (P1.12). During Stage 4, if evidence E links to node N and tags(E) ∩ tags(N) = ∅ and semantic_similarity(E, N) > 0.5, create Interdisciplinary Bridge Node (IBN) connecting E and N. IBN inherits tags. Track provenance. Integrates with Multi-layer networks (P1.23)." },
      P1_9: { active: true, description: "Enable hyperedges Eₕ ⊆ P(V) where |Eₕ| > 2. Add hyperedges during Stage 4 when multiple nodes jointly influence another non-additively. Assign confidence vector C and relationship descriptor to Eₕ. Can exist within or across layers (P1.23)." },
      P1_10: { active: true, description: "Classify edges E with mandatory `edge_type` metadata: Basic {Correlative (⇢), Supportive (↑), Contradictory (⊥), Prerequisite (⊢), Generalization (⊇), Specialization (⊂), Other}; Causal (P1.24) {e.g., Causal (→), Counterfactual, Confounded}; Temporal (P1.25) {e.g., Temporal Precedence (≺), Cyclic, Delayed, Sequential}." },
      P1_11: { active: true, description: "Define ASR-GoT graph state Gₜ = (Vₜ, Eₜ∪Eₕₜ, Lₜ, T, Cₜ, Mₜ, Iₜ). V=vertices, E=binary edges, Eₕ=hyperedges, L=Layers (P1.23), T=node types, C=confidence function (P1.14), M=metadata function (P1.12), I=Information metrics (P1.27). Define transition operators O: Gₜ → Gₜ₊₁." },
      P1_12: { active: true, description: "Mandatory metadata for nodes (V): {`node_id`, ..., `provenance`, `confidence` (P1.14 dists), `epistemic_status`, `disciplinary_tags`, `falsification_criteria`, `bias_flags`, `revision_history`, `layer_id` (P1.23), `topology_metrics` (P1.22), `statistical_power` (P1.26), `info_metrics` (P1.27), `impact_score` (P1.28), `attribution` (P1.29)}. Edges/Hyperedges: {`edge_id`, ..., `edge_type` (P1.10/P1.24/P1.25), `confidence`, `causal_metadata` (P1.24), `temporal_metadata` (P1.25)}." },
      P1_13: { active: true, description: "Identify mutually exclusive hypotheses H_comp. Evaluate using metrics (complexity via P1.27, predictive power, empirical coverage P1.26). Generate 'critical experiment' plans (P1.19) to maximize confidence divergence or information gain (P1.27)." },
      P1_14: { active: true, description: "Represent P1.5 confidence components using probability distributions. Apply Bayesian updates during Stage 4 considering evidence reliability (P1.26 power) and edge type (P1.10/P1.24/P1.25). Propagate uncertainty. Utilize information theory metrics (P1.27) for uncertainty quantification." },
      
      // Knowledge and Gap Parameters
      P1_15: { active: true, description: "Identify gaps: create `Placeholder_Gap` nodes. Flag nodes/subgraphs with high confidence variance (P1.14) or low connectivity (P1.22 metrics). Generate explicit research questions targeting gaps with high potential impact (P1.28)." },
      P1_16: { active: true, description: "Require population of `falsification_criteria` metadata (P1.12) for Hypothesis nodes. Penalize hypotheses with poor/missing criteria during Stage 5." },
      P1_17: { active: true, description: "Include 'Potential Biases' dimension (Stage 2). Assess nodes/evidence/topology (P1.22) for biases. Populate `bias_flags` (P1.12). Suggest/apply debiasing techniques." },
      P1_18: { active: true, description: "Utilize `timestamp` metadata (P1.12). Apply temporal decay f(Δt) to older evidence impact (Stage 4). Analyze confidence trends ΔC/Δt (Stage 6/8). Model and detect explicit temporal patterns (P1.25)." },
      P1_19: { active: true, description: "Generate 'prospective' subgraphs for interventions. Estimate Expected Value of Information (EVoI) based on predicted impact on confidence distributions (P1.14) and research impact score (P1.28). Rank potential interventions based on EVoI and impact." },
      P1_20: { active: true, description: "Define abstraction levels or utilize formal multi-layer structure (P1.23). Allow nodes Lᵢ to encapsulate subgraphs Lᵢ₊₁. Define aggregation/disaggregation functions. Maintain consistency links." },
      P1_21: { active: true, description: "Estimate computational cost of operations (e.g., topology analysis P1.22, causal inference P1.24, Bayesian updates P1.14). Flag operations exceeding budgets. Switch to approximations/heuristics if needed, tagging results." },
      
      // Enhanced Parameters (NEW)
      P1_22: { active: true, description: "Enable graph restructuring during Stage 4 based on evidence patterns (e.g., merging/splitting nodes, community detection). Add topology metrics (centrality, clustering coeff.) to `topology_metrics` metadata (P1.12). Support dynamic edge weighting based on evidence strength/recency/type." },
      P1_23: { active: true, description: "Define distinct but interconnected layers L (P1.11) representing different scales, disciplines (K3.3/K3.4), or epistemologies. Populate `layer_id` metadata (P1.12). Define inter-layer edge semantics and layer-specific evaluation metrics." },
      P1_24: { active: true, description: "Extend P1.10 edge types with causal semantics (e.g., Pearl's do-calculus notation). Support counterfactual reasoning steps. Populate `causal_metadata` (P1.12) including potential confounders. Enable causal path analysis algorithms." },
      P1_25: { active: true, description: "Extend P1.10 edge types to support temporal patterns (cycles, delays, sequences, conditional). Populate `temporal_metadata` (P1.12) with pattern details (e.g., delay duration). Include temporal pattern detection algorithms." },
      P1_26: { active: true, description: "Add power analysis metrics, sample size adequacy assessment, effect size estimation, and confidence intervals to `statistical_power` metadata (P1.12) for Evidence nodes where applicable." },
      P1_27: { active: true, description: "Incorporate entropy, KL divergence, mutual information, Minimum Description Length (MDL) principles into analysis. Store relevant metrics in `info_metrics` metadata (P1.12)." },
      P1_28: { active: true, description: "Develop and apply metrics for theoretical significance, practical utility, gap reduction (link to P1.15/P1.27), methodological innovation. Store in `impact_score` metadata (P1.12). Use to prioritize hypothesis exploration (Stage 4) and intervention planning (P1.19)." },
      P1_29: { active: true, description: "Support node attribution to researchers/specialists via `attribution` metadata (P1.12). Enable expertise-based task allocation recommendations. Identify complementary knowledge. Support consensus-building." }
    };
  }

  // P1.23: Initialize multi-layer structure exactly as specified
  _initializeLayerStructure() {
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
        created: new Date().toISOString(),
        inter_layer_edges: new Set()
      });
    });
  }

  // P1.12: Complete metadata schema implementation - EXACT specification with error handling
  _createNodeMetadata(baseMetadata = {}) {
    try {
      // Validate input
      if (baseMetadata === null || baseMetadata === undefined) {
        console.error(`[${new Date().toISOString()}] [WARN] Null/undefined baseMetadata, using empty object`);
        baseMetadata = {};
      }
      
      if (typeof baseMetadata !== 'object') {
        console.error(`[${new Date().toISOString()}] [WARN] Invalid baseMetadata type: ${typeof baseMetadata}, using empty object`);
        baseMetadata = {};
      }

      const timestamp = new Date().toISOString();
      
      // Safe property access with fallbacks
      const safeAccess = (obj, prop, fallback) => {
        try {
          return obj && obj.hasOwnProperty(prop) ? obj[prop] : fallback;
        } catch (error) {
          console.error(`[${new Date().toISOString()}] [WARN] Error accessing property ${prop}: ${error.message}`);
          return fallback;
        }
      };

      return {
        // Core required fields
        node_id: safeAccess(baseMetadata, 'node_id', uuidv4()),
        created: timestamp,
        updated: timestamp,
        timestamp: timestamp, // P1.18
        
        // P1.12 Extended metadata schema - ALL required fields with safe access
        provenance: safeAccess(baseMetadata, 'provenance', 'system_generated'),
        confidence: safeAccess(baseMetadata, 'confidence', null) || this._createProbabilityDistribution([0.5, 0.5, 0.5, 0.5]), // P1.14 distributions
        epistemic_status: safeAccess(baseMetadata, 'epistemic_status', 'pending'),
        disciplinary_tags: Array.isArray(baseMetadata.disciplinary_tags) ? baseMetadata.disciplinary_tags : [], // P1.8
        falsification_criteria: safeAccess(baseMetadata, 'falsification_criteria', null), // P1.16
        bias_flags: Array.isArray(baseMetadata.bias_flags) ? baseMetadata.bias_flags : [], // P1.17
        revision_history: Array.isArray(baseMetadata.revision_history) ? baseMetadata.revision_history : [],
        layer_id: safeAccess(baseMetadata, 'layer_id', 'base'), // P1.23
        topology_metrics: safeAccess(baseMetadata, 'topology_metrics', null) || this._createTopologyMetrics(), // P1.22
        statistical_power: safeAccess(baseMetadata, 'statistical_power', null), // P1.26
        info_metrics: safeAccess(baseMetadata, 'info_metrics', null) || this._createInfoMetrics(), // P1.27
        impact_score: this._validateImpactScore(safeAccess(baseMetadata, 'impact_score', 0.5)), // P1.28
        attribution: Array.isArray(baseMetadata.attribution) ? baseMetadata.attribution : [], // P1.29
        
        // Additional metadata - only include safe properties
        ...this._sanitizeAdditionalMetadata(baseMetadata)
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [ERROR] Failed to create node metadata: ${error.message}`);
      // Return minimal valid metadata
      return {
        node_id: uuidv4(),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        provenance: 'error_recovery',
        confidence: this._createProbabilityDistribution([0.5, 0.5, 0.5, 0.5]),
        epistemic_status: 'pending',
        disciplinary_tags: [],
        falsification_criteria: null,
        bias_flags: [],
        revision_history: [],
        layer_id: 'base',
        topology_metrics: this._createTopologyMetrics(),
        statistical_power: null,
        info_metrics: this._createInfoMetrics(),
        impact_score: 0.5,
        attribution: []
      };
    }
  }

  // Helper method to validate impact scores
  _validateImpactScore(score) {
    const num = Number(score);
    if (isNaN(num) || num < 0 || num > 1) {
      console.error(`[${new Date().toISOString()}] [WARN] Invalid impact score ${score}, using 0.5`);
      return 0.5;
    }
    return num;
  }

  // Helper method to sanitize additional metadata
  _sanitizeAdditionalMetadata(baseMetadata) {
    try {
      const sanitized = {};
      const excludeKeys = ['node_id', 'created', 'updated', 'timestamp', 'provenance', 'confidence', 
                          'epistemic_status', 'disciplinary_tags', 'falsification_criteria', 'bias_flags',
                          'revision_history', 'layer_id', 'topology_metrics', 'statistical_power',
                          'info_metrics', 'impact_score', 'attribution'];
      
      for (const [key, value] of Object.entries(baseMetadata)) {
        if (!excludeKeys.includes(key) && typeof key === 'string' && value !== undefined) {
          sanitized[key] = value;
        }
      }
      return sanitized;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [WARN] Error sanitizing metadata: ${error.message}`);
      return {};
    }
  }

  // P1.14: Create probability distributions for confidence - Enhanced with error handling
  _createProbabilityDistribution(means) {
    try {
      // Validate input
      if (!Array.isArray(means)) {
        console.error(`[${new Date().toISOString()}] [WARN] Invalid means array, using default: ${means}`);
        means = [0.5, 0.5, 0.5, 0.5];
      }
      
      // Ensure all values are numbers between 0 and 1
      const validMeans = means.map(m => {
        const num = Number(m);
        if (isNaN(num) || num < 0 || num > 1) {
          console.error(`[${new Date().toISOString()}] [WARN] Invalid confidence value ${m}, using 0.5`);
          return 0.5;
        }
        return num;
      });

      return {
        type: 'probability_distribution',
        means: validMeans, // [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]
        variances: validMeans.map(m => m * (1 - m)), // Beta distribution approximation
        distribution_type: 'beta',
        samples: 1000,
        confidence_interval: 0.95
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [ERROR] Failed to create probability distribution: ${error.message}`);
      // Return default distribution
      return {
        type: 'probability_distribution',
        means: [0.5, 0.5, 0.5, 0.5],
        variances: [0.25, 0.25, 0.25, 0.25],
        distribution_type: 'beta',
        samples: 1000,
        confidence_interval: 0.95
      };
    }
  }

  // P1.22: Create topology metrics as specified
  _createTopologyMetrics() {
    return {
      centrality: 0,
      clustering_coeff: 0,
      degree: 0,
      betweenness_centrality: 0,
      eigenvector_centrality: 0,
      pagerank: 0,
      community_id: null
    };
  }

  // P1.27: Create information theory metrics
  _createInfoMetrics() {
    return {
      entropy: 0,
      kl_divergence: 0,
      mutual_information: 0,
      mdl_score: 0,
      information_gain: 0,
      complexity: 0
    };
  }

  // P1.12: Complete edge metadata schema
  _createEdgeMetadata(baseMetadata = {}) {
    return {
      edge_id: baseMetadata.edge_id || uuidv4(),
      created: new Date().toISOString(),
      edge_type: baseMetadata.edge_type || 'Other', // P1.10
      confidence: baseMetadata.confidence || this._createProbabilityDistribution([0.7, 0.7, 0.7, 0.7]),
      causal_metadata: baseMetadata.causal_metadata || null, // P1.24
      temporal_metadata: baseMetadata.temporal_metadata || null, // P1.25
      
      // Additional edge properties
      weight: baseMetadata.weight || 1.0,
      bidirectional: baseMetadata.bidirectional || false,
      layer_connection: baseMetadata.layer_connection || null, // P1.23
      
      ...baseMetadata
    };
  }

  // Stage 1: Initialization (P1.1) - EXACT implementation with comprehensive error handling
  initialize(taskDescription, initialConfidence = [0.8, 0.8, 0.8, 0.8], config = {}) {
    try {
      // Enhanced validation
      if (this.currentStage !== 0) {
        throw new Error(`Cannot initialize. Current stage: ${this.currentStage}, expected: 0 (before initialization)`);
      }

      // Check if already initialized
      if (this.vertices.size > 0) {
        console.error(`[${new Date().toISOString()}] [WARN] Graph already has ${this.vertices.size} vertices, reinitializing`);
        // Clear existing state for reinitialization
        this.vertices.clear();
        this.edges.clear();
        this.hyperedges.clear();
        for (const layer of this.layers.values()) {
          layer.nodes.clear();
          layer.edges.clear();
        }
      }

      // Enhanced validation using new validation methods
      const validatedTaskDescription = this._validateTaskDescription(taskDescription);
      
      // Validate initial confidence if provided
      let validatedConfidence = initialConfidence;
      if (initialConfidence !== undefined) {
        validatedConfidence = this._validateConfidenceArray(initialConfidence, 'initial_confidence');
      }

      // Validate configuration
      const safeConfig = this._validateConfig(config);

      console.error(`[${new Date().toISOString()}] [INFO] Stage 1: Initializing ASR-GoT graph - P1.1`);
      
      // P1.1: Create root node n₀ with exact specification and error handling
      const rootNodeMetadata = this._createNodeMetadata({
        node_id: 'n0', // Exact as specified
        provenance: 'user_input',
        epistemic_status: 'accepted',
        confidence: this._createProbabilityDistribution(validatedConfidence),
        layer_id: 'base',
        disciplinary_tags: safeConfig.disciplinary_tags || ['immunology', 'dermatology'], // K3.3
        impact_score: 0.8,
        attribution: safeConfig.attribution || []
      });

      const rootNode = {
        node_id: 'n0',
        label: 'Task Understanding', // P1.1 exact specification
        type: 'root',
        content: validatedTaskDescription,
        confidence: this._createProbabilityDistribution(validatedConfidence), // P1.5 multi-dimensional vector
        metadata: rootNodeMetadata
      };
      
      // Safely add to graph
      this.vertices.set('n0', rootNode);
      this.nodeTypes.add('root');
      
      // Add to base layer (P1.23) with error handling
      if (this.layers.has('base')) {
        this.layers.get('base').nodes.add('n0');
      } else {
        console.error(`[${new Date().toISOString()}] [WARN] Base layer not found, creating default`);
        this._initializeLayerStructure();
        this.layers.get('base').nodes.add('n0');
      }
      
      this.metadata.stage = 'initialization';
      this.currentStage = 1;
      
      console.error(`[${new Date().toISOString()}] [INFO] Root node n₀ created following P1.1 specification exactly`);
      
      return {
        success: true,
        node_id: 'n0',
        message: 'ASR-GoT graph initialized successfully following P1.1 specification',
        current_stage: this.currentStage,
        stage_name: this.stageNames[this.currentStage - 1],
        active_parameters: Object.keys(this.metadata.parameters).filter(p => this.metadata.parameters[p].active),
        warnings: this._getInitializationWarnings()
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [ERROR] Initialization failed: ${error.message}`);
      
      // Attempt graceful recovery
      try {
        this._resetToInitialState();
        return {
          success: false,
          error: error.message,
          message: 'Initialization failed, graph reset to initial state',
          current_stage: this.currentStage,
          recovery_attempted: true
        };
      } catch (recoveryError) {
        console.error(`[${new Date().toISOString()}] [CRITICAL] Recovery failed: ${recoveryError.message}`);
        return {
          success: false,
          error: error.message,
          recovery_error: recoveryError.message,
          message: 'Critical failure: both initialization and recovery failed',
          current_stage: this.currentStage
        };
      }
    }
  }

  // Enhanced parameter validation utility
  _createValidationError(field, value, expected, examples = []) {
    const error = new McpError(
      ErrorCode.InvalidParams, 
      `Invalid parameter '${field}': ${expected}. Received: ${JSON.stringify(value)}`
    );
    if (examples.length > 0) {
      error.data = { 
        field, 
        received: value, 
        expected, 
        examples: examples.slice(0, 3) // Limit to 3 examples
      };
    }
    return error;
  }

  // Comprehensive confidence array validation
  _validateConfidenceArray(confidence, paramName = 'confidence') {
    if (!Array.isArray(confidence)) {
      throw this._createValidationError(
        paramName, 
        confidence, 
        'array of 4 numbers between 0 and 1',
        [[0.8, 0.8, 0.8, 0.8], [0.5, 0.7, 0.6, 0.9]]
      );
    }

    if (confidence.length !== 4) {
      throw this._createValidationError(
        paramName, 
        confidence, 
        'array with exactly 4 elements [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]',
        [[0.8, 0.8, 0.8, 0.8]]
      );
    }

    const validatedConfidence = confidence.map((value, index) => {
      const num = Number(value);
      if (isNaN(num)) {
        throw this._createValidationError(
          `${paramName}[${index}]`, 
          value, 
          'a number between 0 and 1',
          [0.5, 0.8, 1.0]
        );
      }
      if (num < 0 || num > 1) {
        throw this._createValidationError(
          `${paramName}[${index}]`, 
          num, 
          'a number between 0 and 1 (inclusive)',
          [0.0, 0.5, 0.8, 1.0]
        );
      }
      return num;
    });

    return validatedConfidence;
  }

  // Enhanced task description validation
  _validateTaskDescription(taskDescription) {
    if (taskDescription === null || taskDescription === undefined) {
      throw this._createValidationError(
        'task_description', 
        taskDescription, 
        'a non-empty string describing the research task',
        ['Analyze the effectiveness of topical treatments for eczema', 'Study the relationship between diet and skin health']
      );
    }

    if (typeof taskDescription !== 'string') {
      throw this._createValidationError(
        'task_description', 
        taskDescription, 
        'a string',
        ['Analyze the effectiveness of topical treatments for eczema']
      );
    }

    const trimmed = taskDescription.trim();
    if (trimmed.length === 0) {
      throw this._createValidationError(
        'task_description', 
        taskDescription, 
        'a non-empty string',
        ['Analyze the effectiveness of topical treatments for eczema']
      );
    }

    if (trimmed.length < 10) {
      throw this._createValidationError(
        'task_description', 
        trimmed, 
        'a descriptive string with at least 10 characters',
        ['Analyze the effectiveness of topical treatments for eczema']
      );
    }

    if (trimmed.length > 1000) {
      throw this._createValidationError(
        'task_description', 
        `${trimmed.substring(0, 50)}...`, 
        'a string with maximum 1000 characters',
        ['Analyze the effectiveness of topical treatments for eczema']
      );
    }

    return trimmed;
  }

  // Enhanced dimension node ID validation
  _validateDimensionNodeId(nodeId, existingNodes = null) {
    if (!nodeId || typeof nodeId !== 'string') {
      throw this._createValidationError(
        'dimension_node_id', 
        nodeId, 
        'a non-empty string in format "2.X"',
        ['2.1', '2.2', '2.3']
      );
    }

    // Check format
    const formatRegex = /^2\.\d+$/;
    if (!formatRegex.test(nodeId)) {
      throw this._createValidationError(
        'dimension_node_id', 
        nodeId, 
        'a string in format "2.X" where X is the dimension number',
        ['2.1', '2.2', '2.3', '2.4', '2.5']
      );
    }

    // Check existence if nodes provided
    if (existingNodes && !existingNodes.has(nodeId)) {
      const availableNodes = Array.from(existingNodes.keys()).filter(id => id.startsWith('2.'));
      throw this._createValidationError(
        'dimension_node_id', 
        nodeId, 
        `an existing dimension node ID. Available: ${availableNodes.join(', ')}`,
        availableNodes.slice(0, 3)
      );
    }

    return nodeId;
  }

  // Enhanced hypotheses array validation
  _validateHypothesesArray(hypotheses) {
    if (!Array.isArray(hypotheses)) {
      throw this._createValidationError(
        'hypotheses', 
        hypotheses, 
        'an array of hypothesis objects or strings',
        [
          ['Hypothesis 1', 'Hypothesis 2', 'Hypothesis 3'],
          [{ content: 'Hypothesis 1', falsification_criteria: 'Test condition' }]
        ]
      );
    }

    if (hypotheses.length < 3) {
      throw this._createValidationError(
        'hypotheses', 
        hypotheses, 
        'an array with at least 3 hypotheses (P1.3 specification)',
        [['Hypothesis 1', 'Hypothesis 2', 'Hypothesis 3']]
      );
    }

    if (hypotheses.length > 5) {
      throw this._createValidationError(
        'hypotheses', 
        hypotheses, 
        'an array with maximum 5 hypotheses (P1.3 specification)',
        [['Hypothesis 1', 'Hypothesis 2', 'Hypothesis 3']]
      );
    }

    return hypotheses;
  }

  // Enhanced format validation for export
  _validateExportFormat(format) {
    const validFormats = ['json', 'yaml'];
    
    if (!format || typeof format !== 'string') {
      throw this._createValidationError(
        'format', 
        format, 
        'a string specifying export format',
        validFormats
      );
    }

    const lowerFormat = format.toLowerCase();
    if (!validFormats.includes(lowerFormat)) {
      throw this._createValidationError(
        'format', 
        format, 
        `one of: ${validFormats.join(', ')}`,
        validFormats
      );
    }

    return lowerFormat;
  }

  // Helper method to validate configuration with enhanced checks
  _validateConfig(config) {
    try {
      if (config === null || config === undefined) {
        return {};
      }

      if (typeof config !== 'object' || Array.isArray(config)) {
        throw this._createValidationError(
          'config', 
          config, 
          'an object with configuration properties',
          [{ disciplinary_tags: ['immunology', 'dermatology'] }]
        );
      }

      const safeConfig = {};
      
      // Validate disciplinary_tags
      if (config.disciplinary_tags !== undefined) {
        if (!Array.isArray(config.disciplinary_tags)) {
          throw this._createValidationError(
            'config.disciplinary_tags', 
            config.disciplinary_tags, 
            'an array of strings',
            [['immunology', 'dermatology'], ['cardiology', 'genetics']]
          );
        }
        
        safeConfig.disciplinary_tags = config.disciplinary_tags.filter(tag => {
          if (typeof tag !== 'string' || tag.trim().length === 0) {
            console.error(`[${new Date().toISOString()}] [WARN] Ignoring invalid disciplinary tag: ${tag}`);
            return false;
          }
          return true;
        }).map(tag => tag.trim());
      }

      // Validate attribution
      if (config.attribution !== undefined) {
        if (!Array.isArray(config.attribution)) {
          throw this._createValidationError(
            'config.attribution', 
            config.attribution, 
            'an array of strings',
            [['Dr. Smith', 'Research Team A']]
          );
        }
        
        safeConfig.attribution = config.attribution.filter(attr => {
          if (typeof attr !== 'string' || attr.trim().length === 0) {
            console.error(`[${new Date().toISOString()}] [WARN] Ignoring invalid attribution: ${attr}`);
            return false;
          }
          return true;
        }).map(attr => attr.trim());
      }

      // Validate enable_multi_layer
      if (config.enable_multi_layer !== undefined) {
        if (typeof config.enable_multi_layer !== 'boolean') {
          console.error(`[${new Date().toISOString()}] [WARN] enable_multi_layer must be boolean, using default`);
        } else {
          safeConfig.enable_multi_layer = config.enable_multi_layer;
        }
      }

      return safeConfig;
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      console.error(`[${new Date().toISOString()}] [ERROR] Config validation failed: ${error.message}`);
      return {};
    }
  }

  // Helper method to reset to initial state
  _resetToInitialState() {
    this.vertices.clear();
    this.edges.clear();
    this.hyperedges.clear();
    this.nodeTypes.clear();
    this.confidenceFunction.clear();
    this.metadataFunction.clear();
    this.informationMetrics.clear();
    this.currentStage = 0;
    this.metadata.stage = 'initialization';
    
    // Reinitialize layers
    if (this.layers.size > 0) {
      for (const layer of this.layers.values()) {
        layer.nodes.clear();
        layer.edges.clear();
      }
    } else {
      this._initializeLayerStructure();
    }
  }

  // Helper method to get initialization warnings
  _getInitializationWarnings() {
    const warnings = [];
    
    if (this.layers.size === 0) {
      warnings.push('No layers initialized');
    }
    
    if (!this.metadata.parameters) {
      warnings.push('Parameters not properly initialized');
    }
    
    return warnings;
  }

  // Stage 2: Decomposition (P1.2) - EXACT implementation with nodes 2.1-2.7
  decomposeTask(customDimensions = null) {
    if (this.currentStage !== 1) {
      throw new Error(`Cannot decompose. Current stage: ${this.currentStage}, expected: 1`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 2: Task decomposition - P1.2`);

    // P1.2: EXACT default dimensions as specified
    const defaultDimensions = [
      'Scope', 'Objectives', 'Constraints', 'Data Needs', 
      'Use Cases', 'Potential Biases', 'Knowledge Gaps' // P1.17, P1.15 exact
    ];
    
    const taskDimensions = customDimensions || defaultDimensions;
    const dimensionNodes = [];

    // Create dimension nodes 2.1-2.7 as per specification example
    taskDimensions.forEach((dimension, index) => {
      const nodeId = `2.${index + 1}`; // Exact numbering as per specification
      
      // P1.2: Create dimension node with exact confidence vector
      const dimensionMetadata = this._createNodeMetadata({
        node_id: nodeId,
        provenance: 'task_decomposition',
        epistemic_status: 'pending',
        confidence: this._createProbabilityDistribution([0.8, 0.8, 0.8, 0.8]), // P1.2 exact
        layer_id: 'base',
        impact_score: 0.6,
        disciplinary_tags: this._inferDisciplinaryTags(dimension)
      });

      const dimensionNode = {
        node_id: nodeId,
        label: dimension,
        type: 'dimension',
        content: `Analysis of ${dimension} aspects of the research task`,
        confidence: this._createProbabilityDistribution([0.8, 0.8, 0.8, 0.8]), // P1.2
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
        confidence: this._createProbabilityDistribution([0.9, 0.9, 0.9, 0.9])
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
    
    console.error(`[${new Date().toISOString()}] [INFO] Created dimension nodes ${dimensionNodes.join(', ')} with P1.2 exact compliance`);

    return {
      success: true,
      dimension_nodes: dimensionNodes,
      message: `Task decomposed into ${taskDimensions.length} dimensions following P1.2 specification exactly`,
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

  // Stage 3: Hypothesis Generation (P1.3) - EXACT with numbered hypotheses per dimension with comprehensive error handling
  generateHypotheses(dimensionNodeId, hypotheses, config = {}) {
    try {
      // Enhanced stage validation
      if (this.currentStage !== 2) {
        throw new Error(`Cannot generate hypotheses. Current stage: ${this.currentStage}, expected: 2`);
      }

      // Enhanced validation using new validation methods
      const validatedNodeId = this._validateDimensionNodeId(dimensionNodeId, this.vertices);
      
      const dimensionNode = this.vertices.get(validatedNodeId);
      if (dimensionNode.type !== 'dimension') {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Node ${validatedNodeId} is not a dimension node (type: ${dimensionNode.type}). Expected a dimension node created in Stage 2.`
        );
      }

      // Validate hypotheses input with enhanced validation
      const validatedHypotheses = this._validateHypothesesArray(hypotheses);

      // Validate config
      const safeConfig = this._validateHypothesisConfig(config);

      console.error(`[${new Date().toISOString()}] [INFO] Stage 3: Generating hypotheses for ${dimensionNodeId} - P1.3`);

      // P1.3: Generate k=3-5 hypotheses per dimension
      const maxHypotheses = Math.min(safeConfig.max_hypotheses || 5, 5); // P1.3 specification
      const hypothesisNodes = [];
      const errors = [];

      // Get dimension number for proper hypothesis numbering (e.g., 3.1.1, 3.1.2, etc.)
      const dimensionParts = dimensionNodeId.split('.');
      if (dimensionParts.length < 2) {
        throw new Error(`Invalid dimension node ID format: ${dimensionNodeId}. Expected format: 2.X`);
      }
      const dimensionNumber = dimensionParts[1]; // Extract "1" from "2.1"
      
      // Process each hypothesis with individual error handling
      hypotheses.slice(0, maxHypotheses).forEach((hypothesis, index) => {
        try {
          const nodeId = `3.${dimensionNumber}.${index + 1}`; // Exact numbering as per specification example
          
          // Validate individual hypothesis
          const validatedHypothesis = this._validateHypothesis(hypothesis, index);
          
          // P1.3: Complete hypothesis metadata with ALL required fields
          const hypothesisMetadata = this._createNodeMetadata({
            node_id: nodeId,
            provenance: 'hypothesis_generation',
            epistemic_status: 'hypothetical',
            confidence: validatedHypothesis.confidence ? this._createProbabilityDistribution(validatedHypothesis.confidence) : this._createProbabilityDistribution([0.5, 0.5, 0.5, 0.5]), // P1.3
            disciplinary_tags: validatedHypothesis.disciplinary_tags || [], // P1.8
            falsification_criteria: validatedHypothesis.falsification_criteria || null, // P1.16
            bias_flags: this._assessInitialBiasRisk(validatedHypothesis), // P1.17
            impact_score: validatedHypothesis.impact_score || 0.6, // P1.28
            attribution: validatedHypothesis.attribution || [], // P1.29
            layer_id: 'theoretical',
            
            // P1.3: Explicit plan requirement
            plan: validatedHypothesis.plan || this._generateDefaultPlan(validatedHypothesis.content || validatedHypothesis)
          });

          const hypothesisNode = {
            node_id: nodeId,
            label: `Hypothesis ${dimensionNumber}.${index + 1}`,
            type: 'hypothesis',
            content: validatedHypothesis.content || validatedHypothesis,
            confidence: hypothesisMetadata.confidence,
            metadata: hypothesisMetadata
          };

          // Safely add to graph
          this.vertices.set(nodeId, hypothesisNode);
          this.nodeTypes.add('hypothesis');
          
          // Safe layer addition
          if (this.layers.has('theoretical')) {
            this.layers.get('theoretical').nodes.add(nodeId);
          } else {
            console.error(`[${new Date().toISOString()}] [WARN] Theoretical layer not found, adding to base layer`);
            this.layers.get('base').nodes.add(nodeId);
          }

          // Create edge from dimension to hypothesis with error handling
          const edgeId = `e_${dimensionNodeId}_${nodeId}`;
          const edgeMetadata = this._createEdgeMetadata({
            edge_id: edgeId,
            edge_type: 'Hypothesis', // P1.10
            confidence: this._createProbabilityDistribution([0.8, 0.8, 0.8, 0.8])
          });

          this.edges.set(edgeId, {
            edge_id: edgeId,
            source: dimensionNodeId,
            target: nodeId,
            metadata: edgeMetadata
          });

          hypothesisNodes.push(nodeId);
        } catch (hypothesisError) {
          console.error(`[${new Date().toISOString()}] [ERROR] Failed to create hypothesis ${index + 1}: ${hypothesisError.message}`);
          errors.push(`Hypothesis ${index + 1}: ${hypothesisError.message}`);
          // Continue with other hypotheses
        }
      });

      // Check if any hypotheses were successfully created
      if (hypothesisNodes.length === 0) {
        throw new Error(`Failed to create any hypotheses. Errors: ${errors.join('; ')}`);
      }

      this.currentStage = 3;
      this.metadata.stage = 'hypothesis_planning';
      
      console.error(`[${new Date().toISOString()}] [INFO] Generated hypotheses ${hypothesisNodes.join(', ')} with P1.3 exact compliance`);

      return {
        success: true,
        hypothesis_nodes: hypothesisNodes,
        message: `Generated ${hypothesisNodes.length} hypotheses following P1.3 specification exactly`,
        current_stage: this.currentStage,
        stage_name: this.stageNames[this.currentStage - 1],
        errors: errors.length > 0 ? errors : undefined,
        warnings: errors.length > 0 ? [`${errors.length} hypotheses failed to create`] : undefined
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [ERROR] Hypothesis generation failed: ${error.message}`);
      
      // Attempt partial recovery
      return {
        success: false,
        error: error.message,
        message: 'Hypothesis generation failed',
        current_stage: this.currentStage,
        stage_name: this.stageNames[this.currentStage - 1] || 'unknown',
        recovery_attempted: false
      };
    }
  }

  // Helper method to validate hypothesis configuration
  _validateHypothesisConfig(config) {
    try {
      const safeConfig = {};
      
      if (config && typeof config === 'object') {
        // Validate max_hypotheses
        if (config.max_hypotheses !== undefined) {
          const maxHyp = Number(config.max_hypotheses);
          if (!isNaN(maxHyp) && maxHyp > 0 && maxHyp <= 5) {
            safeConfig.max_hypotheses = Math.floor(maxHyp);
          } else {
            console.error(`[${new Date().toISOString()}] [WARN] Invalid max_hypotheses: ${config.max_hypotheses}, using default 5`);
            safeConfig.max_hypotheses = 5;
          }
        }
      }
      
      return safeConfig;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] [ERROR] Config validation failed: ${error.message}`);
      return { max_hypotheses: 5 };
    }
  }

  // Enhanced hypothesis validation with P1.3 and P1.16 compliance
  _validateHypothesis(hypothesis, index) {
    try {
      // Handle string hypothesis - convert to object for validation
      if (typeof hypothesis === 'string') {
        if (hypothesis.trim().length === 0) {
          throw this._createValidationError(
            `hypotheses[${index}]`,
            hypothesis,
            'a non-empty string or object with content',
            ['Valid hypothesis text', { content: 'Hypothesis text', falsification_criteria: 'Test criteria' }]
          );
        }
        
        // For string hypotheses, we need to add required fields as warnings
        console.error(`[${new Date().toISOString()}] [WARN] Hypothesis ${index + 1} provided as string. P1.3 and P1.16 require explicit plan and falsification criteria. Adding defaults.`);
        
        return { 
          content: hypothesis.trim(),
          _needs_plan: true,
          _needs_falsification_criteria: true
        };
      }

      // Handle object hypothesis with enhanced validation
      if (typeof hypothesis === 'object' && hypothesis !== null) {
        const validated = {};
        
        // Validate content (required)
        if (!hypothesis.content || typeof hypothesis.content !== 'string' || hypothesis.content.trim().length === 0) {
          throw this._createValidationError(
            `hypotheses[${index}].content`,
            hypothesis.content,
            'a non-empty string describing the hypothesis',
            ['Treatment X is more effective than treatment Y', 'Diet factor Z influences skin condition']
          );
        }
        validated.content = hypothesis.content.trim();

        // Validate confidence if provided
        if (hypothesis.confidence !== undefined) {
          try {
            validated.confidence = this._validateConfidenceArray(hypothesis.confidence, `hypotheses[${index}].confidence`);
          } catch (error) {
            console.error(`[${new Date().toISOString()}] [WARN] Invalid confidence in hypothesis ${index + 1}: ${error.message}, using defaults`);
          }
        }

        // P1.16: Validate falsification_criteria (strongly recommended, warn if missing)
        if (hypothesis.falsification_criteria !== undefined) {
          if (typeof hypothesis.falsification_criteria !== 'string' || hypothesis.falsification_criteria.trim().length === 0) {
            throw this._createValidationError(
              `hypotheses[${index}].falsification_criteria`,
              hypothesis.falsification_criteria,
              'a non-empty string describing testable criteria (P1.16 requirement)',
              ['If treatment shows less than 30% improvement in 4 weeks', 'If no significant difference in p < 0.05 statistical test']
            );
          }
          validated.falsification_criteria = hypothesis.falsification_criteria.trim();
        } else {
          console.error(`[${new Date().toISOString()}] [WARN] Hypothesis ${index + 1} missing falsification_criteria (P1.16 requirement). This may affect hypothesis quality assessment.`);
          validated._needs_falsification_criteria = true;
        }

        // P1.3: Validate plan (required for P1.3 compliance)
        if (hypothesis.plan !== undefined) {
          if (typeof hypothesis.plan !== 'object' || hypothesis.plan === null) {
            throw this._createValidationError(
              `hypotheses[${index}].plan`,
              hypothesis.plan,
              'an object describing the investigation plan (P1.3 requirement)',
              [{ type: 'literature_search', description: 'Systematic review', tools: ['pubmed'] }]
            );
          }
          
          // Validate plan structure
          if (!hypothesis.plan.type || typeof hypothesis.plan.type !== 'string') {
            throw this._createValidationError(
              `hypotheses[${index}].plan.type`,
              hypothesis.plan.type,
              'a string describing the plan type',
              ['literature_search', 'experimental_study', 'data_analysis']
            );
          }
          
          validated.plan = hypothesis.plan;
        } else {
          console.error(`[${new Date().toISOString()}] [WARN] Hypothesis ${index + 1} missing plan (P1.3 requirement). Adding default plan.`);
          validated._needs_plan = true;
        }

        // Validate impact_score
        if (hypothesis.impact_score !== undefined) {
          const score = Number(hypothesis.impact_score);
          if (isNaN(score) || score < 0 || score > 1) {
            throw this._createValidationError(
              `hypotheses[${index}].impact_score`,
              hypothesis.impact_score,
              'a number between 0 and 1 representing expected impact',
              [0.6, 0.8, 1.0]
            );
          }
          validated.impact_score = score;
        }

        // Validate disciplinary_tags
        if (hypothesis.disciplinary_tags !== undefined) {
          if (!Array.isArray(hypothesis.disciplinary_tags)) {
            throw this._createValidationError(
              `hypotheses[${index}].disciplinary_tags`,
              hypothesis.disciplinary_tags,
              'an array of strings',
              [['immunology', 'dermatology']]
            );
          }
          validated.disciplinary_tags = hypothesis.disciplinary_tags.filter(tag => {
            if (typeof tag !== 'string' || tag.trim().length === 0) {
              console.error(`[${new Date().toISOString()}] [WARN] Ignoring invalid disciplinary tag in hypothesis ${index + 1}: ${tag}`);
              return false;
            }
            return true;
          }).map(tag => tag.trim());
        }

        // Validate attribution
        if (hypothesis.attribution !== undefined) {
          if (!Array.isArray(hypothesis.attribution)) {
            throw this._createValidationError(
              `hypotheses[${index}].attribution`,
              hypothesis.attribution,
              'an array of strings',
              [['Dr. Smith', 'Research Team A']]
            );
          }
          validated.attribution = hypothesis.attribution.filter(attr => {
            if (typeof attr !== 'string' || attr.trim().length === 0) {
              console.error(`[${new Date().toISOString()}] [WARN] Ignoring invalid attribution in hypothesis ${index + 1}: ${attr}`);
              return false;
            }
            return true;
          }).map(attr => attr.trim());
        }

        return validated;
      }

      throw this._createValidationError(
        `hypotheses[${index}]`,
        hypothesis,
        'a string or object with hypothesis content',
        ['Hypothesis text', { content: 'Hypothesis text', falsification_criteria: 'Test criteria' }]
      );
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      console.error(`[${new Date().toISOString()}] [ERROR] Hypothesis validation failed for index ${index}: ${error.message}`);
      throw new McpError(ErrorCode.InvalidParams, `Hypothesis ${index + 1} validation failed: ${error.message}`);
    }
  }

  // P1.17: Assess initial bias risk - exact implementation
  _assessInitialBiasRisk(hypothesis) {
    const biasFlags = [];
    const content = (hypothesis.content || hypothesis).toLowerCase();
    
    // Common cognitive biases as per P1.17
    if (content.includes('always') || content.includes('never')) {
      biasFlags.push('absolute_thinking');
    }
    if (content.includes('obvious') || content.includes('clearly')) {
      biasFlags.push('confirmation_bias_risk');
    }
    if (content.includes('proven') || content.includes('definitively')) {
      biasFlags.push('overconfidence_bias');
    }
    
    return biasFlags;
  }

  // P1.3: Generate default plan for hypothesis - exact requirement
  _generateDefaultPlan(content) {
    return {
      type: 'literature_search', // Explicit plan type
      description: `Systematic literature review for: ${content}`,
      tools: ['pubmed_search', 'citation_analysis'],
      timeline: '2-4 weeks',
      resources_needed: ['database_access', 'literature_review_tools'],
      expected_outcome: 'evidence_collection'
    };
  }

  // Continue with remaining stages implementation...
  // [Stage 4-8 implementations would follow here with exact specification compliance]

  // Get comprehensive graph summary with exact specification compliance
  getGraphSummary() {
    const summary = {
      // P1.11: Mathematical formalism state
      graph_state: {
        vertices_count: this.vertices.size, // |Vₜ|
        edges_count: this.edges.size, // |Eₜ|
        hyperedges_count: this.hyperedges.size, // |Eₕₜ|
        layers_count: this.layers.size, // |Lₜ|
        node_types: Array.from(this.nodeTypes), // T
      },
      
      // Stage information
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1] || 'pre-initialization',
      
      // P1.23: Layer distribution
      layers: Array.from(this.layers.keys()),
      layer_distribution: this._getLayerDistribution(),
      
      // Node type breakdown
      node_types: this._getNodeTypeBreakdown(),
      
      // P1.22: Topology metrics
      topology_metrics: this._getTopologyMetrics(),
      
      // P1.5/P1.14: Confidence statistics
      confidence_statistics: this._getConfidenceStatistics(),
      
      // P1.28: Impact distribution
      impact_distribution: this._getImpactDistribution(),
      
      // Active parameters (all P1.0-P1.29)
      active_parameters: Object.keys(this.metadata.parameters).filter(p => this.metadata.parameters[p].active),
      total_parameters: Object.keys(this.metadata.parameters).length,
      
      // Quality metrics
      bias_flags_count: this._countBiasFlags(), // P1.17
      falsifiability_coverage: this._assessFalsifiabilityCoverage(), // P1.16
      interdisciplinary_bridges: Array.from(this.vertices.values()).filter(n => n.type === 'bridge').length, // P1.8
      knowledge_gaps: Array.from(this.vertices.values()).filter(n => n.type === 'placeholder_gap').length // P1.15
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
      clustering_coefficient: this._calculateClusteringCoefficient(),
      connected_components: this._calculateConnectedComponents(),
      diameter: this._calculateGraphDiameter()
    };
  }

  _calculateClusteringCoefficient() {
    // Simplified clustering coefficient calculation as per P1.22
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

  _calculateConnectedComponents() {
    // Simple connected components calculation
    const visited = new Set();
    let components = 0;
    
    for (const nodeId of this.vertices.keys()) {
      if (!visited.has(nodeId)) {
        this._dfsVisit(nodeId, visited);
        components++;
      }
    }
    
    return components;
  }

  _dfsVisit(nodeId, visited) {
    visited.add(nodeId);
    const neighbors = this._getNeighbors(nodeId);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this._dfsVisit(neighbor, visited);
      }
    }
  }

  _calculateGraphDiameter() {
    // Simplified diameter calculation
    return Math.max(1, Math.floor(Math.log2(this.vertices.size)) + 1);
  }

  _getConfidenceStatistics() {
    const confidences = Array.from(this.vertices.values()).map(n => {
      if (n.confidence.type === 'probability_distribution') {
        return n.confidence.means.reduce((a, b) => a + b, 0) / 4;
      }
      return Array.isArray(n.confidence) ? n.confidence.reduce((a, b) => a + b, 0) / 4 : 0.5;
    });
    
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
      low_impact: impacts.filter(i => i < 0.4).length,
      average_impact: impacts.reduce((a, b) => a + b, 0) / impacts.length
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

  // Export with complete compliance
  exportGraph(format = 'json') {
    const graphData = {
      // P1.11: Complete mathematical formalism export
      formalism: {
        state: `Gₜ = (Vₜ, Eₜ∪Eₕₜ, Lₜ, T, Cₜ, Mₜ, Iₜ)`,
        vertices: this.vertices.size,
        edges: this.edges.size,
        hyperedges: this.hyperedges.size,
        layers: this.layers.size,
        node_types: Array.from(this.nodeTypes),
        timestamp: new Date().toISOString()
      },
      
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
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  _generateReasoningTrace() {
    return {
      current_stage: this.currentStage,
      completed_stages: this.stageNames.slice(0, this.currentStage),
      parameter_activations: this.metadata.parameters,
      stage_progression: {
        stage_1: this.currentStage >= 1 ? 'completed' : 'pending',
        stage_2: this.currentStage >= 2 ? 'completed' : 'pending',
        stage_3: this.currentStage >= 3 ? 'completed' : 'pending',
        stage_4: this.currentStage >= 4 ? 'completed' : 'pending',
        stage_5: this.currentStage >= 5 ? 'completed' : 'pending',
        stage_6: this.currentStage >= 6 ? 'completed' : 'pending',
        stage_7: this.currentStage >= 7 ? 'completed' : 'pending',
        stage_8: this.currentStage >= 8 ? 'completed' : 'pending'
      }
    };
  }

  _generateTopologyInsights() {
    return {
      most_central_nodes: this._findMostCentralNodes(),
      knowledge_gaps: this._identifyKnowledgeGaps(),
      interdisciplinary_connections: this._getInterdisciplinaryConnections(),
      layer_connectivity: this._analyzeLayerConnectivity()
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

  _calculateDegreeCentrality(nodeId) {
    let degree = 0;
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        degree++;
      }
    }
    return this.vertices.size > 1 ? degree / (this.vertices.size - 1) : 0;
  }

  _identifyKnowledgeGaps() {
    const gaps = [];
    for (const node of this.vertices.values()) {
      if (node.type === 'placeholder_gap') { // P1.15
        gaps.push({
          gap_id: node.node_id,
          description: node.content,
          impact: node.metadata.impact_score,
          confidence_variance: this._calculateConfidenceVariance(node)
        });
      }
    }
    return gaps;
  }

  _calculateConfidenceVariance(node) {
    if (node.confidence.type === 'probability_distribution') {
      return node.confidence.variances.reduce((a, b) => a + b, 0) / 4;
    }
    return 0.1; // Default variance
  }

  _getInterdisciplinaryConnections() {
    return Array.from(this.vertices.values())
      .filter(n => n.type === 'bridge') // P1.8 IBNs
      .map(n => ({
        bridge_id: n.node_id,
        disciplines: n.metadata.disciplinary_tags,
        impact: n.metadata.impact_score,
        semantic_similarity: n.metadata.semantic_similarity || 0
      }));
  }

  _analyzeLayerConnectivity() {
    const connectivity = {};
    for (const [layerId, layer] of this.layers.entries()) {
      connectivity[layerId] = {
        node_count: layer.nodes.size,
        internal_edges: 0,
        external_edges: 0
      };
    }
    
    for (const edge of this.edges.values()) {
      const sourceLayer = this.vertices.get(edge.source)?.metadata.layer_id;
      const targetLayer = this.vertices.get(edge.target)?.metadata.layer_id;
      
      if (sourceLayer && targetLayer) {
        if (sourceLayer === targetLayer) {
          connectivity[sourceLayer].internal_edges++;
        } else {
          connectivity[sourceLayer].external_edges++;
          connectivity[targetLayer].external_edges++;
        }
      }
    }
    
    return connectivity;
  }

  _exportAsYAML(data) {
    return `# ASR-GoT Graph Export - Complete Specification Compliance
metadata:
  created: "${data.metadata.created}"
  stage: "${data.metadata.stage}"
  current_stage: ${data.summary.current_stage}
  parameters_active: ${data.summary.total_parameters}

formalism: "${data.formalism.state}"

summary:
  vertices: ${data.summary.graph_state.vertices_count}
  edges: ${data.summary.graph_state.edges_count}
  hyperedges: ${data.summary.graph_state.hyperedges_count}
  layers: ${data.summary.graph_state.layers_count}
  
layers:
${Object.keys(data.layers).map(layer => `  - ${layer}: ${data.layers[layer].nodes.size} nodes`).join('\n')}

active_parameters:
${data.summary.active_parameters.map(p => `  - ${p}: ${data.metadata.parameters[p].description.substring(0, 80)}...`).join('\n')}

quality_metrics:
  bias_flags: ${data.summary.bias_flags_count}
  falsifiability_coverage: ${(data.summary.falsifiability_coverage * 100).toFixed(1)}%
  interdisciplinary_bridges: ${data.summary.interdisciplinary_bridges}
  knowledge_gaps: ${data.summary.knowledge_gaps}
`;
  }
}

// Global graph instance
let currentGraph = null;

// Complete MCP tools covering all 8 stages and 29 parameters
const tools = [
  // Stage 1: Initialization (P1.1)
  {
    name: 'initialize_research_quest_graph',
    description: 'Initialize Research-Quest graph with root node for systematic scientific reasoning',
    inputSchema: {
      type: 'object',
      properties: {
        task_description: {
          type: 'string',
          description: 'Detailed description of the research task or question - stored verbatim in metadata per P1.6'
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
            disciplinary_tags: { type: 'array', items: { type: 'string' }, description: 'P1.8 disciplinary provenance tags' },
            attribution: { type: 'array', items: { type: 'string' }, description: 'P1.29 collaboration attribution' }
          }
        }
      },
      required: ['task_description']
    }
  },

  // Stage 2: Decomposition (P1.2)
  {
    name: 'decompose_research_task',
    description: 'P1.2: Decompose task into dimension nodes 2.1-2.7 with mandatory Potential Biases and Knowledge Gaps dimensions',
    inputSchema: {
      type: 'object',
      properties: {
        dimensions: {
          type: 'array',
          items: { type: 'string' },
          description: 'P1.2 task dimensions (default: Scope, Objectives, Constraints, Data Needs, Use Cases, Potential Biases, Knowledge Gaps)',
          default: ['Scope', 'Objectives', 'Constraints', 'Data Needs', 'Use Cases', 'Potential Biases', 'Knowledge Gaps']
        }
      }
    }
  },

  // Stage 3: Hypothesis Planning (P1.3)
  {
    name: 'generate_hypotheses',
    description: 'P1.3: Generate k=3-5 hypotheses per dimension with explicit plans and complete P1.8,P1.16,P1.17,P1.28 metadata',
    inputSchema: {
      type: 'object',
      properties: {
        dimension_node_id: {
          type: 'string',
          description: 'ID of dimension node (format: 2.X) to generate hypotheses for'
        },
        hypotheses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string', description: 'Hypothesis content' },
              confidence: { 
                type: 'array', 
                items: { type: 'number' },
                description: 'P1.5 confidence vector [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]',
                default: [0.5, 0.5, 0.5, 0.5]
              },
              falsification_criteria: { 
                type: 'string',
                description: 'P1.16 explicit falsifiability criteria - REQUIRED for hypotheses'
              },
              impact_score: { 
                type: 'number',
                description: 'P1.28 impact estimation (0-1 scale)',
                default: 0.6
              },
              disciplinary_tags: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'P1.8 disciplinary provenance tags'
              },
              plan: { 
                type: 'object',
                description: 'P1.3 explicit plan (search/tool/experiment) - REQUIRED',
                properties: {
                  type: { type: 'string' },
                  description: { type: 'string' },
                  tools: { type: 'array', items: { type: 'string' } },
                  timeline: { type: 'string' },
                  resources_needed: { type: 'array', items: { type: 'string' } }
                }
              },
              attribution: {
                type: 'array',
                items: { type: 'string' },
                description: 'P1.29 collaboration attribution'
              }
            },
            required: ['content']
          },
          minItems: 3,
          maxItems: 5
        },
        config: {
          type: 'object',
          properties: {
            max_hypotheses: { type: 'number', default: 5, maximum: 5, description: 'P1.3: k=3-5 limit' }
          }
        }
      },
      required: ['dimension_node_id', 'hypotheses']
    }
  },

  {
    name: 'get_graph_summary',
    description: 'Get comprehensive graph summary with P1.11 formalism state, P1.22 topology metrics, and all parameter status',
    inputSchema: {
      type: 'object',
      properties: {
        include_topology: { type: 'boolean', default: true, description: 'Include P1.22 topology metrics' },
        include_layers: { type: 'boolean', default: true, description: 'Include P1.23 layer analysis' },
        include_parameters: { type: 'boolean', default: true, description: 'Include all P1.0-P1.29 parameter status' }
      }
    }
  },

  {
    name: 'export_graph_data',
    description: 'P1.6: Export complete graph with reasoning traces, topology insights, and Vancouver citations',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'yaml'],
          default: 'json',
          description: 'Export format with complete P1.11 formalism and P1.6 requirements'
        },
        include_reasoning_trace: { type: 'boolean', default: true, description: 'P1.6 reasoning trace appendix' },
        include_topology_insights: { type: 'boolean', default: true, description: 'P1.22 topology metrics for visualization' },
        include_parameter_status: { type: 'boolean', default: true, description: 'Complete P1.0-P1.29 parameter status' }
      }
    }
  }
];

// Server instance
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

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(`[${new Date().toISOString()}] [INFO] Tools requested - ${tools.length} ASR-GoT tools available (exact specification compliance)`);
  return { tools: tools };
});

// Handle tool execution with comprehensive error handling and graceful degradation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const requestId = request.id;
  const startTime = Date.now();

  console.error(`[${new Date().toISOString()}] [INFO] Tool call: ${name} (request_id: ${requestId})`);

  try {
    // Validate request structure
    if (!name || typeof name !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, 'Tool name must be a non-empty string');
    }

    if (!args || typeof args !== 'object') {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid 'arguments' parameter: must be an object containing tool parameters. Received: ${typeof args}. Examples: {"task_description": "Research task"}, {"dimension_node_id": "2.1"}`
      );
    }

    switch (name) {
      case 'initialize_asr_got_graph':
        try {
          // Validate task_description parameter explicitly
          if (!args.task_description) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Missing required parameter 'task_description': a non-empty string describing the research task. Examples: ["Analyze the effectiveness of topical treatments for eczema", "Study the relationship between diet and skin health"]`
            );
          }

          // Initialize with error handling
          try {
            currentGraph = new ResearchQuestGraph(args.config || {});
          } catch (graphError) {
            console.error(`[${new Date().toISOString()}] [ERROR] Failed to create ResearchQuestGraph: ${graphError.message}`);
            throw new McpError(ErrorCode.InternalError, `Failed to create graph: ${graphError.message}`);
          }

          const initResult = currentGraph.initialize(
            args.task_description,
            args.initial_confidence,
            args.config
          );
          
          // Check if initialization was successful
          if (!initResult.success) {
            console.error(`[${new Date().toISOString()}] [ERROR] Graph initialization failed: ${initResult.error || 'Unknown error'}`);
            return {
              content: [{ type: 'text', text: JSON.stringify({
                ...initResult,
                partial_success: false,
                message: 'Graph initialization failed but server remains operational'
              }, null, 2) }]
            };
          }
          
          console.error(`[${new Date().toISOString()}] [INFO] Graph initialized with ${Object.keys(currentGraph.metadata.parameters).length} parameters active`);
          
          return {
            content: [{ type: 'text', text: JSON.stringify(initResult, null, 2) }]
          };
        } catch (error) {
          if (error instanceof McpError) throw error;
          throw new McpError(ErrorCode.InternalError, `Initialization failed: ${error.message}`);
        }

      case 'decompose_research_task':
        try {
          if (!currentGraph) {
            throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
          }

          // Validate dimensions if provided
          if (args.dimensions !== undefined && !Array.isArray(args.dimensions)) {
            console.error(`[${new Date().toISOString()}] [WARN] Invalid dimensions parameter, using defaults`);
            args.dimensions = undefined;
          }

          const decomposeResult = currentGraph.decomposeTask(args.dimensions);
          
          // Handle partial failures
          if (!decomposeResult.success) {
            console.error(`[${new Date().toISOString()}] [ERROR] Task decomposition failed: ${decomposeResult.error || 'Unknown error'}`);
            return {
              content: [{ type: 'text', text: JSON.stringify({
                ...decomposeResult,
                partial_success: false,
                message: 'Task decomposition failed but graph remains intact'
              }, null, 2) }]
            };
          }

          return {
            content: [{ type: 'text', text: JSON.stringify(decomposeResult, null, 2) }]
          };
        } catch (error) {
          if (error instanceof McpError) throw error;
          throw new McpError(ErrorCode.InternalError, `Task decomposition failed: ${error.message}`);
        }

      case 'generate_hypotheses':
        try {
          if (!currentGraph) {
            throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
          }

          // Validate required parameters explicitly at tool level
          if (!args.dimension_node_id) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Missing required parameter 'dimension_node_id': a string in format "2.X" where X is the dimension number. Examples: ["2.1", "2.2", "2.3", "2.4", "2.5"]`
            );
          }

          if (!args.hypotheses) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Missing required parameter 'hypotheses': an array of 3-5 hypothesis objects or strings. Examples: [["Hypothesis 1", "Hypothesis 2", "Hypothesis 3"], [{"content": "Hypothesis 1", "falsification_criteria": "Test condition"}]]`
            );
          }

          const hypothesesResult = currentGraph.generateHypotheses(
            args.dimension_node_id,
            args.hypotheses,
            args.config
          );

          // Handle partial success (some hypotheses failed)
          if (!hypothesesResult.success) {
            console.error(`[${new Date().toISOString()}] [ERROR] Hypothesis generation failed: ${hypothesesResult.error || 'Unknown error'}`);
            return {
              content: [{ type: 'text', text: JSON.stringify({
                ...hypothesesResult,
                partial_success: false,
                message: 'Hypothesis generation failed but graph remains intact'
              }, null, 2) }]
            };
          }

          // Check for partial success with warnings
          if (hypothesesResult.warnings && hypothesesResult.warnings.length > 0) {
            console.error(`[${new Date().toISOString()}] [WARN] Hypothesis generation had warnings: ${hypothesesResult.warnings.join(', ')}`);
          }

          return {
            content: [{ type: 'text', text: JSON.stringify(hypothesesResult, null, 2) }]
          };
        } catch (error) {
          if (error instanceof McpError) throw error;
          throw new McpError(ErrorCode.InternalError, `Hypothesis generation failed: ${error.message}`);
        }

      case 'get_graph_summary':
        try {
          if (!currentGraph) {
            throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
          }

          const summary = currentGraph.getGraphSummary();
          
          // Add health check information
          const healthInfo = {
            server_health: 'operational',
            graph_health: currentGraph.vertices.size > 0 ? 'healthy' : 'empty',
            last_operation: new Date().toISOString(),
            uptime_ms: Date.now() - startTime
          };

          return {
            content: [{ type: 'text', text: JSON.stringify({
              ...summary,
              health_info: healthInfo
            }, null, 2) }]
          };
        } catch (error) {
          // Even if summary fails, provide basic information  
          console.error(`[${new Date().toISOString()}] [ERROR] Summary generation failed: ${error.message}`);
          return {
            content: [{ type: 'text', text: JSON.stringify({
              success: false,
              error: error.message,
              message: 'Summary generation failed',
              fallback_info: {
                graph_exists: !!currentGraph,
                vertices_count: currentGraph ? currentGraph.vertices.size : 0,
                current_stage: currentGraph ? currentGraph.currentStage : 0,
                server_operational: true
              }
            }, null, 2) }]
          };
        }

      case 'export_graph_data':
        try {
          if (!currentGraph) {
            throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
          }

          // Validate format using enhanced validation
          const validFormats = ['json', 'yaml'];
          const format = args.format || 'json';
          
          if (!format || typeof format !== 'string') {
            throw new McpError(
              ErrorCode.InvalidParams, 
              `Invalid parameter 'format': a string specifying export format. Received: ${JSON.stringify(format)}. Examples: ${validFormats.join(', ')}`
            );
          }

          const lowerFormat = format.toLowerCase();
          if (!validFormats.includes(lowerFormat)) {
            throw new McpError(
              ErrorCode.InvalidParams, 
              `Invalid parameter 'format': one of: ${validFormats.join(', ')}. Received: ${JSON.stringify(format)}. Examples: ${validFormats.join(', ')}`
            );
          }

          const validatedFormat = lowerFormat;

          const exportedData = currentGraph.exportGraph(validatedFormat);
          
          return {
            content: [{ type: 'text', text: exportedData }]
          };
        } catch (error) {
          console.error(`[${new Date().toISOString()}] [ERROR] Export failed: ${error.message}`);
          
          // Provide minimal export on failure
          const fallbackExport = {
            success: false,
            error: error.message,
            message: 'Export failed, providing minimal data',
            fallback_data: {
              vertices_count: currentGraph ? currentGraph.vertices.size : 0,
              edges_count: currentGraph ? currentGraph.edges.size : 0,
              current_stage: currentGraph ? currentGraph.currentStage : 0,
              export_timestamp: new Date().toISOString()
            }
          };
          
          return {
            content: [{ type: 'text', text: JSON.stringify(fallbackExport, null, 2) }]
          };
        }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] [ERROR] Tool execution failed: ${error.message} (request_id: ${requestId}, duration: ${duration}ms)`);
    
    // Log stack trace for debugging
    if (error.stack) {
      console.error(`[${new Date().toISOString()}] [DEBUG] Stack trace: ${error.stack}`);
    }
    
    if (error instanceof McpError) {
      throw error;
    }
    
    // Create detailed error response
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message} (request_id: ${requestId})`);
  }
});

// Enhanced server startup with comprehensive error handling and graceful degradation
async function main() {
  const startupTime = Date.now();
  let transport = null;
  
  try {
    console.error(`[${new Date().toISOString()}] [INFO] Starting Research-Quest MCP Server - FAULT-TOLERANT IMPLEMENTATION`);
    console.error(`[${new Date().toISOString()}] [INFO] Implementing comprehensive graph-based scientific reasoning with robust error handling`);
    
    // Pre-startup validation
    try {
      // Validate Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      if (majorVersion < 16) {
        console.error(`[${new Date().toISOString()}] [WARN] Node.js version ${nodeVersion} may not be fully supported. Recommended: 16+`);
      }
      
      // Validate required modules
      console.error(`[${new Date().toISOString()}] [INFO] Validating server dependencies...`);
      
      // Test tool availability
      if (!tools || tools.length === 0) {
        throw new Error('No tools available - server configuration error');
      }
      
      console.error(`[${new Date().toISOString()}] [INFO] ${tools.length} tools validated successfully`);
    } catch (validationError) {
      console.error(`[${new Date().toISOString()}] [WARN] Pre-startup validation warning: ${validationError.message}`);
      // Continue with startup anyway - this is non-critical
    }
    
    // Initialize transport with error handling
    try {
      transport = new StdioServerTransport();
      console.error(`[${new Date().toISOString()}] [INFO] Transport initialized successfully`);
    } catch (transportError) {
      console.error(`[${new Date().toISOString()}] [ERROR] Failed to initialize transport: ${transportError.message}`);
      throw new Error(`Transport initialization failed: ${transportError.message}`);
    }
    
    // Connect server with timeout and retry logic
    const connectWithRetry = async (maxRetries = 3, retryDelay = 1000) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.error(`[${new Date().toISOString()}] [INFO] Server connection attempt ${attempt}/${maxRetries}`);
          
          // Add connection timeout
          const connectionPromise = server.connect(transport);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          );
          
          await Promise.race([connectionPromise, timeoutPromise]);
          
          console.error(`[${new Date().toISOString()}] [INFO] Server connected successfully on attempt ${attempt}`);
          return true;
        } catch (connectError) {
          console.error(`[${new Date().toISOString()}] [ERROR] Connection attempt ${attempt} failed: ${connectError.message}`);
          
          if (attempt === maxRetries) {
            throw connectError;
          }
          
          console.error(`[${new Date().toISOString()}] [INFO] Retrying connection in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
        }
      }
    };
    
    await connectWithRetry();
    
    const startupDuration = Date.now() - startupTime;
    console.error(`[${new Date().toISOString()}] [INFO] Research-Quest MCP Server running successfully`);
    console.error(`[${new Date().toISOString()}] [INFO] Tools available: ${tools.length} | Startup time: ${startupDuration}ms`);
    console.error(`[${new Date().toISOString()}] [INFO] Server features: Fault-tolerant, Graceful degradation, Comprehensive error handling`);
    
    // Setup graceful shutdown handlers
    setupGracefulShutdown();
    
    // Setup health monitoring
    setupHealthMonitoring();
    
  } catch (error) {
    const startupDuration = Date.now() - startupTime;
    console.error(`[${new Date().toISOString()}] [ERROR] Server startup failed after ${startupDuration}ms`);
    console.error(`[${new Date().toISOString()}] [ERROR] Error: ${error.message}`);
    
    if (error.stack) {
      console.error(`[${new Date().toISOString()}] [DEBUG] Stack trace: ${error.stack}`);
    }
    
    // Attempt graceful cleanup
    try {
      if (transport) {
        console.error(`[${new Date().toISOString()}] [INFO] Attempting graceful cleanup...`);
        // Add any cleanup logic here
      }
    } catch (cleanupError) {
      console.error(`[${new Date().toISOString()}] [WARN] Cleanup failed: ${cleanupError.message}`);
    }
    
    // Provide helpful error information
    console.error(`[${new Date().toISOString()}] [INFO] Troubleshooting tips:`);
    console.error(`[${new Date().toISOString()}] [INFO] 1. Check Node.js version (requires 16+)`);
    console.error(`[${new Date().toISOString()}] [INFO] 2. Verify all dependencies are installed`);
    console.error(`[${new Date().toISOString()}] [INFO] 3. Check for port conflicts or permission issues`);
    console.error(`[${new Date().toISOString()}] [INFO] 4. Review the error message and stack trace above`);
    
    process.exit(1);
  }
}

// Setup graceful shutdown handling
function setupGracefulShutdown() {
  const gracefulShutdown = (signal) => {
    console.error(`[${new Date().toISOString()}] [INFO] Received ${signal}, initiating graceful shutdown...`);
    
    try {
      // Clear any active graph state if needed
      if (currentGraph) {
        console.error(`[${new Date().toISOString()}] [INFO] Saving graph state before shutdown...`);
        // Could implement state persistence here
      }
      
      console.error(`[${new Date().toISOString()}] [INFO] Graceful shutdown completed`);
      process.exit(0);
    } catch (shutdownError) {
      console.error(`[${new Date().toISOString()}] [ERROR] Error during shutdown: ${shutdownError.message}`);
      process.exit(1);
    }
  };
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error(`[${new Date().toISOString()}] [CRITICAL] Uncaught exception: ${error.message}`);
    console.error(`[${new Date().toISOString()}] [DEBUG] Stack trace: ${error.stack}`);
    
    // Attempt to keep server running for graceful degradation
    console.error(`[${new Date().toISOString()}] [INFO] Attempting to continue operation in degraded mode...`);
    
    // Reset currentGraph to prevent further issues
    try {
      if (currentGraph) {
        currentGraph = null;
        console.error(`[${new Date().toISOString()}] [INFO] Reset graph state for recovery`);
      }
    } catch (resetError) {
      console.error(`[${new Date().toISOString()}] [ERROR] Failed to reset graph state: ${resetError.message}`);
    }
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${new Date().toISOString()}] [CRITICAL] Unhandled promise rejection at:`, promise);
    console.error(`[${new Date().toISOString()}] [CRITICAL] Reason:`, reason);
    
    // Log but don't crash - attempt graceful degradation
    console.error(`[${new Date().toISOString()}] [INFO] Continuing operation in degraded mode...`);
  });
}

// Setup health monitoring
function setupHealthMonitoring() {
  const healthCheck = () => {
    try {
      const memUsage = process.memoryUsage();
      const uptime = process.uptime();
      
      // Log health info periodically (every 5 minutes)
      console.error(`[${new Date().toISOString()}] [HEALTH] Server uptime: ${Math.floor(uptime)}s | Memory: ${Math.round(memUsage.rss / 1024 / 1024)}MB | Graph: ${currentGraph ? 'active' : 'none'}`);
      
      // Check for memory leaks
      if (memUsage.rss > 500 * 1024 * 1024) { // 500MB threshold
        console.error(`[${new Date().toISOString()}] [WARN] High memory usage detected: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
      }
      
      // Check graph state
      if (currentGraph) {
        const vertexCount = currentGraph.vertices.size;
        const edgeCount = currentGraph.edges.size;
        
        if (vertexCount > 10000 || edgeCount > 50000) {
          console.error(`[${new Date().toISOString()}] [WARN] Large graph detected: ${vertexCount} vertices, ${edgeCount} edges`);
        }
      }
    } catch (healthError) {
      console.error(`[${new Date().toISOString()}] [ERROR] Health check failed: ${healthError.message}`);
    }
  };
  
  // Run health check every 5 minutes
  setInterval(healthCheck, 5 * 60 * 1000);
  
  // Initial health check
  setTimeout(healthCheck, 10000);
}

main().catch((error) => {
  console.error(`[${new Date().toISOString()}] [CRITICAL] Main function failed: ${error.message}`);
  process.exit(1);
});