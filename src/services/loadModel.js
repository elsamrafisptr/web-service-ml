const tf = require("@tensorflow/tfjs-node");

async function loadModel() {
  const model = await tf.loadGraphModel(process.env.MODEL_URL);
  console.log("Model Loaded");
  return model;
}

module.exports = loadModel;
