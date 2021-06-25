module.exports = {
  apps: [{
    name: "itpm",
    script: "./index.js",
//    instances : 2,
//    exec_mode : "cluster",
    autorestart: false,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}