const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
    return async (req, res, next) => {
        try {
            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ message: 'No token, authorization denied' });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Add user from payload
            req.user = decoded;

            // Check role if roles are specified
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({ message: 'Token is not valid' });
        }
    };
};

module.exports = auth; 