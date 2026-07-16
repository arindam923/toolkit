#!/usr/bin/env node
/**
 * Evaluation suite for toolkit-mcp-server
 * 
 * Tests all 20 tools end-to-end by creating test images/PDFs,
 * calling each tool, and verifying the output.
 */

import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

const TEST_DIR = '/tmp/toolkit-eval';
const RESULTS = [];

// Setup
mkdirSync(TEST_DIR, { recursive: true });

function log(msg) {
  console.error(`[eval] ${msg}`);
}

function fileExists(path) {
  return existsSync(path);
}

function fileSize(path) {
  return statSync(path).size;
}

async function createTestImage(filename, width = 400, height = 300, color = { r: 100, g: 150, b: 200 }) {
  await sharp({
    create: { width, height, channels: 3, background: color }
  }).jpeg().toFile(join(TEST_DIR, filename));
}

async function createTestPdf(filename, pageCount = 3) {
  const pdf = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = pdf.addPage([200, 200]);
    page.drawText(`Page ${i + 1}`, { x: 50, y: 100, size: 20 });
  }
  writeFileSync(join(TEST_DIR, filename), await pdf.save());
}

async function runToolCall(toolName, args) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['dist/index.js'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let response = '';
    
    server.stdout.on('data', (data) => {
      response += data.toString();
      if (response.includes('"id":3')) {
        const lines = response.split('\n');
        for (const line of lines) {
          if (line.includes('"id":3')) {
            try {
              const result = JSON.parse(line);
              server.kill();
              resolve(result.result);
            } catch (e) {
              server.kill();
              reject(e);
            }
            return;
          }
        }
      }
    });
    
    server.stderr.on('data', () => {});
    
    server.stdin.write(JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'eval', version: '1.0' } }
    }) + '\n');
    
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    
    server.stdin.write(JSON.stringify({
      jsonrpc: '2.0', id: 3, method: 'tools/call',
      params: { name: toolName, arguments: args }
    }) + '\n');
    
    setTimeout(() => {
      server.kill();
      reject(new Error(`Timeout for ${toolName}`));
    }, 30000);
  });
}

async function testTool(name, fn) {
  try {
    await fn();
    RESULTS.push({ name, status: 'PASS' });
    log(`✓ ${name}`);
  } catch (error) {
    RESULTS.push({ name, status: 'FAIL', error: error.message });
    log(`✗ ${name}: ${error.message}`);
  }
}

