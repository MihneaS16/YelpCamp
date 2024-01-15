const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const imageSchema = new Schema({
    url: String,
    filename: String
});

// I use a virtual because I don't need to store this on the model itself or in the database, because it's just derived from the information I am already storing (the url)
imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

campgroundSchema.post('findOneAndDelete', async function (document) { // this is a query middleware
    // I have access to the campground that has just been deleted (which was passed as document)
    if (document) {
        await Review.deleteMany({ // here I am deleting all the reviews that have the id in the reviews array of the document that has just been deleted
            _id: {
                $in: document.reviews
            }
        })
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);