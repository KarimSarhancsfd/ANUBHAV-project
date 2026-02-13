import { Injectable, Inject, forwardRef, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from '../../user/user.service';
import { Request } from 'express';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'T!@!8934',
            passReqToCallback: true

        })
    }

    async validate(request: Request, validationPayload: { id: number, role: string }): Promise<any> {
        const jwtToken = this.extractJwtToken(request);
        
        if (!jwtToken) {
            throw new UnauthorizedException('Invalid token');
        }

        const user = await this.userService.findOne(validationPayload.id);
        if (!user || user.data.token !== jwtToken) {
            throw new UnauthorizedException('Invalid user or token');
        }

        // Return user object including the role
        return { userId: user.data.id, role: user.data.role };  // Assuming `user.role` is either 'user' or 'admin'
    }

    private extractJwtToken(request: Request): string | null {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

}