module.exports = {
  apps: [{
    name: "itpm",
    script: "./index.js",
    instances : "max",
    exec_mode : "cluster",
     max_memory_restart: '300M',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}