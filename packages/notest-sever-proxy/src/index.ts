import { serveUsingProxy } from "./proxy.api";
import { createServer } from "http";

require("dotenv").config();

const allowCors = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Request-Method", "*");
  res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }
};

const server = createServer((req, res) => {
  serveUsingProxy(
    req,
    res,
    process.env.FRONTEND_URL + "/proxy?url=",
    process.env.FRONTEND_URL
  );
});

server.listen(2550, "0.0.0.0", () => {
  console.log("Server listening on port 2550");
});
