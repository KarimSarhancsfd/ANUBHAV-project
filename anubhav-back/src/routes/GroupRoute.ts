import { Router } from "express";
import GroupController from "../controller/GroupController";

const router = Router();

router.get("/", GroupController.getGroup);
router.get("/:id", GroupController.getGroupById);
router.post("/", GroupController.addGroup);
router.put("/:id", GroupController.updateGroup);
router.delete("/:id", GroupController.deleteGroup);

export default router;