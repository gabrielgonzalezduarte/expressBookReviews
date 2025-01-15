const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });

  return res
    .status(201)
    .json({ message: "User created successfully", data: { users } });
});

// Get the book list available in the shop
public_users.get("/books", async function (req, res) {
  try {
    const booksList = await new Promise((resolve, reject) => {
      // Mimicking some delay, like a database call
      setTimeout(() => {
        resolve(books); // Resolving with the books data
      }, 1000); // Simulating a delay of 1 second
    });
    return res.status(200).json({ message: "Success", books });
  } catch (error) {
    console.log(error);
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  })
    .then((book) => {
      return res.status(200).json({ message: "Success", data: book });
    })
    .catch((error) => {
      return res.status(404).json({ message: "Book not found" });
    });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;
  if (!author) {
    return res.status(400).json({ message: "Author is required" });
  }
  const filteredBooks = Object.entries(books).filter(([isbn, book]) =>
    book.author.toLowerCase().includes(author.toLowerCase())
  );
  if (filteredBooks.length > 0) {
    const formattedBooks = filteredBooks.map(([isbn, book]) => ({
      isbn: parseInt(isbn), // Ensure isbn is a number
      author: book.author,
      title: book.title,
      reviews: book.reviews,
    }));
    return res.status(200).json({
      message: "Success",
      booksbyauthor: formattedBooks,
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  const filteredBooks = Object.entries(books).filter(([isbn, book]) =>
    book.title.toLowerCase().includes(title.toLowerCase())
  );

  if (filteredBooks.length > 0) {
    const formattedBooks = Object.values(filteredBooks).map(([isbn, book]) => ({
      isbn: isbn,
      author: book.author,
      title: book.title,
      reviews: book.reviews,
    }));
    return res.status(200).json({
      message: "Success",
      booksbytitle: formattedBooks,
    });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (book) {
    return res.status(200).json({ booksreviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
// Get user details based on username
public_users.get("/users/:username", function (req, res) {
  const { username } = req.params;
  const user = users.find((user) => user.username === username);
  if (user) {
    return res.status(200).json({ message: "Success", usersbyusername: user });
  } else {
    return res.status(404).json({ message: "User not found" });
  }
});

public_users.get("/", function (req, res) {
  // Convert the list of books to a JSON string for a clean output
  const booksList = JSON.stringify(books);

  res.status(200).send(booksList);
});

module.exports.general = public_users;
