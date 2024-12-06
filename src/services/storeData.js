const { Firestore } = require("@google-cloud/firestore");
const firestore = new Firestore();

const storePrediction = async (data) => {
  await firestore.collection("predictions").doc(data.id).set(data);
};

const fetchPredictions = async () => {
  try {
    const predictionsSnapshot = await firestore.collection("predictions").get();
    return predictionsSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    throw new Error("Failed to fetch predictions from Firestore");
  }
};

module.exports = { storePrediction, fetchPredictions };
