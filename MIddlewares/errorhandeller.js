const express = require("express");
const app = express();
exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500||err.status).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? null : err.message,
  });
}