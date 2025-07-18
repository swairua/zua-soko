const { spawn } = require("child_process");

console.log("Starting API server...");
const child = spawn("node", ["dev-server.js"], {
  stdio: "inherit",
  detached: false,
});

child.on("error", (err) => {
  console.error("Failed to start API server:", err);
});

child.on("close", (code) => {
  console.log(`API server process exited with code ${code}`);
});

// Keep the process running
process.on("SIGINT", () => {
  console.log("Stopping API server...");
  child.kill();
  process.exit();
});
