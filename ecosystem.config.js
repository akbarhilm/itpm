module.exports = {
  apps: [{
    name: "itpm",
    script: "/itpm-app/index.js",
    instances : 2,
    exec_mode : "cluster",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}