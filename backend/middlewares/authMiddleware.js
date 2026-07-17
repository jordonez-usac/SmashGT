const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {

        return res.status(401).json({ msg: 'Necesitas un token, permiso denegado' });

    }

    const token = authHeader.split(' ')[1];
    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded; 
        next();
        
    } catch (error) {
        res.status(401).json({ msg: 'El token no es válido o ha expirado' });
    }
};

module.exports = authMiddleware;