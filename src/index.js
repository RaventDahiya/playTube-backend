import dotenv from "dotenv";
import connnectDB from "./db/db_connection.js";
import express from "express";
import { app } from "./aap.js";

dotenv.config({
  path: "./.env",
});

connnectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("server listening on port :" + (process.env.PORT || 8000));
    });
  })
  .catch((error) => {
    console.log("MONGO ERROR: " + error);
  });
