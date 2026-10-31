const express = require('express');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const publicUsers = express.Router();

publicUsers.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists.' });
  }
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered.' });
});

publicUsers.get('/', (_req, res) => res.json(books));

publicUsers.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book) : res.status(404).json({ message: 'Book not found.' });
});

publicUsers.get('/author/:author', (req, res) => {
  const author = req.params.author.toLocaleLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) =>
    book.author.toLocaleLowerCase() === author));
  return res.json(matches);
});

publicUsers.get('/title/:title', (req, res) => {
  const title = req.params.title.toLocaleLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) =>
    book.title.toLocaleLowerCase().includes(title)));
  return res.json(matches);
});

publicUsers.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found.' });
});

module.exports.general = publicUsers;
