import { Router } from "express";
import UserController from "../controller/UserController";
import { addUserRequest } from "../request/UserRequest";
import requestValidator from "../middleware/RequestValidate";

const router = Router();

router.get("/", UserController.getUser);
router.post("/login", UserController.loginUser);
router.get("/:id", UserController.getUserById);
router.post("/", requestValidator(addUserRequest), UserController.addUser);
router.delete("/:id", UserController.deleteUser);
router.put("/:id", UserController.updateUser);

export default router;
