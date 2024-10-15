const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require("../models/userSchema");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken,refreshToken,profile,done) => {
        try {
            // Check if the user already exists in your database
            let existingUser = await User.findOne({googleId:profile.id});
            if(existingUser){
                // If the user exists, return the user object
                return done(null,existingUser)
            }else{
                // If the user doesn't exist, create a new user
                const newUser = new User({
                   googleId:profile.id,
                   displayName:profile.displayName,
                   email:profile.emails[0].value,
                   termsAccepted: true,
                   phone:undefined
                });

                await newUser.save();
                return done(null,newUser)
            }


        } catch (error) {
            return done(error,false)
        }
    }
  )
);

// Serialize and deserialize user (this is required for session management of google users)

passport.serializeUser((user,done)=>{
    done(null,user.id)
});

passport.deserializeUser(async(id,done)=>{
    try{
        const user = await User.findById(id);
        done(null,user)
    }catch(error){
        done(error,null)
    }
});


module.exports = passport;