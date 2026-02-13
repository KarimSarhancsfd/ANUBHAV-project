import { Router } from "express";
import GroupRateController from "../controller/GroupRateController";

const router = Router();

router.get("/", GroupRateController.getAll);         
router.get("/:id", GroupRateController.getOne);     
router.post("/", GroupRateController.add);            
router.put("/:id", GroupRateController.update);       
router.delete("/:id", GroupRateController.remove);   

export default router;