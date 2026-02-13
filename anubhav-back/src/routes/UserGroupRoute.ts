import { Router } from "express";
import UserGroupController from "../controller/UserGroupController";
import requestValidator from "../middleware/RequestValidate";
import { addUserGroupRequest } from "../request/UserGroupRequest";

const router = Router();

router.get("/", UserGroupController.getUserGroup);
router.post("/", requestValidator(addUserGroupRequest), UserGroupController.addUserGroup);
router.put("/:id",  UserGroupController.updateUserGroup ) ; 
router.delete("/:id" , UserGroupController.deleteUserGroup) ;

export default router;