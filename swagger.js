require("dotenv").config({ path: __dirname + "/.env" });
const swaggerAutogen = require("swagger-autogen")();
const PORT = process.env.APP_PORT;
const doc = {
  info: {
    version: "1.0.0",
    title: "USICA API",
    description: "Documentation automatically generated by the <b>swagger-autogen</b> module.",
  },
  host: `localhost:${PORT}`,
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./app.js"];
swaggerAutogen(outputFile, endpointsFiles, doc);
