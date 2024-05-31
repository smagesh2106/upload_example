require("dotenv").config({ path: __dirname + "/.env" });
const http = require("http");
const express = require("express");
const app = express();
const corsOptions = require("./config/corsOptions");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const path = require("path");
const cors = require("cors");
const prisma = require("./lib/prisma").prisma;
const logger = require("./lib/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output.json");
const schedule = require("node-schedule");
const bodyParser = require("body-parser");

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
//app.use(credentials);

// Cross Origin Resource Sharing
//app.use(cors(corsOptions));

logger.log("info", "starting");
// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));
// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

app.use(compression());

//serve static files
app.use("/uploads", express.static("uploads"));
app.use("/", express.static(path.join(__dirname, "/public")));

require("dotenv").config({ path: __dirname + "/.env" });

// routes
app.use("/api/v1", require("./routes"));
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

//disconnect db upon exit.
process.on("exit", () => {
  prisma.$disconnect();
  console.log("process.exit() method is fired, closing db connections");
});

process.on("SIGINT", function () {
  schedule.gracefulShutdown().then(() => process.exit(0));
});

//cron job to reset sequence numbers for project, quote
const job = schedule.scheduleJob(
  { second: 55, minute: 59, hour: 23, date: 31, month: 11 },
  // { hour: 1 }, // for testing
  async function () {
    console.log("Reseting Project/Quote sequence...");

    await prisma.sequence.update({
      where: { projectSequenceKey: "projectSequence" },
      data: { projectValue: 1 },
    });
    await prisma.sequence.update({
      where: { quoteSequenceKey: "quoteSequence" },
      data: { quoteValue: 1 },
    });
  }
);

//cron job to reset sequence numbers for project, quote
const job1 = schedule.scheduleJob(
  { second: 55, minute: 59, hour: 23, date: 31, month: 2 },
  // { hour: 1 }, //for testing.
  async function () {
    try {
      console.log("Reseting Invoice sequence...");
      await prisma.sequence.update({
        where: { invoiceSequenceKey: "invoiceSequence" },
        data: { invoiceValue: 1 },
      });
    } catch (error) {
      console.log(error);
    }
  }
);

app.listen(process.env.APP_PORT, () => {
  console.log(`Server running on port ${process.env.APP_PORT}`);
  console.log(
    `Server is running!\nAPI documentation: http://localhost:${process.env.APP_PORT}/doc`
  );
});
