const fs = require('fs');
const path = require('path');

describe('README Documentation Tests', () => {
  let readmeContent;
  const readmePath = path.join(__dirname, '..', 'README.md');

  beforeAll(() => {
    if (fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, 'utf8');
    }
  });

  describe('File existence and basic structure', () => {
    test('should have a README.md file in the root directory', () => {
      expect(fs.existsSync(readmePath)).toBe(true);
    });

    test('should not be empty', () => {
      expect(readmeContent).toBeTruthy();
      expect(readmeContent.trim().length).toBeGreaterThan(0);
    });

    test('should start with a main title (h1 heading)', () => {
      expect(readmeContent).toMatch(/^#\s+.+/m);
    });

    test('should have proper markdown heading hierarchy', () => {
      const headings = readmeContent.match(/^#+\s+.+$/gm) || [];
      expect(headings.length).toBeGreaterThan(0);
      
      // First heading should be h1
      if (headings.length > 0) {
        expect(headings[0]).toMatch(/^#\s+/);
      }
      
      // Check for logical heading progression (no jumping from h1 to h3)
      const headingLevels = headings.map(h => h.match(/^#+/)[0].length);
      for (let i = 1; i < headingLevels.length; i++) {
        const levelDiff = headingLevels[i] - headingLevels[i - 1];
        expect(levelDiff).toBeLessThanOrEqual(1);
      }
    });

    test('should contain common documentation sections', () => {
      const commonSections = [
        /installation/i,
        /usage/i,
        /getting started/i,
        /description/i,
        /overview/i
      ];
      
      const foundSections = commonSections.filter(section => section.test(readmeContent));
      expect(foundSections.length).toBeGreaterThan(0);
    });
  });

  describe('Content validation and formatting', () => {
    test('should have installation instructions when installation is mentioned', () => {
      const hasInstallMention = /install/i.test(readmeContent);
      if (hasInstallMention) {
        const packageManagers = /npm|yarn|pip|composer|gem|go get|cargo|maven|gradle|pnpm/i;
        expect(readmeContent).toMatch(packageManagers);
      }
    });

    test('should contain code examples when usage is mentioned', () => {
      const hasUsageMention = /usage|example|how to use/i.test(readmeContent);
      if (hasUsageMention) {
        const hasCodeBlocks = /```[\s\S]*?```|`[^`\n]+`/.test(readmeContent);
        expect(hasCodeBlocks).toBe(true);
      }
    });

    test('should have properly formatted code blocks', () => {
      const codeBlocks = readmeContent.match(/```[\s\S]*?```/g) || [];
      codeBlocks.forEach(block => {
        // Should start with ``` and optional language, then newline
        expect(block).toMatch(/^```\w*\n/);
        // Should end with newline and ```
        expect(block).toMatch(/\n```$/);
      });
    });

    test('should not have trailing whitespace on lines', () => {
      const lines = readmeContent.split('\n');
      const linesWithTrailingSpace = lines.filter((line, index) => /\s+$/.test(line));
      expect(linesWithTrailingSpace).toHaveLength(0);
    });

    test('should use consistent list formatting', () => {
      const unorderedListItems = readmeContent.match(/^[\s]*[-*+]\s+/gm) || [];
      if (unorderedListItems.length > 1) {
        const markers = unorderedListItems.map(item => item.match(/[-*+]/)[0]);
        const uniqueMarkers = [...new Set(markers)];
        expect(uniqueMarkers).toHaveLength(1);
      }
    });

    test('should have consistent emphasis formatting', () => {
      // Check for proper bold/italic formatting
      const emphasisPatterns = readmeContent.match(/(\*{1,3}[^*\n]+\*{1,3}|_{1,3}[^_\n]+_{1,3})/g) || [];
      emphasisPatterns.forEach(emphasis => {
        if (emphasis.startsWith('*')) {
          const startAsterisks = emphasis.match(/^\*+/)[0].length;
          const endAsterisks = emphasis.match(/\*+$/)[0].length;
          expect(startAsterisks).toBe(endAsterisks);
        } else if (emphasis.startsWith('_')) {
          const startUnderscores = emphasis.match(/^_+/)[0].length;
          const endUnderscores = emphasis.match(/_+$/)[0].length;
          expect(startUnderscores).toBe(endUnderscores);
        }
      });
    });
  });

  describe('Link validation', () => {
    test('should have valid markdown link syntax', () => {
      const links = readmeContent.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
      links.forEach(link => {
        expect(link).toMatch(/\[[^\]]+\]\([^)]+\)/);
        
        const url = link.match(/\]\(([^)]+)\)/)[1];
        
        // URLs should not have unencoded spaces (unless it's a fragment link or mailto)
        if (!url.startsWith('#') && !url.startsWith('mailto:')) {
          expect(url).not.toMatch(/[^%]\s/);
        }
      });
    });

    test('should not have broken internal anchor links', () => {
      const internalLinks = readmeContent.match(/\[([^\]]+)\]\(#([^)]+)\)/g) || [];
      const headings = readmeContent.match(/^#+\s+(.+)$/gm) || [];
      
      if (internalLinks.length > 0) {
        const headingAnchors = headings.map(h => 
          h.replace(/^#+\s+/, '')
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-|-$/g, '')
        );

        internalLinks.forEach(link => {
          const anchor = link.match(/\]\(#([^)]+)\)/)[1];
          expect(headingAnchors).toContain(anchor);
        });
      }
    });

    test('should have well-formed HTTP/HTTPS URLs', () => {
      const httpLinks = readmeContent.match(/https?:\/\/[^\s)]+/g) || [];
      httpLinks.forEach(url => {
        expect(url).toMatch(/^https?:\/\/[^\s]+$/);
        expect(url).not.toMatch(/\s/);
        // Should not end with punctuation that's likely not part of the URL
        expect(url).not.toMatch(/[.,;!?]$/);
      });
    });

    test('should use HTTPS for external links when possible', () => {
      const httpLinks = readmeContent.match(/http:\/\/[^\s)]+/g) || [];
      const httpsLinks = readmeContent.match(/https:\/\/[^\s)]+/g) || [];
      
      // Warn if there are HTTP links (not failing test since some may be intentional)
      if (httpLinks.length > 0) {
        const httpCount = httpLinks.length;
        const httpsCount = httpsLinks.length;
        console.warn(`Found ${httpCount} HTTP links and ${httpsCount} HTTPS links. Consider using HTTPS where possible.`);
      }
    });
  });

  describe('Table validation', () => {
    test('should have properly formatted tables', () => {
      const tablePattern = /^\|.+\|\s*\n\|[-\s|:]+\|\s*\n(\|.+\|\s*\n)*/gm;
      const tables = readmeContent.match(tablePattern) || [];
      
      tables.forEach(table => {
        const rows = table.trim().split('\n');
        if (rows.length >= 2) {
          const headerCols = (rows[0].match(/\|/g) || []).length;
          const separatorCols = (rows[1].match(/\|/g) || []).length;
          
          expect(headerCols).toBe(separatorCols);
          
          // Separator row should contain only |, -, :, and spaces
          expect(rows[1]).toMatch(/^[\s|:-]+$/);
          
          // Check data rows have consistent column count
          for (let i = 2; i < rows.length; i++) {
            const dataCols = (rows[i].match(/\|/g) || []).length;
            expect(dataCols).toBe(headerCols);
          }
        }
      });
    });
  });

  describe('Accessibility and best practices', () => {
    test('should have meaningful image alt text', () => {
      const images = readmeContent.match(/!\[[^\]]*\]\([^)]+\)/g) || [];
      images.forEach(image => {
        const altText = image.match(/!\[([^\]]*)\]/)[1];
        
        // Alt text should exist and be meaningful
        expect(altText.length).toBeGreaterThan(0);
        
        // Should not just be the filename
        const imageSrc = image.match(/\]\(([^)]+)\)/)[1];
        const filename = imageSrc.split('/').pop().split('.')[0];
        expect(altText.toLowerCase()).not.toBe(filename.toLowerCase());
      });
    });

    test('should avoid generic link text', () => {
      const links = readmeContent.match(/\[[^\]]+\]\([^)]+\)/g) || [];
      const genericLinkTexts = ['click here', 'here', 'link', 'read more', 'more', 'this'];
      
      links.forEach(link => {
        const linkText = link.match(/\[([^\]]+)\]/)[1].toLowerCase().trim();
        genericLinkTexts.forEach(badText => {
          expect(linkText).not.toBe(badText);
        });
      });
    });

    test('should not have excessively long lines', () => {
      const lines = readmeContent.split('\n');
      const longLines = lines.filter(line => line.length > 120);
      
      // Allow some long lines (like URLs) but not too many
      const longLineRatio = longLines.length / lines.length;
      expect(longLineRatio).toBeLessThan(0.2); // Less than 20% of lines should be over 120 chars
    });

    test('should have consistent heading capitalization', () => {
      const headings = readmeContent.match(/^#+\s+(.+)$/gm) || [];
      if (headings.length > 1) {
        const headingTexts = headings.map(h => h.replace(/^#+\s+/, ''));
        
        // Check if headings follow title case or sentence case consistently
        const titleCaseCount = headingTexts.filter(h => 
          /^[A-Z][a-z]*(\s+[A-Z][a-z]*)*$/.test(h)
        ).length;
        
        const sentenceCaseCount = headingTexts.filter(h => 
          /^[A-Z][a-z]*/.test(h) && !/^[A-Z][a-z]*(\s+[A-Z][a-z]*)*$/.test(h)
        ).length;
        
        // At least 70% should follow the same pattern
        const consistency = Math.max(titleCaseCount, sentenceCaseCount) / headingTexts.length;
        expect(consistency).toBeGreaterThan(0.7);
      }
    });
  });
});

describe('README Content Quality Tests', () => {
  let readmeContent;
  const readmePath = path.join(__dirname, '..', 'README.md');

  beforeAll(() => {
    if (fs.existsSync(readmePath)) {
      readmeContent = fs.readFileSync(readmePath, 'utf8');
    }
  });

  test('should have appropriate length (not too short or excessively long)', () => {
    const wordCount = readmeContent.split(/\s+/).length;
    expect(wordCount).toBeGreaterThan(50); // At least 50 words
    expect(wordCount).toBeLessThan(5000); // Less than 5000 words for readability
  });

  test('should not have obvious typos in common words', () => {
    const commonTypos = [
      /\bteh\b/g,
      /\brecieves?\b/g,
      /\boccured?\b/g,
      /\bseperate/g,
      /\bdefinately/g,
      /\baccomodate/g
    ];
    
    commonTypos.forEach(typo => {
      expect(readmeContent.toLowerCase()).not.toMatch(typo);
    });
  });

  test('should use consistent terminology', () => {
    // Check for consistent usage of terms like "JavaScript" vs "Javascript"
    const jsCount = (readmeContent.match(/JavaScript/g) || []).length;
    const jsLowerCount = (readmeContent.match(/Javascript/g) || []).length;
    
    if (jsCount > 0 && jsLowerCount > 0) {
      // Should predominantly use one form
      const consistency = Math.max(jsCount, jsLowerCount) / (jsCount + jsLowerCount);
      expect(consistency).toBeGreaterThan(0.8);
    }
  });

  test('should have proper punctuation in lists', () => {
    const listItems = readmeContent.match(/^[\s]*[-*+]\s+(.+)$/gm) || [];
    if (listItems.length > 2) {
      const itemsWithPeriods = listItems.filter(item => item.trim().endsWith('.')).length;
      const itemsWithoutPeriods = listItems.filter(item => !item.trim().endsWith('.')).length;
      
      // Should be consistent - either all items end with periods or none do
      expect(Math.min(itemsWithPeriods, itemsWithoutPeriods)).toBe(0);
    }
  });
});

describe('README Edge Cases and Error Conditions', () => {
  test('should handle missing README gracefully in tests', () => {
    const nonexistentPath = path.join(__dirname, '..', 'NONEXISTENT.md');
    expect(fs.existsSync(nonexistentPath)).toBe(false);
  });

  test('should detect malformed markdown elements', () => {
    const testContent = '# Title\n\n[Broken link]()\n\n![Missing alt](image.png)\n\n```\nCode without closing\n';
    
    // Test for empty links
    const emptyLinks = testContent.match(/\[[^\]]*\]\(\)/g) || [];
    expect(emptyLinks.length).toBeGreaterThan(0); // This test content should have empty links
    
    // Test for images without alt text
    const imagesWithoutAlt = testContent.match(/!\[\]\([^)]+\)/g) || [];
    expect(imagesWithoutAlt.length).toBeGreaterThan(0); // This test content should have images without alt
  });

  test('should validate README file permissions', () => {
    const readmePath = path.join(__dirname, '..', 'README.md');
    if (fs.existsSync(readmePath)) {
      const stats = fs.statSync(readmePath);
      expect(stats.isFile()).toBe(true);
      
      // Should be readable
      try {
        fs.accessSync(readmePath, fs.constants.R_OK);
        expect(true).toBe(true); // If we get here, file is readable
      } catch (error) {
        fail('README file should be readable');
      }
    }
  });
});