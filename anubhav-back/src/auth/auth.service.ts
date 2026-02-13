import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(
        private readonly jwtService: JwtService,
        @Inject(forwardRef(() => UserService))
        private readonly userServices: UserService
    ) { }

    async generateAccessToken(payload: any) {
        const user = await this.userServices.findOne(payload.id);
        const access_token = await this.jwtService.signAsync({ id: user.data.id, role: user.data.role }, { secret: 'T!@!8934' });
        await this.userServices.updateToken(user.data.id, access_token)
        return {
            access_token: access_token,
        }
    }
}