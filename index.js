
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const { default: MongoStore } = require('connect-mongo');
const fileUpload = require('express-fileupload');
const flash = require('connect-flash');

const validateMiddleware = require('./middleware/validationMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./middleware/redirectIfAuthenticatedMiddleware');

const app = express();
const PORT = process.env.PORT || 4000;

// View engine
app.set('view engine', 'ejs');

// Static files and request parsing
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// File uploads
app.use(fileUpload());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-only-change-this-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
}),
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Flash messages must come after session middleware
app.use(flash());

// Make login status available to all EJS templates
app.use((req, res, next) => {
    res.locals.loggedIn = req.session.userId || null;
    next();
});

// Validation middleware
app.use('/posts/store', validateMiddleware);

// Controllers
const newPostController = require('./controllers/newPost');
const homeController = require('./controllers/home');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const newUserController = require('./controllers/newUser');
const storeUserController = require('./controllers/storeUser');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require('./controllers/logout');

// Routes
app.get('/', homeController);
app.get('/post/:id', getPostController);

app.get('/posts/new', authMiddleware, newPostController);
app.post('/posts/store', authMiddleware, storePostController);

app.get(
    '/auth/register',
    redirectIfAuthenticatedMiddleware,
    newUserController
);
app.post(
    '/users/register',
    redirectIfAuthenticatedMiddleware,
    storeUserController
);

app.get(
    '/auth/login',
    redirectIfAuthenticatedMiddleware,
    loginController
);
app.post(
    '/users/login',
    redirectIfAuthenticatedMiddleware,
    loginUserController
);

app.get('/auth/logout', logoutController);

// 404 handler
app.use((req, res) => {
    res.status(404).render('notfound');
});

// Connect to MongoDB before starting the server

async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Atlas connected successfully');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`App listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start application:', error.message);
        process.exit(1);
    }
}

startServer();
