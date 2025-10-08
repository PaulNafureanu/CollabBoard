import { Router } from "express";

import pkg from "./../../package.json";

export const version = Router();

version.get("/version", (req, res) => {
  res.json({
    name: pkg.name,
    version: pkg.version,
    node: process.version,
  });
});
