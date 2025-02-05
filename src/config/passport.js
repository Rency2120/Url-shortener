import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import "dotenv/config";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.URL}/api/auth/google/callback`,
      passReqToCallback: true,
    },

    async (req, accessToken, refreshToken, profile, done) => {
      console.log("Google Profile:", profile);
      try {
        let user = await User.findOne({ googleId: profile.id });
        console.log("user", user);
        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value,
          });
          await user.save();
        }
        console.log("USER", user);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
