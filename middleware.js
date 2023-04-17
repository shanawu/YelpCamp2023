const Campground = require('./models/camground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
      req.flash('error', 'You must be signed in first!');
      return res.redirect('/login');
  }
  next();
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if(error) {
      const msg = error.details.map(el =>  el.message).join(',')
      console.log(msg);
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

module.exports.isCreator = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.user.equals(req.user._id)) {
    req.flash('error', 'No permission');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el =>  el.message).join(',')
        console.log(msg);
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isReviewCreator = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.user.equals(req.user._id)) {
    req.flash('error', 'No permission');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}