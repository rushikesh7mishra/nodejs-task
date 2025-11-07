const Joi = require('joi');

function validate(schemaObj = {}) {
  return (req, res, next) => {
    try {
      const toValidate = {};
      const errors = [];

      if (schemaObj.params) {
        const { error, value } = schemaObj.params.validate(req.params, { abortEarly: false, stripUnknown: true });
        if (error) errors.push({ location: 'params', details: error.details });
        else req.params = value;
      }
      if (schemaObj.query) {
        const { error, value } = schemaObj.query.validate(req.query, { abortEarly: false, stripUnknown: true });
        if (error) errors.push({ location: 'query', details: error.details });
        else req.query = value;
      }
      if (schemaObj.body) {
        const { error, value } = schemaObj.body.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) errors.push({ location: 'body', details: error.details });
        else req.body = value;
      }

      if (errors.length) {
        const message = errors.map(e =>
          e.details.map(d => `${e.location}.${d.path.join('.')} : ${d.message}`).join('; ')
        ).join(' | ');
        return res.status(400).json({ message: 'Validation error', details: message });
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = validate;