async function main() {
  log('Starting evaluation suite...');
  
  // Create test fixtures
  await createTestImage('test.jpg', 400, 300);
  await createTestImage('test2.jpg', 200, 200, { r: 255, g: 100, b: 50 });
  await createTestImage('test.png', 300, 300, { r: 50, g: 200, b: 100 });
  await createTestPdf('test.pdf', 5);
  await createTestPdf('test2.pdf', 2);
  
  // Phase 1: Image tools
  await testTool('toolkit_ping', async () => {
    const result = await runToolCall('toolkit_ping', {});
    if (!result.content[0].text.includes('pong')) throw new Error('No pong');
  });
  
  await testTool('toolkit_image_resize', async () => {
    const out = join(TEST_DIR, 'resized.jpg');
    const result = await runToolCall('toolkit_image_resize', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      width: 200
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_image_compress', async () => {
    const out = join(TEST_DIR, 'compressed.webp');
    const result = await runToolCall('toolkit_image_compress', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      quality: 80
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_image_convert', async () => {
    const out = join(TEST_DIR, 'converted.png');
    const result = await runToolCall('toolkit_image_convert', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      format: 'png'
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_image_crop', async () => {
    const out = join(TEST_DIR, 'cropped.jpg');
    const result = await runToolCall('toolkit_image_crop', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      width: 100,
      height: 100
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_image_rotate', async () => {
    const out = join(TEST_DIR, 'rotated.jpg');
    const result = await runToolCall('toolkit_image_rotate', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      degrees: 90
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_image_filter', async () => {
    const out = join(TEST_DIR, 'filtered.jpg');
    const result = await runToolCall('toolkit_image_filter', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      brightness: 120
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  // Phase 2: Advanced image tools
  await testTool('toolkit_image_effects', async () => {
    const out = join(TEST_DIR, 'effects.jpg');
    const result = await runToolCall('toolkit_image_effects', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      preset: 'sepia'
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_image_watermark', async () => {
    const out = join(TEST_DIR, 'watermark.jpg');
    const result = await runToolCall('toolkit_image_watermark', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      text: '© Test'
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_image_extract_colors', async () => {
    const result = await runToolCall('toolkit_image_extract_colors', {
      input_path: join(TEST_DIR, 'test.jpg'),
      count: 3
    });
    if (!result.structuredContent.colors || result.structuredContent.colors.length !== 3) {
      throw new Error('Expected 3 colors');
    }
  });
  
  await testTool('toolkit_image_upscale', async () => {
    const out = join(TEST_DIR, 'upscaled.jpg');
    const result = await runToolCall('toolkit_image_upscale', {
      input_path: join(TEST_DIR, 'test.jpg'),
      output_path: out,
      scale: '2x'
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  // Phase 3: PDF tools
  await testTool('toolkit_pdf_merge', async () => {
    const out = join(TEST_DIR, 'merged.pdf');
    const result = await runToolCall('toolkit_pdf_merge', {
      input_paths: [join(TEST_DIR, 'test.pdf'), join(TEST_DIR, 'test2.pdf')],
      output_path: out
    });
    if (!fileExists(out)) throw new Error('Output not created');
    if (result.structuredContent.total_pages !== 7) throw new Error('Expected 7 pages');
  });
  
  await testTool('toolkit_pdf_split', async () => {
    const out = join(TEST_DIR, 'split.pdf');
    const result = await runToolCall('toolkit_pdf_split', {
      input_path: join(TEST_DIR, 'test.pdf'),
      output_path: out,
      pages: '1-2'
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_pdf_compress', async () => {
    const out = join(TEST_DIR, 'compressed.pdf');
    const result = await runToolCall('toolkit_pdf_compress', {
      input_path: join(TEST_DIR, 'test.pdf'),
      output_path: out,
      quality: 75
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_pdf_ocr', async () => {
    const result = await runToolCall('toolkit_pdf_ocr', {
      input_path: join(TEST_DIR, 'test.pdf'),
      pages: '1-2'
    });
    if (!result.structuredContent.extracted_text) throw new Error('No text extracted');
  });
  
  await testTool('toolkit_pdf_to_image', async () => {
    const out = join(TEST_DIR, 'page.png');
    const result = await runToolCall('toolkit_pdf_to_image', {
      input_path: join(TEST_DIR, 'test.pdf'),
      output_path: out,
      format: 'png',
      pages: '1'
    });
    if (!fileExists(join(TEST_DIR, 'page_page_1.png'))) throw new Error('Output not created');
  });
  
  await testTool('toolkit_image_to_pdf', async () => {
    const out = join(TEST_DIR, 'from_images.pdf');
    const result = await runToolCall('toolkit_image_to_pdf', {
      input_paths: [join(TEST_DIR, 'test.jpg'), join(TEST_DIR, 'test2.jpg')],
      output_path: out
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_pdf_redact', async () => {
    const out = join(TEST_DIR, 'redacted.pdf');
    const result = await runToolCall('toolkit_pdf_redact', {
      input_path: join(TEST_DIR, 'test.pdf'),
      output_path: out,
      regions: [{ page: 1, x: 50, y: 50, width: 100, height: 30 }]
    });
    if (!fileExists(out)) throw new Error('Output not created');
  });
  
  await testTool('toolkit_file_convert', async () => {
    const outDir = join(TEST_DIR, 'converted');
    mkdirSync(outDir, { recursive: true });
    const result = await runToolCall('toolkit_file_convert', {
      input_paths: [join(TEST_DIR, 'test.jpg')],
      output_format: 'webp',
      output_dir: outDir,
      quality: 85
    });
    if (!fileExists(join(outDir, 'test.webp'))) throw new Error('Output not created');
  });
  
  // Summary
  log('\n========================================');
  log('EVALUATION RESULTS');
  log('========================================');
  const passed = RESULTS.filter(r => r.status === 'PASS').length;
  const failed = RESULTS.filter(r => r.status === 'FAIL').length;
  log(`Total: ${RESULTS.length} | Passed: ${passed} | Failed: ${failed}`);
  log('========================================\n');
  
  if (failed > 0) {
    log('Failed tests:');
    RESULTS.filter(r => r.status === 'FAIL').forEach(r => {
      log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  }
  
  log('All tests passed!');
  process.exit(0);
}

main().catch(error => {
  log(`Fatal error: ${error.message}`);
  process.exit(1);
});
