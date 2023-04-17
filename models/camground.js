const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const opts = { toJSON: { virtuals: true } };

const imageSchema = new Schema ({
        url: String,
        filename: String
})

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
})

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String }}`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

campgroundSchema.virtual('properties.popupText').get(function(){
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.location}</p>
    <p>${this.description.substring(0,30)}...</p>`;
})

campgroundSchema.post('findOneAndDelete', async function(campground) {
    if(campground.reviews.length) {
        const res = await Review.deleteMany({ _id: { $in: campground.reviews }})
    }
})

module.exports = mongoose.model('Campground', campgroundSchema);