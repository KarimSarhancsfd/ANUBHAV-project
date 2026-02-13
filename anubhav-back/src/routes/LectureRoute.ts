import express from "express";
import { Router } from "express";
import LectureController from "../controller/LectureController";
import requestValidator from "../middleware/RequestValidate";
import { LectureRequest } from "../request/LectureRequest";

const router = Router();

router.get("/", LectureController.getAllLecture);

router.get("/:id", LectureController.getLectureById);

router.post(
  "/",
  requestValidator(LectureRequest),
  LectureController.createLecture
);

router.put(
  "/:id",
  requestValidator(LectureRequest),
  LectureController.updateLecture
);

router.delete("/:id", LectureController.deleteLecture);

export default router;
