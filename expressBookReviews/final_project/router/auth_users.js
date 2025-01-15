const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const fs = require("fs");
const path = require("path");

let users = [
  { username: "user1", password: "pass1" },
  { username: "user2", password: "pass2" },
];

const isValid = (username) => {
  return users.findIndex((user) => user.username === username) !== -1;
};

const authenticatedUser = (username, password) => {
  if (!isValid(username)) {
    return false;
  }
  return (
    users.findIndex(
      (user) => user.username === username && user.password === password
    ) !== -1
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: "User not found" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Wrong password" });
  }
  const accessToken = jwt.sign(
    { username },
    "ljbP1rDQuy67uh9cadWnxuqhq68ENAI0",
    { expiresIn: "24h" }
  );
  req.session.authorization = { accessToken };

  return res.json({ message: "Login successful", accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.user.username;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  books[isbn].reviews[username] = review;
  const booksPath = path.join(__dirname, "booksdb.js"); // Ensure correct path
  fs.writeFile(
    booksPath,
    `module.exports = ${JSON.stringify(books, null, 2)};`,
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to update the books data" });
      }

      return res.status(200).json({
        message: `Review added successfully in book with isbn: ${isbn}`,
      });
    }
  );
});

// Delete a book review added by a particular user
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username;

  if (!isbn) {
    return res.status(400).json({ message: "ISBN is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Deletes the review for the current user
  delete books[isbn].reviews[username];
  const booksPath = path.join(__dirname, "booksdb.js"); // Ensure correct path
  fs.writeFile(
    booksPath,
    `module.exports = ${JSON.stringify(books, null, 2)};`,
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to update the books data" });
      }

      return res.status(200).json({ message: "Review deleted successfully" });
    }
  );
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
