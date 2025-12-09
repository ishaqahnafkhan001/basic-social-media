const mongoose = require('mongoose');
const Joi = require('joi');

const tourCategories = [
    "Relaxing","Romantic","Adventure","Solo Travel","Family Friendly",
    "Beach / Coastal","Mountain / Hill Station","City Break / Urban",
    "Cultural / Historical","Wildlife / Safari","Spiritual / Pilgrimage",
    "Party / Nightlife","Foodie / Culinary","Luxury","Budget / Backpacking",
    "Eco / Sustainable","Off-the-Beaten-Path","Extreme Sports","Wellness / Yoga",
    "Water Sports","Road Trip","Photography","Desert","Island","Forest / Jungle",
    "Rural / Village","Educational","Group / Friends","Pet-Friendly","Women Only",
    "All-Inclusive","Honeymoon","Camping","Trekking / Hiking","Cruise / Boat"
];

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },

    content: {
        type: String,
        required: true,
        minlength: 10
    },

    category: {
        type: String,
        enum: tourCategories,
        required: true
    },

    country: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },

    image: {
        type: String,    // Cloudinary URL / local path
        default: null    // optional
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    tags: {
        type: [String],
        default: []
    }
}, { timestamps: true });


// AUTO-GENERATE SLUG
postSchema.pre("save", function () {
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
    }
});


// JOI VALIDATION
const validatePost = (data) => {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        content: Joi.string().min(10).required(),
        country: Joi.string().min(2).required(),
        category: Joi.string().valid(...tourCategories).required(),
        tags: Joi.array().items(Joi.string()),
        image: Joi.string().uri().allow(null, "")    // optional
    });

    return schema.validate(data);
};

const Post = mongoose.model("Post", postSchema);

module.exports = { Post, validatePost, tourCategories };
