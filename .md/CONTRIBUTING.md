# Contributing to ASR-GoT Desktop Extension

Thank you for your interest in contributing to the ASR-GoT (Advanced Scientific Reasoning - Graph of Thoughts) Desktop Extension! This project aims to advance scientific research through systematic reasoning frameworks.

## 🌟 How to Contribute

We welcome contributions from researchers, developers, and anyone interested in advancing scientific reasoning tools. Here are the main ways you can contribute:

### 1. 🐛 Bug Reports

If you find a bug, please [open an issue](https://github.com/saptaswa-dey/asr-got-desktop-extension/issues) with:

- **Clear description** of the problem
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Environment details** (OS, Node.js version, Claude Desktop version)
- **Error messages** or logs if applicable

### 2. 💡 Feature Requests

We encourage feature suggestions that enhance scientific reasoning capabilities:

- **Research workflow improvements**
- **New analysis methods** (statistical, causal, temporal)
- **Integration with scientific tools** (R, Python, MATLAB)
- **Domain-specific adaptations** (biology, physics, chemistry, etc.)
- **Collaboration features** for research teams

### 3. 🔬 Scientific Framework Enhancements

As researchers, you can contribute to the ASR-GoT framework itself:

- **New reasoning stages** or substages
- **Enhanced confidence models** and uncertainty quantification
- **Bias detection algorithms** for scientific reasoning
- **Knowledge gap identification** methodologies
- **Impact assessment models** for research significance

### 4. 💻 Code Contributions

#### Prerequisites

- **Node.js** >= 18.0.0
- **Git** for version control
- **Understanding of** scientific reasoning principles (helpful but not required)

#### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/asr-got-desktop-extension.git
   cd asr-got-desktop-extension
   ```

3. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

4. **Run tests** to ensure everything works:
   ```bash
   npm test
   ```

5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Code Guidelines

- **Follow existing code style** and patterns
- **Write descriptive commit messages** following [Conventional Commits](https://www.conventionalcommits.org/)
- **Add tests** for new functionality
- **Update documentation** for API changes
- **Maintain Node.js compatibility** (>= 18.0.0)

#### Testing

Run the test suite before submitting:

```bash
# Run all tests
npm test

# Run specific component tests
node test.js

# Run with debugging
npm run dev
```

#### Pull Request Process

1. **Ensure tests pass** and code follows guidelines
2. **Update documentation** if needed
3. **Create a pull request** with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference to related issues (if applicable)
   - Screenshots or examples (if UI/UX changes)

## 🧬 Scientific Research Focus Areas

The ASR-GoT framework is designed to support rigorous scientific research. We particularly welcome contributions in:

### Core Scientific Domains
- **Immunology & Dermatology** (primary focus areas)
- **Computational Biology** and bioinformatics
- **Machine Learning** applications in science
- **Multi-disciplinary research** methodologies

### Methodological Enhancements
- **Bayesian reasoning** improvements
- **Causal inference** methods (Pearl's causal hierarchy)
- **Temporal analysis** for dynamic systems
- **Statistical power** and effect size calculations
- **Meta-analysis** integration capabilities

### Research Workflow Features
- **Literature review** automation and integration
- **Hypothesis generation** from existing knowledge
- **Evidence synthesis** across multiple studies
- **Collaborative research** tools and attribution
- **Reproducibility** features and validation

## 📚 Documentation Contributions

Help improve our documentation:

- **API documentation** and examples
- **Tutorial creation** for specific research workflows
- **Case studies** demonstrating ASR-GoT applications
- **Translation** to other languages
- **Video tutorials** or screencasts

## 🔬 Research Collaborations

We welcome collaborations with:

- **Academic researchers** using ASR-GoT in their work
- **Research institutions** interested in systematic reasoning tools
- **Scientific software developers** building complementary tools
- **Standards organizations** working on research methodology

## 🏆 Recognition

Contributors will be recognized in:

- **Project README** acknowledgments
- **Release notes** for significant contributions
- **Academic publications** citing the extension (where appropriate)
- **Conference presentations** about the project

## 📋 Issue Templates

When creating issues, please use our templates:

- **🐛 Bug Report**: For technical issues
- **💡 Feature Request**: For new functionality
- **🔬 Research Enhancement**: For scientific methodology improvements
- **📚 Documentation**: For documentation improvements
- **❓ Question**: For usage questions and discussions

## 🤝 Code of Conduct

This project adheres to scientific research principles:

- **Integrity**: Honest and accurate reporting
- **Collaboration**: Respectful and constructive interaction
- **Reproducibility**: Clear documentation and methodology
- **Inclusivity**: Welcoming researchers from all backgrounds
- **Quality**: Rigorous standards for code and research

## 🛠️ Technical Architecture

Understanding the codebase structure:

```
asr-got-desktop-extension/
├── manifest.json          # DXT extension manifest
├── server/
│   ├── index.js          # Main MCP server implementation
│   ├── package.json      # Node.js dependencies
│   └── test.js           # Test suite
├── README.md             # Project documentation
├── CONTRIBUTING.md       # This file
├── LICENSE               # MIT license
└── .gitignore           # Git exclusions
```

### Key Components

- **ASRGoTGraph Class**: Core graph state management
- **MCP Tools**: 17+ tools implementing the 8-stage framework
- **Bayesian Updates**: Confidence propagation algorithms
- **Edge Typing**: Causal, temporal, and logical relationships
- **Export/Import**: Multiple format support (JSON, YAML, GraphML)

## 📞 Getting Help

- **GitHub Issues**: Technical questions and bug reports
- **Discussions**: General questions and feature discussions
- **Email**: Dr. Saptaswa Dey <saptaswa.dey@medunigraz.at>
- **Research Collaborations**: Contact for academic partnerships

## 🎯 Roadmap

Upcoming areas of development:

### Version 1.1
- Enhanced statistical power calculations
- Real-time collaboration features
- Integration with reference managers (Zotero, Mendeley)
- Advanced visualization tools

### Version 1.2
- Python integration for data analysis
- R integration for statistical computing
- Machine learning model integration
- Custom domain adaptations

### Version 2.0
- Multi-language support
- Cloud synchronization
- Advanced AI reasoning integration
- Enterprise collaboration features

## 💝 Thank You

Your contributions help advance scientific research and reasoning capabilities. Whether you're fixing bugs, adding features, or improving documentation, every contribution makes a difference in the scientific community.

---

**Questions?** Feel free to open an issue or start a discussion. We're here to help! 🚀