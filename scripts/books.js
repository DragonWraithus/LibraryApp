"use strict";
// Get page hooks.
const page = {
    shelves: document.querySelector('.shelves'),
    openBookForm: document.querySelector('#new-book'),
    bookForm: document.querySelector('#book-form'),
    saveBook: document.querySelector('#save-book'),
    closeForm: document.querySelector('#close-form'),
};
let screenWidth = page.shelves.children[0].clientWidth;
let booksPerShelf = Math.floor(screenWidth / 180);
// Books to display.
const jsonBooks = "[{\"title\":\"Moby Dick or, the Whale\",\"author\":\"Herman Melville\",\"pageCount\":654,\"read\":false},{\"title\":\"To Kill a Mocking Bird\",\"author\":\"Harper Lee\",\"pageCount\":281,\"read\":true},{\"title\":\"One Flew Over The Cuckoo's Nest\",\"author\":\"Ken Kesey\",\"pageCount\":325,\"read\":false},{\"title\":\"House of the Scorpion\",\"author\":\"Nancy Farmer\",\"pageCount\":380,\"read\":true},{\"title\":\"Things Fall Apart\",\"author\":\"Chinua Achebe\",\"pageCount\":209,\"read\":false},{\"title\":\"Fahrenheit 451\",\"author\":\"Ray Bradbury\",\"pageCount\":194,\"read\":false},{\"title\":\"Clean Code: Agile Handbook\",\"author\":\"Robert C. Martin\",\"pageCount\":462,\"read\":false}]";
let books = JSON.parse(jsonBooks);
if (!!localStorage.books) {
    books = JSON.parse(localStorage.books);
}
function storeBooks() {
    localStorage.setItem('books', JSON.stringify(books));
}
class Book {
    constructor(title, author, pageCount, read) {
        this.title = title;
        this.author = author;
        this.pageCount = pageCount;
        this.read = read;
        this.toggleRead = function () {
            this.read = this.read ? false : true;
        };
    }
}
function addBook(book) {
    books.push(book);
}
function removeBook(index) {
    return books.splice(index, 1)[0];
}
/* View */
// Set books per shelf.
window.onresize = (e) => {
    window.setTimeout(() => { }, 1000);
    screenWidth = page.shelves.children[0].clientWidth;
    booksPerShelf = Math.ceil(screenWidth / 180);
    render();
};
function render() {
    clearShelves();
    // Only seven books to a shelf.
    let shelfCount = Math.ceil(books.length / booksPerShelf);
    for (let shelfNum = 0; shelfNum < shelfCount; shelfNum++) {
        createShelf(shelfNum);
    }
    books.forEach(makeBook);
    storeBooks();
}
function makeBook(book, index) {
    const div = document.createElement('div');
    div.classList.add('book');
    div.setAttribute('data-book-index', String(index));
    const span = document.createElement('span');
    span.textContent = book.title;
    div.append(span);
    let shelfNum = Math.floor(index / booksPerShelf);
    addModBtns(div);
    page.shelves.querySelector('#shelf_' + shelfNum).append(div);
}
// Remove all div shelves and books.
function clearShelves() {
    for (let shelf of page.shelves.children) {
        for (let i = shelf.children.length; i > 0; i--) {
            shelf.children[i - 1].remove();
        }
    }
    for (let shelfNum = page.shelves.children.length; shelfNum > 0; shelfNum--) {
        page.shelves.children[shelfNum - 1].remove();
    }
}
function createShelf(index) {
    const shelf = document.createElement('div');
    shelf.classList.add('shelf');
    shelf.id = ('shelf_' + index);
    page.shelves.append(shelf);
}
function setTextAndClass(obj, text, classList) {
    obj.textContent = text;
    obj.classList.add(classList);
}
// Attatch editing buttons.
function addModBtns(bookDiv) {
    const index = Number(bookDiv.dataset.bookIndex);
    const info = document.createElement('button');
    const remove = document.createElement('button');
    const bookOptions = document.createElement('button');
    setTextAndClass(info, 'i', 'info');
    setTextAndClass(remove, 'x', 'remove-book');
    setTextAndClass(bookOptions, '?', 'book-options');
    [info, remove, bookOptions].forEach((btn) => {
        btn.classList.add('book-button');
    });
    info.addEventListener('click', (e) => {
        toggleNewBookForm();
        fillBookForm(books[index]);
        page.saveBook.setAttribute('value', 'Save');
        page.saveBook.removeEventListener('click', readFormToBook);
        // BUG: if book modifide, but not saved, reopening form changes book.
        const once = { once: true };
        page.saveBook.addEventListener('click', switchBooksAndListeners.bind(null, index), once);
    });
    remove.addEventListener('click', () => {
        removeBook(index);
        render();
    });
    bookOptions.addEventListener('click', () => {
        info.classList.toggle('show-grid');
        remove.classList.toggle('show-grid');
    });
    [info, remove, bookOptions].forEach((bookBtn) => {
        bookDiv.append(bookBtn);
    });
}
function toggleNewBookForm() {
    page.bookForm.classList.toggle('show-grid');
}
/* Controller */
page.openBookForm.addEventListener('click', toggleNewBookForm);
page.closeForm.addEventListener('click', toggleNewBookForm);
page.saveBook.addEventListener('click', readFormToBook);
function fillBookForm(book) {
    let inputs = page.bookForm.querySelectorAll('input');
    inputs[0].value = book.title;
    inputs[1].value = book.author;
    inputs[2].value = String(book.pageCount);
    inputs[book.read ? 3 : 4].checked = true;
}
// TODO: remove listner if changes not saved.
function switchBooksAndListeners(index) {
    readFormToBook();
    page.saveBook.addEventListener('click', readFormToBook);
    page.saveBook.removeEventListener('click', switchBooksAndListeners.bind(null, index));
    // Book swap.
    books[index] = removeBook(books.length - 1);
    page.saveBook.setAttribute('value', 'Add');
    render();
}
function readFormToBook() {
    let inputs = page.bookForm.querySelectorAll('input');
    let newBook = new Book(inputs[0].value, inputs[1].value, inputs[2].valueAsNumber, inputs[3].checked);
    addBook(newBook);
    render();
    toggleNewBookForm();
}
render();
