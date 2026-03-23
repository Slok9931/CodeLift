import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User from "../models/User";

export const initializePassport = () => {
  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL ||
    `${process.env.SERVER_URL || "http://localhost:3000"}/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: any
      ) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });
          if (existingUser) {
            // Update profile picture if it's different
            if (
              profile.photos?.[0]?.value &&
              existingUser.profilePicture !== profile.photos[0].value
            ) {
              existingUser.profilePicture = profile.photos[0].value;
              await existingUser.save();
            }
            return done(null, existingUser);
          }
          const newUser = await new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            profilePicture: profile.photos?.[0]?.value,
          }).save();
          done(null, newUser);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id: string, done) => {
    User.findById(id)
      .then((user) => {
        if (user) {
          // Convert MongoDB document to plain object that matches our User interface
          const userObj = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            googleId: user.googleId,
            profilePicture: user.profilePicture,
          };
          done(null, userObj);
        } else {
          done(null, null);
        }
      })
      .catch((err) => {
        done(err, null);
      });
  });
};
