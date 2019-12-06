const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
    articleCategory: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    href: { type: String, required: true },
    notes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Note'
        }
    ]
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;