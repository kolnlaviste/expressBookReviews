const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userwithsamename = users.filter((user) => {
        return user.username === username;
    });

    if(userwithsamename.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validusers = users.filter((user) =>{
        return user.username === username && user.password === password;
    });

    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        // Use a unique identifier instead of password
        let accessToken = jwt.sign({
            username: username
        }, 'access', { expiresIn: 60 });

        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.post("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewContent = req.query.review;
    const username = req.session.username; // Assuming session contains the username

    // Check if the book exists
    if (books[isbn]) {
        // Access the reviews object for the specific book
        const bookReviews = books[isbn].reviews;

        if (bookReviews[username]) {
            // Modify the existing review
            bookReviews[username] = reviewContent;
            res.status(200).json({ message: "Review updated successfully." });
        } else {
            // Add a new review
            bookReviews[username] = reviewContent;
            res.status(201).json({ message: "Review added successfully." });
        }
    } else {
        res.status(404).json({ message: "Book not found." });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.username; // Assuming session contains the username

    // Check if the book exists
    if (books[isbn]) {
        // Access the reviews object for the specific book
        const bookReviews = books[isbn].reviews;

        if (bookReviews[username]) {
            // Delete the existing review
            delete bookReviews[username];
            res.status(200).json({ message: "Review deleted successfully." });
        } else {
            res.status(404).json({ message: "Review not found or you do not have permission to delete this review." });
        }
    } else {
        res.status(404).json({ message: "Book not found." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
