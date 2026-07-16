const { spawn } = require('child_process');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

// Create a 5-page test PDF
async function createTestPdf() {
  const pdf = await PDFDocument.create();
  for (let i = 1; i <= 5; i++) {
    const page = pdf.addPage([200, 200]);
    page.drawText(`Page ${i}`, { x: 50, y: 100, size: 20 });
  }
  fs.writeFileSync('/tmp/test_5pages.pdf', await pdf.save());
  console.log('Created 5-page test PDF');
}

createTestPdf().then(() => {
  const server = spawn('node', ['dist/index.js'], { stdio: ['pipe', 'pipe', 'pipe'] });

  let response = '';
  server.stdout.on('data', (data) => {
    response += data.toString();
    if (response.includes('"id":3')) {
      const lines = response.split('\n');
      for (const line of lines) {
        if (line.includes('"id":3')) {
          const result = JSON.parse(line);
          console.log('PDF Split Result:');
          console.log(JSON.stringify(result.result, null, 2));
          server.kill();
          process.exit(0);
        }
      }
    }
  });

  server.stderr.on('data', () => {});

  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0', id: 1, method: 'initialize',
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } }
  }) + '\n');

  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0', id: 3, method: 'tools/call',
    params: {
      name: 'toolkit_pdf_split',
      arguments: {
        input_path: '/tmp/test_5pages.pdf',
        output_path: '/tmp/split.pdf',
        pages: '1-3,5'
      }
    }
  }) + '\n');

  setTimeout(() => { server.kill(); process.exit(1); }, 10000);
});
