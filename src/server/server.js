require("dotenv").config();
const Hapi = require("@hapi/hapi");
const routes = require("./routes");
const loadModel = require("../services/loadModel");
const InputError = require("../exceptions/InputError");

(async () => {
  try {
    const server = Hapi.server({
      port: process.env.PORT || 3000,
      host: process.env.HOST || "0.0.0.0",
      routes: {
        cors: {
          origin: ["*"],
        },
      },
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext("onPreResponse", (request, h) => {
      const response = request.response;

      if (response instanceof InputError) {
        const errorResponse = h.response({
          status: "fail",
          message: `${response.message} Silakan gunakan foto lain.`,
        });
        errorResponse.code(response.statusCode || 400);
        return errorResponse;
      }

      if (response.isBoom) {
        const errorResponse = h.response({
          status: "fail",
          message: response.message,
        });
        errorResponse.code(response.output.statusCode || 500);
        return errorResponse;
      }

      return h.continue;
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
  } catch (error) {
    console.error("Failed to start the server:", error);
    process.exit(1);
  }
})();
