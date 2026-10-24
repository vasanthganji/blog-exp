
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Check whether the user is logged in
        if (!req.session.userId) {
            return res.redirect('/auth/login');
        }

        // Find the logged-in user in MongoDB
        const user = await User.findById(req.session.userId);

        // If the user no longer exists, clear the session
        if (!user) {
            return req.session.destroy((error) => {
                if (error) {
                    console.error('Session destruction error:', error);
                    return res.status(500).send('Unable to process request');
                }

                res.clearCookie('connect.sid');
                return res.redirect('/auth/login');
            });
        }

        // Make the user available to subsequent middleware/controllers
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).send('Internal Server Error');
    }
};
