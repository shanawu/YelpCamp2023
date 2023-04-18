const Campground = require('../models/camground');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require('../cloudinary');


module.exports.allCampgrounds = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/main', { campgrounds })
}

module.exports.newCampground = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    if (!req.body.title || !req.body.location || !req.body.price || !req.body.description) throw new ExpressError('Missing Data Input', 400);
    const campground = new Campground(req.body);
    campground.user = req.user._id;
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    req.flash('success', 'Successfully created a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.campgroundDetails = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'user'
        }
    }).populate('user');
    if (!campground) {
        req.flash('error', 'Campground not exist');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/details', { campground })
}

module.exports.editCampgroundPage = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Campground not exist');
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.editCampground = async (req, res, next) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, { runValidator: true, new: true });
    const addImages = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.images.push(...addImages); // ... to take the array elements out and add them into another array
    if (req.body.location) {
        const geoData = await geoCoder.forwardGeocode({
            query: req.body.location,
            limit: 1
        }).send()
        campground.geometry = geoData.body.features[0].geometry;
    }
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'Successfully updated a campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

// module.exports.deleteCampground = async (req, res, next) => {
//     const { id } = req.params;
//     await Campground.findByIdAndDelete(id);
//     req.flash('success', 'Successfully deleted a campground');
//     res.redirect('/campgrounds')
// }

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    for (let image of campground.images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    await campground.remove();
    req.flash('success', 'Successfully deleted a campground');
    res.redirect('/campgrounds')
}
