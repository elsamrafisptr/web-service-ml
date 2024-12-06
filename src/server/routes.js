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
        const result = await handlePrediction(request.payload);
        return h
          .response({
            status: "success",
            message: "Model is predicted successfully",
            data: result,
          })
          .code(201);
      } catch (error) {
        const statusCode = error instanceof InputError ? error.statusCode : 400;
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
        return h
          .response({
            status: "fail",
            message: "Terjadi kesalahan dalam mengambil data",
          })
          .code(400);
      }
    },
  },
];
