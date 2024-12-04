const Hapi = require('@hapi/hapi');
const multer = require('multer');
const tf = require('@tensorflow/tfjs-node');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ limits: { fileSize: 1000000 } });

const firestore = new Firestore();

const storage = new Storage();
const BUCKET_NAME = 'model-storage-elsamrafisptr'; 
const MODEL_PATH = 'model.json';
let model;

async function loadModel() {
    const [modelFile] = await storage.bucket(BUCKET_NAME).file(MODEL_PATH).download();
    const buffer = Buffer.from(modelFile);
    model = await tf.loadGraphModel(tf.io.browserFiles([new File([buffer], 'model.json')]));
    console.log('Model loaded successfully.');
}

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
    });

    server.route({
        method: 'POST',
        path: '/predict',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                multipart: true,
                allow: 'multipart/form-data',
            },
        },
        handler: async (request, h) => {
            try {
                const { image } = request.payload;

                if (!image || !image.hapi || image.hapi.filename === '') {
                    return h.response({
                        status: 'fail',
                        message: 'File tidak ditemukan',
                    }).code(400);
                }

                if (image._data.length > 1000000) {
                    return h.response({
                        status: 'fail',
                        message: 'Payload content length greater than maximum allowed: 1000000',
                    }).code(413);
                }

                const buffer = image._data;
                const decodedImage = tf.node.decodeImage(buffer, 3);
                const resizedImage = tf.image.resizeBilinear(decodedImage, [224, 224]).expandDims(0);
                const prediction = await model.predict(resizedImage).data();
                const result = prediction[0] > 0.5 ? 'Cancer' : 'Non-cancer';

                const response = {
                    id: uuidv4(),
                    result,
                    suggestion: result === 'Cancer' ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.',
                    createdAt: new Date().toISOString(),
                };

                await firestore.collection('predictions').doc(response.id).set(response);

                return h.response({
                    status: 'success',
                    message: 'Model is predicted successfully',
                    data: response,
                }).code(200);
            } catch (error) {
                console.error(error);
                return h.response({
                    status: 'fail',
                    message: 'Terjadi kesalahan dalam melakukan prediksi',
                }).code(400);
            }
        },
    });

    await loadModel();
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();
