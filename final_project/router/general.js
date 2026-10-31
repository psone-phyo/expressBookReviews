const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');
const publicUsers = express.Router();
const booksApiUrl = `http://127.0.0.1:${process.env.PORT || 5000}/api/books`;

// Data endpoint used by the public Axios based lookup routes.
publicUsers.get('/api/books', (_req, res) => res.json(books));

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

publicUsers.get('/', async (_req, res) => {
  try {
    const response = await axios.get(booksApiUrl);
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.', error: error.message });
  }
});

publicUsers.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(booksApiUrl);
    const book = response.data[req.params.isbn];
    return book ? res.json(book) : res.status(404).json({ message: 'Book not found.' });
  } catch (error) {
    return res.status(404).json({ message: 'Book not found.', error: error.message });
  }
});

publicUsers.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(booksApiUrl);
    const author = req.params.author.toLocaleLowerCase();
    const matches = Object.fromEntries(Object.entries(response.data).filter(([, book]) =>
      book.author.toLocaleLowerCase() === author));
    return Object.keys(matches).length ? res.json(matches) : res.status(404).json({ message: 'No books found for author.' });
  } catch (error) {
    return res.status(404).json({ message: 'Unable to retrieve books by author.', error: error.message });
  }
});

publicUsers.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(booksApiUrl);
    const title = req.params.title.toLocaleLowerCase();
    const matches = Object.fromEntries(Object.entries(response.data).filter(([, book]) =>
      book.title.toLocaleLowerCase().includes(title)));
    return Object.keys(matches).length ? res.json(matches) : res.status(404).json({ message: 'No books found for title.' });
  } catch (error) {
    return res.status(404).json({ message: 'Unable to retrieve books by title.', error: error.message });
  }
});

publicUsers.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found.' });
});

module.exports.general = publicUsers;
