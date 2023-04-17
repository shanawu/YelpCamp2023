const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/camground');
const Review = require('../models/review');
const wrapAsync = require('../utilities/wrapAsync');
const { validateReview, isLoggedIn, isReviewCreator } = require('../middleware');
const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.campgroundReviews))

router.delete('/:reviewId', isLoggedIn, isReviewCreator, wrapAsync(reviews.deleteReview))

module.exports = router;