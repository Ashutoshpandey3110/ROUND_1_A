const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

function isPotentialHeading(text) {
  const clean = text.trim();
  if (clean.length < 5 || clean.length > 80) return false;
  if (/^[•*●\-\d]/.test(clean)) return false; // bullets or list indicators
  if (clean.endsWith('.')) return false; // avoid full sentences
  if (!/[A-Za-z]/.test(clean)) return false;
  if (clean.split(/\s+/).length > 12) return false; // avoid paragraphs
  return true;
}

function detectTitleCase(text) {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return false;
  const tcRatio = words.filter(w => /^[A-Z][a-z]/.test(w)).length / words.length;
  return tcRatio > 0.6;
}

function classifyLevel(text) {
  const wc = text.trim().split(/\s+/).length;
  if (wc <= 4 && /^[A-Z\s\-]+$/.test(text)) return 'H1'; // ALL CAPS short
  if (detectTitleCase(text)) return 'H2'; // Title Cased mid-lines
  return 'H3'; // Longer or informal titles
}

function removeSimilarHeadings(headings) {
  const seen = new Set();
  return headings.filter(({ text }) => {
    const norm = text.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });
}

async function extractHeadings(filePath) {
  const buffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  const headings = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const lineMap = {};
    for (const item of content.items) {
      const y = Math.round(item.transform[5]);
      const str = item.str.trim();
      if (!str) continue;
      lineMap[y] = lineMap[y] ? `${lineMap[y]} ${str}` : str;
    }
    const yKeysSorted = Object.keys(lineMap).map(Number).sort((a, b) => b - a);
    const lines = yKeysSorted.map(y => ({ y, text: lineMap[y].trim() }));

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const upperGap = i === 0 ? Infinity : lines[i - 1].y - line.y;
      const lowerGap = i === lines.length - 1 ? Infinity : line.y - lines[i + 1].y;
      if (
        upperGap > 18 &&
        lowerGap > 18 &&
        isPotentialHeading(line.text)
      ) {
        const level = classifyLevel(line.text);
        headings.push({
          level,
          text: line.text,
          page: pageNum - 1
        });
      }
    }
  }
  return removeSimilarHeadings(headings);
}

(async () => {
  const inputDir = path.join(__dirname, 'input');
  const outputDir = path.join(__dirname, 'output');

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.pdf'));

  for (const file of files) {
    const fullPath = path.join(inputDir, file);
    const outline = await extractHeadings(fullPath);

    const result = {
      title: "",
      outline
    };

    const outPath = path.join(outputDir, file.replace(/\.pdf$/i, '.json'));
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`✅ Processed: ${file}`);
  }
})();
