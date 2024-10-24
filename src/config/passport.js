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

                // If the user exists, check if they are an admin
                if (existingUser.isAdmin) {
                    // If user is admin, deny login
                    return done(null, false, { message: "Access denied: You are an admin." });
                }
                // If the user exists, check if they are blocked
                if (existingUser.isBlocked) {
                    // If user is blocked, deny login
                    return done(null, false, { message: "Your account has been blocked. Please contact support." });
                }
                
                // Return the user object if not an admin
                return done(null, existingUser);
            }
            //check if a user with the same email exists but without a google ID
            existingUser = await User.findOne({email:profile.emails[0].value});
            if(existingUser){
                //if the user exists, link the Google account by updating the googleId
                existingUser.googleId = profile.id;
                await existingUser.save();
                return done(null,existingUser)
            }

            //if no user exists with this google ID or email, create a new user
            const newUser = new User({
                googleId:profile.id,
                name:profile.displayName,
                email:profile.emails[0].value,
                termsAccepted: true,
                phone:undefined,
                isVerified:true
            });
        

            await newUser.save();
            return done(null,newUser)
            


        } catch (error) {
            return done(error,false)
        }
    }
  )
);

// Serialize and deserialize user (this is required for session management of google users)

passport.serializeUser((user,done)=>{
    done(null,user.id)// Store the user ID in session
});

passport.deserializeUser(async(id,done)=>{
    try{
        const user = await User.findById(id);
        if(!user){
            return done(null,false,{message:'User not found'});
        }
        done(null,user)// Store the user object in req.user
    }catch(error){
        done(error,null)
    }
});



module.exports = passport;



