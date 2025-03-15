import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { predictClassification } from "@services/inferenceService";
import { LoadModel } from "@services/loadModel";
import { storeFirestore } from "@/services/storeFirestore";
import { uploadGCS } from "@/services/uploadGCS";

export async function postPredict(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { sungai, deskripsi, lokasi, latitude, longitude } = req.body;

  if (!sungai || !deskripsi || !lokasi || !latitude || !longitude) {
    return res.status(400).json({
      status: "error",
      message:
        "All parameters (sungai, deskripsi, lokasi, latitude, longitude) are required.",
    });
  }

  const loadModel = new LoadModel();
  const model = await loadModel.loadModel();

  if (!model) {
    return res.status(500).json({
      status: "error",
      message: "Model not loaded yet.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "No image provided.",
    });
  }

  try {
    const image = req.file.buffer;

    // const publicUrl = await uploadGCS(req.file);

    const { trashCount } = await predictClassification(
      model,
      image
    );

    const id = crypto.randomUUID();

    const createdAt = new Date().toISOString();

    const data = {
      id,
      sungai,
      deskripsi,
      lokasi,
      trashCount,
      createdAt,
      fileUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmQ2m2MAwkE4IGfw9wvl4DH9pk0OPpEhzY9Q&s",
      coordinates: {
        latitude,
        longitude,
      },
    };

    // await storeFirestore(id, data);

    return res.status(201).json({
      status: "success",
      message: "Model is predicted successfully.",
      data,
    });
  } catch (error: any) {
    return next(error);
  }
}