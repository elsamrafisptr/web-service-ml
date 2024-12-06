const { handlePrediction, handleGetHistories } = require("./handler");
const InputError = require("../exceptions/InputError");

module.exports = [
  {
    method: "POST",
    path: "/predict",
    options: {
      payload: {
        output: "stream",
        parse: true,
        multipart: true,
        allow: "multipart/form-data",
      },
    },
    handler: async (request, h) => {
      try {
        const { image } = request.payload;

        // Validate payload early
        if (!image || !image.hapi || image.hapi.filename === "") {
          throw new InputError("File tidak ditemukan", 400);
        }

        if (image._data.length > 1000000) {
          throw new InputError(
            "Payload content length greater than maximum allowed: 1000000",
            413
          );
        }

        const result = await handlePrediction(request.payload);
        return h
          .response({
            status: "success",
            message: "Model is predicted successfully",
            data: result,
          })
          .code(201);
      } catch (error) {
        const statusCode = error.statusCode || 400;
        const message =
          error instanceof InputError
            ? error.message
            : "Terjadi kesalahan dalam melakukan prediksi";

        return h.response({ status: "fail", message }).code(statusCode);
      }
    },
  },
  {
    method: "GET",
    path: "/getHistories",
    handler: async (_, h) => {
      try {
        const result = await handleGetHistories();

        return h
          .response({
            status: "success",
            data: result,
          })
          .code(200);
      } catch (error) {
        console.error("Error fetching histories:", error);
        return h
          .response({
            status: "fail",
            message: "Terjadi kesalahan dalam mengambil data",
          })
          .code(500);
      }
    },
  },
];
