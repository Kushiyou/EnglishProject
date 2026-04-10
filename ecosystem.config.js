module.exports = {
  apps: [
    {
      name: 'english-server',
      cwd: '/home/admin/EnglishProject/server',
      script: 'node',
      args: 'dist/apps/server/apps/server/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'english-ai',
      cwd: '/home/admin/EnglishProject/server',
      script: 'node',
      args: 'dist/apps/ai/apps/ai/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    }
  ]
};
