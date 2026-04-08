module.exports = {
  apps: [
    {
      name: 'tasks-api',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
