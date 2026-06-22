import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import chatPersistenceRouter from "./chatPersistence";
import adminRouter from "./admin";
import pdfRouter from "./pdf";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(chatPersistenceRouter);
router.use(adminRouter);
router.use(pdfRouter);

export default router;
