const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Zuasoko Development Servers...\n');

// Start backend server on port 3000
console.log('📡 Starting backend server on port 3000...');
const backend = spawn('node', ['server.js'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  shell: true
});

backend.on('error', (error) => {
  console.error('❌ Backend server error:', error);
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('🎨 Starting frontend dev server on port 5173...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (error) => {
    console.error('❌ Frontend server error:', error);
  });

  // Handle cleanup
  const cleanup = () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

}, 2000);

console.log('\n📋 Development URLs:');
console.log('   Frontend: http://localhost:5173');
console.log('   Backend:  http://localhost:3000');
console.log('   API Proxy: http://localhost:5173/api -> http://localhost:3000/api');
console.log('\n💡 Press Ctrl+C to stop both servers\n');
