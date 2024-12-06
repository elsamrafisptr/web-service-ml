const ClientError = require("../exceptions/ClientError");

class InputError extends ClientError {
  constructor(message) {
    super(message, 400);
    this.name = "InputError";
  }
}

module.exports = InputError;
