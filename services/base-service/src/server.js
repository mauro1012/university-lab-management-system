require("dotenv").config();
const app = require("./app");

const requiredEnvs = ["DATABASE_URL", "JWT_SECRET"];

requiredEnvs.forEach((env) => {
  if (!process.env[env]) {
    console.error(` Missing env var: ${env}`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Base-service running on port ${PORT}`);
});
