const mongoose = require('mongoose');
const Joi = require('joi');

// Keeping your countries list (shortened here for readability, but use your full list)
const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina",
    "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
    "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
    "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
    "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo",
    "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
    "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
    "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
    "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica",
    "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
    "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria",
    "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama",
    "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
    "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
    "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
    "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const tourCategories = [
    "Relaxing", "Romantic", "Adventure", "Solo Travel", "Family Friendly",
    "Beach / Coastal", "Mountain / Hill Station", "City Break / Urban",
    "Cultural / Historical", "Wildlife / Safari", "Spiritual / Pilgrimage",
    "Party / Nightlife", "Foodie / Culinary", "Luxury", "Budget / Backpacking",
    "Eco / Sustainable", "Off-the-Beaten-Path", "Extreme Sports", "Wellness / Yoga",
    "Water Sports", "Road Trip", "Photography", "Desert", "Island", "Forest / Jungle",
    "Rural / Village", "Educational", "Group / Friends", "Pet-Friendly", "Women Only",
    "All-Inclusive", "Honeymoon", "Camping", "Trekking / Hiking", "Cruise / Boat"
];

// --- Tour Subschema ---
const tourSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 100
    },
    category: {
        type: String,
        required: true,
        enum: tourCategories, // (Ensure you import this variable)
        trim: true
    },
    destinationCountry: {
        type: String,
        enum: countries, // (Ensure you import this variable)
        required: true
    },
    destinationCity: {
        type: String,
        required: true,
        trim: true
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) { return v && v.length >= 2; },
            message: 'A tour must have at least 2 images.'
        }
    },
    coverImage: {
        type: String,
        required: true
    },

    // --- NEW RATING FIELDS ---
    // We store the average here so we can sort by "Top Rated" easily
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        // This setter rounds the rating (e.g., 4.66666 -> 4.7)
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    pricePerPerson: { type: Number, required: true, min: 0 },
    maxGroupSize: { type: Number, required: true, min: 1 },
    description: { type: String, required: true, trim: true, minlength: 50 },

    itinerary: [
        {
            day: { type: Number, required: true },
            title: { type: String, required: true },
            description: { type: String }
        }
    ],
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Extreme'],
        default: 'Medium'
    },
    isActive: { type: Boolean, default: true },
    agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true,
    // --- VIRTUAL CONFIGURATION ---
    // This ensures that when we convert to JSON/Object, the virtual 'reviews' show up
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// --- VIRTUAL POPULATE ---
// This allows you to do Tour.populate('reviews') to see the comments
// without actually storing an array of reviews in the Tour database.
tourSchema.virtual('reviews', {
    ref: 'Review',          // The name of the Model to look for (defined below)
    foreignField: 'tour',   // The field in the Review model that matches
    localField: '_id'       // The field in the Tour model that matches
});

const Tour = mongoose.model('Tour', tourSchema);

// --- UPDATED JOI VALIDATION ---
function validateTour(tour, isUpdate = false) {
    let startDateSchema = Joi.date().required();
    if (!isUpdate) {
        startDateSchema = startDateSchema.greater('now');
    }

    const schema = Joi.object({
        title: Joi.string().min(10).max(100).required().trim(),
        // category: Joi.string().valid(...tourCategories).required(),
        // destinationCountry: Joi.string().valid(...countries).required(),
        category: Joi.string().required(), // Simplified for snippet
        destinationCountry: Joi.string().required(), // Simplified for snippet
        destinationCity: Joi.string().required().trim(),

        images: Joi.array().items(Joi.string().uri()).min(2).required(),
        coverImage: Joi.string().uri().required(),
        startDate: startDateSchema,
        endDate: Joi.date().greater(Joi.ref('startDate')).required(),
        pricePerPerson: Joi.number().min(0).required(),
        maxGroupSize: Joi.number().min(1).integer().required(),
        description: Joi.string().min(50).required(),

        itinerary: Joi.array().items(Joi.object({
            day: Joi.number().required(),
            title: Joi.string().required(),
            description: Joi.string().allow('')
        })).optional(),

        inclusions: Joi.array().items(Joi.string()).optional(),
        exclusions: Joi.array().items(Joi.string()).optional(),
        difficulty: Joi.string().valid('Easy', 'Medium', 'Hard', 'Extreme'),
        isActive: Joi.boolean(),
        agency: Joi.string().required()

        // Note: We DO NOT validate ratingsAverage here.
        // Users cannot set the rating manually; it is calculated by the backend.
    });

    return schema.validate(tour, { allowUnknown: true });
}

module.exports = { Tour, validateTour };