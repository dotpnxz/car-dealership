const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
require('dotenv').config(); // Load environment variables from .env file (if you have one)

const app = express();

// 1. Generate a strong secret key (if you haven't already)
//    It's best to do this once and store it in an environment variable.
//    Uncomment the following lines to generate a new key and then
//    comment them out again after you've saved the key.
// const newSecretKey = crypto.randomBytes(32).toString('hex');
// console.log('Generated Secret Key:', newSecretKey);
// // Store this 'newSecretKey' in your .env file as SESSION_SECRET or similar.

// 2. Use the secret key from the environment variable
const sessionSecret = process.env.SESSION_SECRET;

// Check if the secret key is defined
if (!sessionSecret) {
  console.error('Error: SESSION_SECRET environment variable not set!');
  process.exit(1); // Exit the application if the secret is missing
}

// Configure session middleware
app.use(session({
  secret: sessionSecret, // Use the secret key from the environment variable
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000, // One day in milliseconds (24 * 60 * 60 * 1000)
    httpOnly: true,    // Helps protect against client-side script access
    secure: app.get('env') === 'production', // Ensure secure cookies in production (HTTPS)
    sameSite: 'lax'     // Recommended for security against CSRF attacks
  },
  // Optional: Configure session store (e.g., for production use)
  // store: new FileStore(), // Example using a file-based store (for development/testing)
  // store: new RedisStore({ client: redisClient }), // Example using Redis
  // store: new MongoStore({ mongoUrl: 'mongodb://...' }), // Example using MongoDB
}));

// Middleware to make session data available in templates (optional)
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Your routes and other middleware will go here...
app.get('/', (req, res) => {
  res.send('Welcome!');
});

app.get('/login', (req, res) => {
  req.session.userId = 123; // Example: Set a user ID in the session upon login
  res.send('Logged in!');
});

app.get('/profile', (req, res) => {
  if (req.session.userId) {
    res.send(`Profile page for user ID: ${req.session.userId}`);
  } else {
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.send('Error logging out.');
    } else {
      res.redirect('/');
    }
  });
});

// Example of accessing session data
app.get('/check-session', (req, res) => {
  if (req.session.userId) {
    res.send(`User ID in session: ${req.session.userId}`);
  } else {
    res.send('No user logged in.');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});