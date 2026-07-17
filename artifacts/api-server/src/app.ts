import express, { type Express, Request, Response } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { HealthCheckResponse } from "@workspace/api-zod";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: { id?: string; method?: string; url?: string }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: { statusCode?: number }) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const corsOrigin = process.env["CORS_ORIGIN"]
  ?.split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  /\.github\.dev$/,
];

app.use(
  cors({
    origin: corsOrigin?.length ? corsOrigin : defaultAllowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const healthHandler = (_req: express.Request, res: express.Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
};

app.get("/api/health", healthHandler);
app.get("/api/healthz", healthHandler);
app.use("/api", router);

export default app;
