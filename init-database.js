// Simple database initialization script
fetch('/api/admin/init-database', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => {
  console.log('Database initialization result:', data);
})
.catch(error => {
  console.error('Database initialization error:', error);
});
