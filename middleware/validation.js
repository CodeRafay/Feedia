const { validationResult } = require('express-validator');

// Strip Mongo operator/dotted keys ($ne, $where, __proto__, "a.b") in place, so no
// user-supplied object can turn a query value into a query operator.
const stripOperatorKeys = (value, depth = 0) => {
    if (depth > 10 || value === null || typeof value !== 'object') {
        return;
    }
    for (const key of Object.keys(value)) {
        if (key.startsWith('$') || key.includes('.') || key === '__proto__') {
            delete value[key];
            continue;
        }
        stripOperatorKeys(value[key], depth + 1);
    }
};

// req.query is a getter in Express 4, so mutate in place rather than reassigning.
const sanitizeRequest = (req, res, next) => {
    stripOperatorKeys(req.body);
    stripOperatorKeys(req.query);
    stripOperatorKeys(req.params);
    return next();
};

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    return next();
};

module.exports = {
    handleValidation,
    sanitizeRequest
};
