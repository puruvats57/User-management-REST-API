const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'secret-key';

// Dummy database of users
let users = [
  { id: 1, username: 'admin', password: '123' },
];

// Create a new user
router.post('/create', (req, res) => {
  const { username, password } = req.body;
  // Check if the username already exists
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  // Generate a hash of the password
  bcrypt.hash(password,10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password' });
    }
    // Add the new user to the database
    users.push({ id: users.length + 1, username, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully' });
  });
});

// Authenticate user using username and password
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Find the user in the database
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Compare the provided password with the stored hash
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error comparing passwords' });
    }
    if (result) {
      // Generate a JSON Web Token (JWT) for authentication
      const token = jwt.sign({ userId: user.id }, SECRET_KEY);
      return res.status(200).json({ message: 'Authentication successful', token });
    } else {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  });
});

// Get all users
router.get('/users', (req, res) => {
  // Return the list of users (excluding passwords)
  const usersWithoutPasswords = users.map((user) => ({
    id: user.id,
    username: user.username,
  }));
  res.json(usersWithoutPasswords);
});


  
  // Update a user
  router.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    const userIndex = users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate a hash of the new password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password' });
      }
      // Update the user's information
      users[userIndex].username = username;
      users[userIndex].password = hashedPassword;
      res.json({ message: 'User updated successfully' });
    });
  });
  
  // Delete a user
  router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove the user from the database
    users.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
  });
  
  // Forgot password (here updating password to temporary password) 
router.post('/forgot-password', (req, res) => {
    const { username } = req.body;
    // Find the user in the database
    const user = users.find((user) => user.username === username);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Generate a temporary password
    const temporaryPassword = Math.random().toString(36).substring(2, 10);
    // Replace the user's password with the temporary password
    bcrypt.hash(temporaryPassword, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: 'Error hashing password' });
      }
      user.password = hashedPassword;
      // Simulate sending an email with the temporary password
      // Here, we i am logging the temporary password to the console
      console.log('Temporary Password:', temporaryPassword);
      res.json({ message: 'Temporary password sent' });
    });
  });
  
  module.exports = router;
  
  
