const { server } = require("./app");

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 MindMetric Backend Server`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=================================");
});
