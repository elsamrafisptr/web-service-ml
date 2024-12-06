const tf = require("@tensorflow/tfjs-node");

const predict = async (imageBuffer) => {
  const decodedImage = tf.node.decodeImage(imageBuffer, 3);
  const resizedImage = tf.image
    .resizeBilinear(decodedImage, [224, 224])
    .expandDims(0);
  const model = await require("./loadModel")();
  const prediction = await model.predict(resizedImage).data();
  const result = prediction[0] > 0.5 ? "Cancer" : "Non-cancer";

  return {
    result,
    suggestion:
      result === "Cancer"
        ? "Segera periksa ke dokter!"
        : "Penyakit kanker tidak terdeteksi.",
  };
};

module.exports = predict;
