import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { HealthCheckResponse } from "@workspace/api-zod";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
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
