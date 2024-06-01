"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/usersRoutes.ts
var usersRoutes_exports = {};
__export(usersRoutes_exports, {
  userRoutes: () => userRoutes
});
module.exports = __toCommonJS(usersRoutes_exports);

// src/database.ts
var import_knex = require("knex");

// src/env/index.ts
var import_config = require("dotenv/config");
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("production"),
  DATABASE_URL: import_zod.z.string(),
  PORT: import_zod.z.number().default(3333)
});
var _env = envSchema.safeParse(process.env);
if (_env.success === false) {
  console.error("Invalid environment variables", _env.error.format());
  throw new Error("Invalid environment variables");
}
var env = _env.data;

// src/database.ts
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL env not found!");
}
var config = {
  client: "sqlite",
  connection: {
    filename: env.DATABASE_URL
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations"
  }
};
var knex = (0, import_knex.knex)(config);

// src/routes/usersRoutes.ts
var import_crypto = require("crypto");
var import_zod2 = require("zod");
async function userRoutes(app) {
  app.post("/", async (req, res) => {
    const createUserBodySchema = import_zod2.z.object({
      email: import_zod2.z.string().email(),
      name: import_zod2.z.string()
    });
    let sessionId = req.cookies.sessionId;
    if (!sessionId) {
      sessionId = (0, import_crypto.randomUUID)();
      res.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30
      });
    }
    const { email, name } = createUserBodySchema.parse(req.body);
    const userByEmail = await knex("users").where({ email }).first();
    if (userByEmail) {
      return res.status(400).send({ message: "User already exists" });
    }
    await knex("users").insert({
      id: (0, import_crypto.randomUUID)(),
      name,
      email,
      session_id: sessionId
    });
    return res.status(201).send();
  });
  app.get("/", async () => {
    const users = await knex("users").select("*");
    return users;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userRoutes
});
