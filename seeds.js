const mongoose         = require("mongoose"),
      Blog             = require("./models/blogs");
      Comment          = require("./models/comments");
      
// static data array to seed database
const data = [
    {
    image: 'https://ncoughlin.com/wp-content/uploads/2020/01/F4BB34AF-6E6F-4203-A1F0-321F9319A962_1_105_c.jpeg',
    title: 'Strange Brazilian Dogs',
    author: 'Carl Sagan',
    date: 2020-03-18,
    short: 'They have an unusual bark, and a fondness for water.',
    content:
   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },{
    image: 'https://ncoughlin.com/wp-content/uploads/2020/01/C3189616-0913-42F9-BE4E-CF41153032D5_1_105_c.jpeg',
    title: 'Piles Of Small Rocks',
    author: 'David Attenborough',
    date: 2020-03-18,
    short: 'People really seem to like these piles of small rocks littered near the ocean.',
    content:
   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },{
    image: 'https://ncoughlin.com/wp-content/uploads/2020/01/A7A76DA3-359B-4918-9020-C7D9BB5F43C2_1_105_c.jpeg',
    title: 'Toys For Adults',
    author: 'Jeremy Clarkson',
    date: 2020-03-18,
    short: 'A wildly unsafe way to enjoy your retirement.',
    content:
   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },{
    image: 'https://ncoughlin.com/wp-content/uploads/2020/01/EC300587-85E0-40F7-B36C-C3B66F6C9373_1_105_c.jpeg',
    title: 'Traditional Juice Sticks',
    author: 'Gordan Ramsey',
    date: 2020-03-18,
    short: 'Piles of sugarcane in a truck.',
    content:
   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },{
    image: 'https://ncoughlin.com/wp-content/uploads/2020/01/3F1A1C75-AC5F-4227-A722-0014D294872D_1_105_c.jpeg',
    title: 'High Stakes Jungle Gym',
    author: 'David Hasselhoff',
    date: 2020-03-18,
    short: 'It\'s a modern style greenhouse for cacti.',
    content:
   'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
    
]

// remove current blog data
function seedDB(){
    Blog.deleteMany({}, function(err){
        if(err){
            console.log(err);
        } else {
            console.log("ALL BLOG DATA DELETED");
             // add seed data
             data.forEach(function(seed){
                Blog.create(seed, function(err, blog){
                    if(err){
                        console.log(err);
                    } else {
                        console.log("BLOG DATA ADDED");
                        // create comment
                        Comment.create(
                            {
                                author: "Duke Ellington",
                                text: "This comment will be the same for every blog. But it's just seed data so who cares."
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else {
                                    blog.comments.push(comment);
                                    blog.save();
                                    console.log("created new comment");
                                }
                            });
                    }
                });
            });
        }
    });
}

// export as module    
module.exports = seedDB;


