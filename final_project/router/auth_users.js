const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regdUsers = express.Router();

const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'bookstore-development-secret';

const isValid = (username) => users.some((user) => user.username === username);
const authenticatedUser = (username, password) =>
  users.some((user) => user.username === username && user.password === password);

regdUsers.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }
  const accessToken = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
  req.session.authorization = { accessToken, username };
  return res.json({ message: 'Login successful.', username, accessToken });
});

regdUsers.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  const review = typeof req.body?.review === 'string' ? req.body.review.trim() : '';
  if (!review) return res.status(400).json({ message: 'A non-empty review is required.' });
  const username = req.auth.username;
  // Keying by username makes concurrent updates from different users independent.
  book.reviews[username] = review;
  return res.json({ message: 'Review added or updated successfully.', reviews: book.reviews });
});

regdUsers.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found.' });
  const username = req.auth.username;
  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: 'Review not found.' });
  }
  delete book.reviews[username];
  return res.json({ message: 'Review deleted successfully.', reviews: book.reviews });
});

module.exports.authenticated = regdUsers;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
