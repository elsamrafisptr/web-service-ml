const { v4: uuidv4 } = require("uuid");
const predict = require("../services/inferenceService");
const { storePrediction, fetchPredictions } = require("../services/storeData");
const InputError = require("../exceptions/InputError");

const handlePrediction = async (payload) => {
  const { image } = payload;

  if (!image || !image.hapi || image.hapi.filename === "") {
    throw new InputError("File tidak ditemukan", 400);
  }

  if (image._data.length > 1000000) {
    throw new InputError(
      "Payload content length greater than maximum allowed: 1000000",
      413
    );
  }

  const buffer = image._data;
  const inferenceResult = await predict(buffer);

  const response = {
    id: uuidv4(),
    ...inferenceResult,
    createdAt: new Date().toISOString(),
  };

  await storePrediction(response);

  return response;
};

const handleGetHistories = async () => {
  const predictionsSnapshot = await fetchPredictions();
  const predictions = predictionsSnapshot.map((doc) => doc.data());

  if (!predictions || predictions.length === 0) {
    return [];
  }

  return predictions;
};

module.exports = { handlePrediction, handleGetHistories };
