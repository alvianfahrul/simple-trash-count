import Router from "express";
import { getData } from "@/controllers/getData";
import { helloWorld } from "@/controllers/helloWorld";
import { postPredict } from "@/controllers/predict";
import { upload } from "@/middlewares/multer";

const fs = require("fs");

export const router = Router();

router.get("/predict/histories", getData);
router.get("/", helloWorld);
router.post("/predict", upload.single("image"), postPredict);
router.post("/binary-upload", (req, res) => {
  req.pipe(fs.createWriteStream("./uploads/image" + Date.now() + ".png"));
  console.log(req.body);
  console.log(req.file);
  res.end("OK Isok");
});
router.post("/multipart-upload", upload.single("image"), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.end("OK Isok");
});
