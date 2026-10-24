
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.redirect('/auth/login');
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.redirect('/auth/login');
        }

        req.session.userId = user._id;

        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        res.redirect('/auth/login');
    }
};
