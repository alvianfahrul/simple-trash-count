import * as tf from "@tensorflow/tfjs-node";
import { InputError } from "@exceptions/InputError";

interface DetectedBox {
  box: { x1: number; y1: number; x2: number; y2: number };
  score: number;
}

export async function predictClassification(
  model: tf.GraphModel,
  image: Buffer
) {
  try {
    const tensor = tf.node
      .decodeImage(image)
      .resizeBilinear([512, 512])
      .expandDims(0)
      .toInt();

    const predictions = (await model.executeAsync(tensor)) as tf.Tensor[];
    const [classesTensor, boxesTensor, scoresTensor] = predictions;

    const boxes = boxesTensor.arraySync() as number[][][];
    const scores = scoresTensor.arraySync() as number[][];

    const confidenceThreshold = 0.1;

    const detectedBoxes: DetectedBox[] = [];

    boxes[0].forEach((box: number[], i: number) => {
      if (scores[0][i] >= confidenceThreshold) {
        detectedBoxes.push({
          box: {
            x1: box[1],
            y1: box[0],
            x2: box[3],
            y2: box[2],
          },
          score: scores[0][i],
        });
      }
    });

    // console.log("Detected Boxes:", detectedBoxes);

    return { trashCount: detectedBoxes.length, detectedBoxes };
  } catch (error: any) {
    throw new InputError(`Terjadi kesalahan input: ${error.message}`);
  }
}
