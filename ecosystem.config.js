module.exports = {
  apps: [
    {
      name: 'english-server',
      cwd: './server',
      script: 'node',
      args: 'dist/apps/server/main.js',
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
      cwd: './server',
      script: 'node',
      args: 'dist/apps/ai/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'english-minio',
      script: 'minio',
      args: 'server /data/minio --console-address ":9001"',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        MINIO_ROOT_USER: 'admin',
        MINIO_ROOT_PASSWORD: '你的密码'
      }
    }
  ]
};
