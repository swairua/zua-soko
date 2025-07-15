module.exports = {
  apps: [
    {
      name: "zuasoko-backend",
      script: "backend/src/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5001,
      },
      log_file: "logs/backend.log",
      out_file: "logs/backend-out.log",
      error_file: "logs/backend-error.log",
      time: true,
      watch: false,
      ignore_watch: ["node_modules", "logs", "frontend"],
      max_memory_restart: "1G",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
