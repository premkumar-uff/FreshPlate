import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const mdPath = path.join(projectRoot, 'MINI_PROJECT_TECHNICAL_SPECIFICATION.md');
const htmlPath = path.join(projectRoot, 'MINI_PROJECT_TECHNICAL_SPECIFICATION.html');
const pdfPath = path.join(projectRoot, 'MINI_PROJECT_TECHNICAL_SPECIFICATION.pdf');

console.log('Reading markdown from:', mdPath);
const markdown = fs.readFileSync(mdPath, 'utf8');

// Custom renderer or preprocessing for Front Pages and Math
let processedMd = markdown;

// Replace Mermaid blocks with clean stylized HTML diagrams or mermaid tags
// First let's render standard markdown to HTML
marked.setOptions({
  gfm: true,
  breaks: true,
});

let htmlBody = marked.parse(processedMd);

// Enhance Front Pages:
// Page 1: Title Page
htmlBody = htmlBody.replace(
  /<h2 id="page-1-title-page">PAGE 1: TITLE PAGE<\/h2>[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>/,
  `
  <div class="page title-page">
    <div class="title-border">
      <div class="academic-header">
        <p class="univ-sub">A MINI-PROJECT REPORT ON</p>
        <h1 class="main-project-title">FRESHPLATE: A DATA-DRIVEN SHELF-LIFE PREDICTION AND INTELLIGENT RECIPE RECOMMENDATION SYSTEM FOR HOUSEHOLD FOOD WASTE MITIGATION</h1>
      </div>

      <div class="degree-section">
        <p>Submitted in partial fulfillment of the requirements for the award of the degree of</p>
        <h2 class="degree-title">MASTER OF SCIENCE (M.Sc.)<br><span class="degree-sub">IN</span><br>DATA SCIENCE</h2>
      </div>

      <div class="credentials-grid">
        <div class="cred-box">
          <p class="cred-label">Submitted by:</p>
          <p class="cred-name"><strong>[CANDIDATE NAME]</strong></p>
          <p class="cred-detail">Register No: [REGISTER NUMBER / ROLL NO]</p>
        </div>
        <div class="cred-box">
          <p class="cred-label">Under the Guidance of:</p>
          <p class="cred-name"><strong>[INTERNAL GUIDE NAME]</strong></p>
          <p class="cred-detail">[DESIGNATION / DEPARTMENT]</p>
        </div>
      </div>

      <div class="institution-footer">
        <p class="dept-title">DEPARTMENT OF COMPUTER SCIENCE & DATA ANALYTICS</p>
        <p class="inst-name"><strong>[COLLEGE / INSTITUTION NAME]</strong></p>
        <p class="univ-affil">[AFFILIATED UNIVERSITY NAME]</p>
        <p class="inst-location">[CITY, STATE - PIN]</p>
        <p class="acad-year">OCTOBER 2026</p>
      </div>
    </div>
  </div>
  `
);

// Page 2: Certificate
htmlBody = htmlBody.replace(
  /<h2 id="page-2-certificate">PAGE 2: CERTIFICATE<\/h2>[\s\S]*?<pre><code>([\s\S]*?)<\/code><\/pre>/,
  `
  <div class="page certificate-page">
    <div class="cert-border">
      <div class="cert-header">
        <h2 class="inst-title">[COLLEGE / INSTITUTION NAME]</h2>
        <p class="inst-sub">[AFFILIATED UNIVERSITY NAME, CITY]</p>
        <h3 class="dept-heading">DEPARTMENT OF COMPUTER SCIENCE & DATA ANALYTICS</h3>
        <h1 class="cert-badge">CERTIFICATE</h1>
      </div>

      <div class="cert-body">
        <p>This is to certify that the Mini-Project technical specification entitled:</p>
        <p class="cert-project-title">"FRESHPLATE: A DATA-DRIVEN SHELF-LIFE PREDICTION AND INTELLIGENT RECIPE RECOMMENDATION SYSTEM FOR HOUSEHOLD FOOD WASTE MITIGATION"</p>
        <p>is a bonafide record of independent project work carried out by:</p>
        <p class="cert-student"><strong>[CANDIDATE NAME]</strong> (Reg. No: <strong>[REGISTER NUMBER]</strong>)</p>
        <p>in partial fulfillment of the requirements for the award of the degree of <strong>Master of Science (M.Sc.) in Data Science</strong> of [University Name] during the academic year 2025–2026.</p>
      </div>

      <div class="cert-signatures">
        <div class="sig-block">
          <div class="sig-line"></div>
          <p><strong>Internal Guide</strong></p>
          <p>[Name & Designation]</p>
          <p>Department of Data Science</p>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <p><strong>Head of the Department</strong></p>
          <p>[Name & Designation]</p>
          <p>Department of Data Science</p>
        </div>
      </div>

      <div class="viva-section">
        <p>Submitted for the Mini-Project Viva-Voce Examination held on: <span class="viva-date">___________________</span></p>
      </div>

      <div class="examiner-signatures">
        <div class="sig-block">
          <div class="sig-line"></div>
          <p><strong>Internal Examiner</strong></p>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <p><strong>External Examiner</strong></p>
        </div>
      </div>
    </div>
  </div>
  `
);

// Wrap front pages and chapters with page breaks
htmlBody = htmlBody.replace(/<h2 id="page-3-acknowledgement">PAGE 3: ACKNOWLEDGEMENT<\/h2>/, '<div class="page-break"></div><h2 class="front-heading" id="page-3-acknowledgement">ACKNOWLEDGEMENT</h2>');
htmlBody = htmlBody.replace(/<h2 id="page-4-contents">PAGE 4: CONTENTS<\/h2>/, '<div class="page-break"></div><h2 class="front-heading" id="page-4-contents">TABLE OF CONTENTS</h2>');
htmlBody = htmlBody.replace(/<h2 id="page-5-abstract">PAGE 5: ABSTRACT<\/h2>/, '<div class="page-break"></div><h2 class="front-heading" id="page-5-abstract">ABSTRACT</h2>');
htmlBody = htmlBody.replace(/<h2 id="page-6-list-of-figures-tables-and-screens">PAGE 6: LIST OF FIGURES, TABLES, AND SCREENS<\/h2>/, '<div class="page-break"></div><h2 class="front-heading" id="page-6-list-of-figures-tables-and-screens">LIST OF FIGURES, TABLES, AND SCREENS</h2>');

// Add page breaks before main numbered chapters
htmlBody = htmlBody.replace(/<h1 id="10-synopsis--project-overview">1.0 SYNOPSIS \/ PROJECT OVERVIEW<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="10-synopsis--project-overview">CHAPTER 1.0: SYNOPSIS / PROJECT OVERVIEW</h1>');
htmlBody = htmlBody.replace(/<h1 id="20-system--project-specification">2.0 SYSTEM \/ PROJECT SPECIFICATION<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="20-system--project-specification">CHAPTER 2.0: SYSTEM / PROJECT SPECIFICATION</h1>');
htmlBody = htmlBody.replace(/<h1 id="30-data-understanding">3.0 DATA UNDERSTANDING<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="30-data-understanding">CHAPTER 3.0: DATA UNDERSTANDING</h1>');
htmlBody = htmlBody.replace(/<h1 id="40-data-preparation">4.0 DATA PREPARATION<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="40-data-preparation">CHAPTER 4.0: DATA PREPARATION</h1>');
htmlBody = htmlBody.replace(/<h1 id="50-system-design-and-development">5.0 SYSTEM DESIGN AND DEVELOPMENT<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="50-system-design-and-development">CHAPTER 5.0: SYSTEM DESIGN AND DEVELOPMENT</h1>');
htmlBody = htmlBody.replace(/<h1 id="60-evaluation">6.0 EVALUATION<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="60-evaluation">CHAPTER 6.0: EVALUATION</h1>');
htmlBody = htmlBody.replace(/<h1 id="70-visualization--insights">7.0 VISUALIZATION &amp; INSIGHTS<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="70-visualization--insights">CHAPTER 7.0: VISUALIZATION & INSIGHTS</h1>');
htmlBody = htmlBody.replace(/<h1 id="80-conclusion--future-work">8.0 CONCLUSION &amp; FUTURE WORK<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="80-conclusion--future-work">CHAPTER 8.0: CONCLUSION & FUTURE WORK</h1>');
htmlBody = htmlBody.replace(/<h1 id="90-bibliography">9.0 BIBLIOGRAPHY<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="90-bibliography">CHAPTER 9.0: BIBLIOGRAPHY</h1>');
htmlBody = htmlBody.replace(/<h1 id="100-appendices">10.0 APPENDICES<\/h1>/, '<div class="page-break"></div><h1 class="chapter-title" id="100-appendices">CHAPTER 10.0: APPENDICES</h1>');

// Format Mermaid blocks into styled visual boxes for print
htmlBody = htmlBody.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
  return `<div class="diagram-card"><div class="diagram-badge">SYSTEM ARCHITECTURE / DATA FLOW DIAGRAM</div><pre class="mermaid-code">${code}</pre></div>`;
});

// Format math symbols nicely
htmlBody = htmlBody.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block"><code>$1</code></div>');
htmlBody = htmlBody.replace(/\$([^\$\n]+?)\$/g, '<span class="math-inline"><code>$1</code></span>');

const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>M.Sc. Data Science Mini-Project - FreshPlate</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 18mm 20mm 18mm;
    }

    @media print {
      body {
        font-size: 11pt;
        line-height: 1.5;
        color: #111827;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
        height: 0;
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      a {
        text-decoration: none;
        color: #111827;
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      h1, h2, h3, h4 {
        page-break-after: avoid;
      }
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 11.5pt;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      margin: 0 auto;
      max-width: 900px;
      padding: 24px;
    }

    /* Page Breaks */
    .page-break {
      page-break-after: always;
      break-after: page;
      margin-top: 30px;
      margin-bottom: 30px;
      border-top: 1px dashed #cbd5e1;
    }

    @media print {
      .page-break {
        border-top: none;
      }
    }

    /* Front Pages Styling */
    .title-page, .certificate-page {
      min-height: 980px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      padding: 10px;
    }

    .title-border, .cert-border {
      border: 3px double #1e3a8a;
      padding: 36px 28px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .univ-sub {
      font-size: 12pt;
      letter-spacing: 2px;
      color: #4b5563;
      margin-bottom: 12px;
      font-weight: bold;
    }

    .main-project-title {
      font-size: 18pt;
      font-weight: 900;
      line-height: 1.35;
      color: #0f172a;
      margin: 16px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .degree-section {
      margin: 28px 0;
    }

    .degree-section p {
      font-size: 11pt;
      font-style: italic;
      color: #374151;
      margin-bottom: 6px;
    }

    .degree-title {
      font-size: 15pt;
      font-weight: bold;
      color: #1e3a8a;
      letter-spacing: 1px;
    }

    .degree-sub {
      font-size: 11pt;
      font-weight: normal;
    }

    .credentials-grid {
      display: flex;
      justify-content: space-between;
      margin: 30px 10px;
      text-align: left;
    }

    .cred-box {
      width: 46%;
      border-top: 2px solid #e2e8f0;
      padding-top: 12px;
    }

    .cred-label {
      font-size: 10.5pt;
      font-style: italic;
      color: #64748b;
      margin-bottom: 4px;
    }

    .cred-name {
      font-size: 12pt;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .cred-detail {
      font-size: 10.5pt;
      color: #334155;
    }

    .institution-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 18px;
      margin-top: 20px;
    }

    .dept-title {
      font-size: 12pt;
      font-weight: bold;
      color: #1e3a8a;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .inst-name {
      font-size: 13pt;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .univ-affil, .inst-location {
      font-size: 10.5pt;
      color: #475569;
      margin: 2px 0;
    }

    .acad-year {
      font-size: 11pt;
      font-weight: bold;
      color: #1e293b;
      margin-top: 10px;
    }

    /* Certificate */
    .cert-badge {
      font-size: 18pt;
      letter-spacing: 4px;
      color: #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      display: inline-block;
      padding-bottom: 4px;
      margin: 16px 0;
    }

    .cert-body {
      font-size: 11.5pt;
      text-align: justify;
      line-height: 1.8;
      margin: 24px 10px;
    }

    .cert-project-title {
      font-size: 12pt;
      font-weight: bold;
      text-align: center;
      margin: 12px 0;
      color: #0f172a;
    }

    .cert-student {
      font-size: 12pt;
      text-align: center;
      margin: 10px 0;
    }

    .cert-signatures, .examiner-signatures {
      display: flex;
      justify-content: space-between;
      margin: 32px 10px 10px 10px;
    }

    .sig-block {
      width: 42%;
      text-align: center;
    }

    .sig-line {
      border-bottom: 1.5px solid #334155;
      margin-bottom: 8px;
      height: 40px;
    }

    .viva-section {
      text-align: center;
      margin: 24px 0 10px 0;
      font-size: 11pt;
    }

    /* Typography */
    h1.chapter-title {
      font-size: 15pt;
      font-weight: bold;
      color: #1e3a8a;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 16px;
      text-transform: uppercase;
    }

    h2.front-heading {
      font-size: 14pt;
      font-weight: bold;
      color: #1e3a8a;
      text-align: center;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 6px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    h2 {
      font-size: 13pt;
      font-weight: bold;
      color: #1e293b;
      margin-top: 20px;
      margin-bottom: 8px;
    }

    h3 {
      font-size: 11.5pt;
      font-weight: bold;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    p {
      margin-top: 0;
      margin-bottom: 12px;
      text-align: justify;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 20px 0;
      font-size: 10.5pt;
    }

    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: bold;
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
    }

    td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Code Blocks */
    pre {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 12px;
      font-family: "Courier New", Courier, monospace;
      font-size: 9.5pt;
      line-height: 1.4;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      margin: 12px 0;
    }

    code {
      font-family: "Courier New", Courier, monospace;
      font-size: 10pt;
      background-color: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
    }

    pre code {
      background: none;
      padding: 0;
    }

    /* Math & Diagrams */
    .math-block {
      background-color: #f8fafc;
      border-left: 3px solid #1e3a8a;
      padding: 8px 14px;
      margin: 12px 0;
      font-family: "Courier New", Courier, monospace;
      font-size: 10.5pt;
    }

    .math-inline {
      font-family: "Courier New", Courier, monospace;
      font-size: 10.5pt;
      font-weight: bold;
      color: #1e3a8a;
    }

    .diagram-card {
      border: 1.5px solid #cbd5e1;
      border-radius: 6px;
      padding: 14px;
      background: #f8fafc;
      margin: 16px 0;
    }

    .diagram-badge {
      font-size: 9pt;
      font-weight: bold;
      letter-spacing: 1px;
      color: #1e3a8a;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .mermaid-code {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      padding: 10px;
      font-size: 9pt;
      color: #334155;
    }

    blockquote {
      border-left: 3px solid #94a3b8;
      padding-left: 14px;
      margin-left: 0;
      color: #475569;
      font-style: italic;
    }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

fs.writeFileSync(htmlPath, completeHtml, 'utf8');
console.log('Generated clean printable HTML at:', htmlPath);

// Execute Edge headless to print to PDF using execFileSync
import { execFileSync } from 'child_process';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

console.log('Running Edge headless print-to-pdf...');
execFileSync(edgePath, [
  '--headless',
  '--disable-gpu',
  `--print-to-pdf=${pdfPath}`,
  '--no-pdf-header-footer',
  htmlPath
], { stdio: 'inherit' });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`\n SUCCESS! PDF created successfully at: ${pdfPath}`);
  console.log(` File Size: ${(stats.size / 1024).toFixed(1)} KB`);
} else {
  console.error('\n Error: PDF generation failed.');
}
