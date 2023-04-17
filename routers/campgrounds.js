const express = require('express');
const router = express.Router();
const { isLoggedIn, validateCampground, isCreator } = require('../middleware');
const wrapAsync = require('../utilities/wrapAsync');
const campgrounds = require('../controllers/campgrounds');

const multer  = require('multer');
const { storage } = require('../cloudinary'); // it will automatically look for the index.js file
const upload = multer({ storage });

router.route('/')
    .get(wrapAsync(campgrounds.allCampgrounds))
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgrounds.createCampground))


router.get('/new', isLoggedIn, campgrounds.newCampground);

router.route('/:id')
    .get(wrapAsync(campgrounds.campgroundDetails))
    .put(isLoggedIn, isCreator, upload.array('image'), validateCampground, wrapAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isCreator, wrapAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isLoggedIn, isCreator, wrapAsync(campgrounds.editCampgroundPage));

module.exports = router;