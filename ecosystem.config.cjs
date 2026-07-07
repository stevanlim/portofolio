module.exports = {
  apps: [
    {
      name: 'stevan-lim-portfolio',
      script: './server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5575
      }
    }
  ]
};
