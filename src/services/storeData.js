const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();

const storePrediction = async (data) => {
  await firestore.collection("predictions").doc(data.id).set(data);
};

const fetchPredictions = async () => {
  const predictions = await firestore.collection("predictions").get();
  return predictions.docs.map((doc) => doc.data());
};

module.exports = { storePrediction, fetchPredictions };
