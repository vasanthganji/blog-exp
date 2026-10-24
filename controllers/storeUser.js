
const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        await User.create(req.body);
        res.redirect('/');
    } catch (error) {
        console.error('Registration error:', error);
        res.redirect('/auth/register');
    }
};
