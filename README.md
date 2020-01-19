# WebScraper

App allows you to scrape subreddits, save articles of interest and create notes on saved articles.

[Click here](https://beanstalk66.herokuapp.com/) for an interactive demo.

## Features

- Responsive application
- Toggle between different Subreddits to scrape
- Save and delete articles from scraped articles
- Create, update and delete notes on saved articles
- Mongo database for data storage with Mongoose ODM
- Built using an MVC architecture pattern

## Getting Started

Begin by cloning the [WebScraper](https://github.com/alex0n0/WebScraper) repository and install dependencies:

```terminal
git clone https://github.com/alex0n0/WebScraper.git
npm install
```

Update the database connection on **server.js**:

```javascript
[server.js line 22]
mongoose.connect("your mongo connection here", { useFindAndModify: false });
```

Run the application to see it in action:

```terminal
npm run start
go to http://localhost:5000 in your browser
```

## Built With

Front End

- HTML, CSS, JS

Node Packages

- Express
- Express-handlebars
- Moment
- Mongoose

## License

This project is licensed under the terms of the [MIT](https://github.com/alex0n0/WebScraper/blob/master/LICENSE) license.
