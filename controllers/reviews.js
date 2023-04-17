const Campground = require('../models/camground');
const Review = require('../models/review');

module.exports.campgroundReviews = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const { body, rating } = req.body;
    const review = new Review({ body, rating});
    review.user = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully posted a review');
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findOneAndUpdate(id, { $pull: { reviews: reviewId }})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted a review');
    res.redirect(`/campgrounds/${id}`)
}
