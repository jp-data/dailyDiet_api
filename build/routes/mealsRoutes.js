"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/mealsRoutes.ts
var mealsRoutes_exports = {};
__export(mealsRoutes_exports, {
  mealsRoutes: () => mealsRoutes
});
module.exports = __toCommonJS(mealsRoutes_exports);

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

// src/routes/mealsRoutes.ts
var import_zod2 = require("zod");

// src/middlewares/check-session-id-exists.ts
async function checkSessionIdExists(request, reply) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  const user = await knex("users").where({ session_id: sessionId }).first();
  if (!user) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  request.user = user;
}

// src/routes/mealsRoutes.ts
var import_node_crypto = require("crypto");
var import_dayjs = __toESM(require("dayjs"));
async function mealsRoutes(app) {
  app.post(
    "/",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req, res) => {
      const insertFeedBodySchema = import_zod2.z.object({
        meal: import_zod2.z.string(),
        description: import_zod2.z.string(),
        dateMeal: import_zod2.z.coerce.date().optional(),
        onDiet: import_zod2.z.boolean()
      });
      const { meal, description, dateMeal, onDiet } = insertFeedBodySchema.parse(req.body);
      let mealDate;
      if (dateMeal) {
        const dateMealFormat = (0, import_dayjs.default)(dateMeal).format();
        mealDate = dateMealFormat;
      } else {
        const now = (0, import_dayjs.default)();
        mealDate = now.format();
      }
      await knex("meals").insert({
        id: (0, import_node_crypto.randomUUID)(),
        meal,
        description,
        meal_date: mealDate,
        on_diet: onDiet,
        user_id: req.user?.id
      });
      return res.status(201).send();
    }
  );
  app.get(
    "/meals/:mealId",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req, res) => {
      const paramsUserValidator = import_zod2.z.object({
        mealId: import_zod2.z.string().uuid()
      });
      const { mealId } = paramsUserValidator.parse(req.params);
      const meal = await knex("meals").where({ id: mealId }).first();
      if (!meal) {
        return res.status(404).send({ error: "Meal not found" });
      }
      return res.send({ meal });
    }
  );
  app.get(
    "/:userId",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req, res) => {
      const userIdValidator = import_zod2.z.object({
        userId: import_zod2.z.string().uuid()
      });
      const { userId } = userIdValidator.parse(req.params);
      const meals = await knex("meals").where({ user_id: userId });
      return res.send({ meals });
    }
  );
  app.put(
    "/update/:mealId",
    {
      preHandler: [checkSessionIdExists]
    },
    async (req, res) => {
      const paramsSchema = import_zod2.z.object({ mealId: import_zod2.z.string().uuid() });
      const { mealId } = paramsSchema.parse(req.params);
      const updateBodySchema = import_zod2.z.object({
        meal: import_zod2.z.string().optional(),
        description: import_zod2.z.string().optional(),
        dateMeal: import_zod2.z.coerce.date().optional(),
        onDiet: import_zod2.z.boolean().optional()
      });
      const { meal, description, dateMeal, onDiet } = updateBodySchema.parse(
        req.body
      );
      let mealDate;
      if (dateMeal) {
        const dateMealFormat = (0, import_dayjs.default)(dateMeal).format();
        mealDate = dateMealFormat;
      } else {
        const now = (0, import_dayjs.default)();
        mealDate = now.format();
      }
      const mealUpdate = await knex("meals").where({ id: mealId }).first();
      if (!mealUpdate) {
        return res.status(404).send({ error: "Meal not exist!" });
      }
      await knex("meals").where({ id: mealId }).update({
        meal,
        description,
        meal_date: mealDate,
        on_diet: onDiet
      });
      return res.status(204).send();
    }
  );
  app.delete(
    "/delete/:mealId",
    { preHandler: [checkSessionIdExists] },
    async (req, res) => {
      const paramsIdSchema = import_zod2.z.object({ mealId: import_zod2.z.string().uuid() });
      const { mealId } = paramsIdSchema.parse(req.params);
      const meal = await knex("meals").where({ id: mealId }).first();
      if (!meal) {
        return res.status(401).send({ error: "Meal not found!" });
      }
      await knex("meals").where({ id: mealId }).delete();
      return res.status(204).send();
    }
  );
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  mealsRoutes
});
