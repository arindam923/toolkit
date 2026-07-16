const { spawn } = require('child_process');
const sharp = require('sharp');

// Create a test PNG image
sharp({
  create: {
    width: 200,
    height: 200,
    channels: 3,
    background: { r: 255, g: 100, b: 50 }
  }
})
.png()
.toFile('/tmp/test_convert.png')
.then(() => {
  console.log('Created test PNG');

  const server = spawn('node', ['dist/index.js'], { stdio: ['pipe', 'pipe', 'pipe'] });

  let response = '';
  server.stdout.on('data', (data) => {
    response += data.toString();
    if (response.includes('"id":3')) {
      const lines = response.split('\n');
      for (const line of lines) {
        if (line.includes('"id":3')) {
          const result = JSON.parse(line);
          console.log('File Convert Result:');
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
      name: 'toolkit_file_convert',
      arguments: {
        input_paths: ['/tmp/test_convert.png'],
        output_format: 'webp',
        output_dir: '/tmp/converted',
        quality: 85
      }
    }
  }) + '\n');

  setTimeout(() => { server.kill(); process.exit(1); }, 10000);
});
