const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

async function getBooks() {
    try {
        const response = await axios.get('https://roward18-5001.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai'); // Replace with your actual API endpoint
        const books = response.data;
        console.log(books);
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

async function getBookByISBN(isbn) {
    try {
        const response = await axios.get(`https://roward18-5001.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/books/${isbn}`);
        const bookDetails = response.data;
        // console.log(bookDetails); // Comment out or remove this line
        return bookDetails;
    } catch (error) {
        console.error('Error fetching book details:', error);
    }
}


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(400).json({ message: "User already exists!" });
        }
    }

    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books ,null ,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; 
    const book = books[isbn]; 

    if (book) {
        res.json(book); 
    } else {
        res.status(404).send('Book not found'); 
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = [];

    // Assuming 'books' is an object, use Object.values to get an array of book objects
    for (let book of Object.values(books)) {
        if (book.author === author) {
            booksByAuthor.push(book);
        }
    }

    if (booksByAuthor.length > 0) {
        res.json(booksByAuthor);
    } else {
        res.status(404).send('No books found by this author');
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const bookByTitle = [];

  for(let book of Object.values(books)){
    if(book.title === title){
        bookByTitle.push(book);
    }
  }

  if(bookByTitle.length > 0) {
    res.json(bookByTitle);
  } else {
    res.status(404).send("No book found by this title.");
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; 
    const bookReviews = books[isbn]?.reviews; 

    if (bookReviews) {
        res.json(bookReviews); 
    } else {
        res.status(404).json({ message: "Book reviews not found for the given ISBN." });
    }
});

getBooks();
getBookByISBN('1'); 
module.exports.general = public_users;
