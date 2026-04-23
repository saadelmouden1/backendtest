import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from './env'
import prisma from './database'

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://127.0.0.1:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        const firstName = profile.name?.givenName ?? 'Unknown'
        const lastName = profile.name?.familyName ?? 'Unknown'
        const googleId = profile.id

        if (!email) {
          return done(new Error('No email from Google'))
        }

        // check if user exists by email
        let user = await prisma.user.findUnique({
          where: { email }
        })

        if (user) {
          // user exists — update googleId if not set
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { email },
              data: { googleId }
            })
          }
        } else {
          // new user — create without password
          user = await prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              googleId,
            }
          })
        }

        return done(null, user)
      } catch (error) {
        return done(error as Error)
      }
    }
  )
)

export default passport