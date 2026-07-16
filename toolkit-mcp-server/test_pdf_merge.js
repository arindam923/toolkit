const { spawn } = require('child_process');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

// Create two simple test PDFs
async function createTestPdfs() {
  const pdf1 = await PDFDocument.create();
  const page1 = pdf1.addPage([200, 200]);
  page1.drawText('Page 1', { x: 50, y: 100, size: 20 });
  fs.writeFileSync('/tmp/test1.pdf', await pdf1.save());

  const pdf2 = await PDFDocument.create();
  const page2 = pdf2.addPage([200, 200]);
  page2.drawText('Page 2', { x: 50, y: 100, size: 20 });
  fs.writeFileSync('/tmp/test2.pdf', await pdf2.save());
  console.log('Created test PDFs');
}

createTestPdfs().then(() => {
  const server = spawn('node', ['dist/index.js'], { stdio: ['pipe', 'pipe', 'pipe'] });

  let response = '';
  server.stdout.on('data', (data) => {
    response += data.toString();
    if (response.includes('"id":3')) {
      const lines = response.split('\n');
      for (const line of lines) {
        if (line.includes('"id":3')) {
          const result = JSON.parse(line);
          console.log('PDF Merge Result:');
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
      name: 'toolkit_pdf_merge',
      arguments: {
        input_paths: ['/tmp/test1.pdf', '/tmp/test2.pdf'],
        output_path: '/tmp/merged.pdf'
      }
    }
  }) + '\n');

  setTimeout(() => { server.kill(); process.exit(1); }, 10000);
});
