import { Router } from "express";
import UserAttachController from "../controller/UserAttachController";
const router = Router();

router.get("/", UserAttachController.getUserAttach);
router.post("/", UserAttachController.addUser);
router.get("/:id", UserAttachController.getUserAttachById);
router.put("/:id", UserAttachController.updateUserAttach);
router.delete("/:id", UserAttachController.deleteUserAttach);

export default router;