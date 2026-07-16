const { spawn } = require('child_process');
const sharp = require('sharp');

// Create a test image
sharp({
  create: {
    width: 400,
    height: 300,
    channels: 3,
    background: { r: 100, g: 150, b: 200 }
  }
})
.jpeg()
.toFile('/tmp/test_img.jpg')
.then(() => {
  console.log('Created test image');

  const server = spawn('node', ['dist/index.js'], { stdio: ['pipe', 'pipe', 'pipe'] });

  let response = '';
  server.stdout.on('data', (data) => {
    response += data.toString();
    if (response.includes('"id":3')) {
      const lines = response.split('\n');
      for (const line of lines) {
        if (line.includes('"id":3')) {
          const result = JSON.parse(line);
          console.log('Image to PDF Result:');
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
      name: 'toolkit_image_to_pdf',
      arguments: {
        input_paths: ['/tmp/test_img.jpg'],
        output_path: '/tmp/from_image.pdf',
        margin: 36
      }
    }
  }) + '\n');

  setTimeout(() => { server.kill(); process.exit(1); }, 10000);
});
