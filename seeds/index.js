const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('Mongo Connection Open');
    })
    .catch(err => {
        console.log('Mongo Connection ERROR!');
        console.log(e);
    });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});


const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 250) + 10;
        const camp = new Campground({
            author: '65845c7d6d0c406477876c03',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: 'https://source.unsplash.com/collection/483251',
            images: [
                {
                    url: 'https://res.cloudinary.com/dtuznbt5n/image/upload/v1703514314/YelpCamp/ri066rticwxi08egqce9.jpg',
                    filename: 'YelpCamp/ri066rticwxi08egqce9',
                },
                {
                    url: 'https://res.cloudinary.com/dtuznbt5n/image/upload/v1703514314/YelpCamp/ube1lxwk477anzccyd7d.jpg',
                    filename: 'YelpCamp/ube1lxwk477anzccyd7d',
                }
            ],
            description: 'Discover the perfect escape at our tranquil campground, where nature meets comfort. Surrounded by picturesque landscapes, our spacious campsites cater to tent campers and RV enthusiasts alike. Immerse yourself in the great outdoors, whether hiking scenic trails, enjoying communal campfires, or simply relishing the serenity of your natural surroundings. Welcome to a haven for outdoor enthusiasts, where adventure and relaxation converge.',
            price: price
        });
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    });