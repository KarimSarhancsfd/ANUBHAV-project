import {PassportStrategy} from "@nestjs/passport"
import {Strategy, VerifyCallback} from "passport-google-oauth20"
import {Injectable} from "@nestjs/common"

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      passReqToCallback: true,
      scope: ["email", "profile"],
    })
  }

  async validate(
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = {
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0].value,
    }
    done(null, user)
  }
}