/**
 * @file auth.service.ts
 * @description Authentication service handling JWT token generation and user authorization.
 */
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

/**
 * @class AuthService
 * @description Service for JWT token generation and user authentication operations.
 */
@Injectable()
export class AuthService {

    /**
     * @constructor
     * @param {JwtService} jwtService - JWT service for token generation
     * @param {UserService} userServices - User service for user data retrieval
     */
    constructor(
        private readonly jwtService: JwtService,
        @Inject(forwardRef(() => UserService))
        private readonly userServices: UserService
    ) { }

    /**
     * @method generateAccessToken
     * @description Generates a JWT access token for authenticated users.
     * Retrieves user by ID, signs token with user ID and role, updates user token in database.
     * @param {Object} payload - Token payload containing user ID
     * @param {number} payload.id - User ID
     * @returns {Object} Object containing the generated access_token
     */
    async generateAccessToken(payload: any) {
        const user = await this.userServices.findOne(payload.id);
        const access_token = await this.jwtService.signAsync({ id: user.data.id, role: user.data.role }, { secret: 'T!@!8934' });
        await this.userServices.updateToken(user.data.id, access_token)
        return {
            access_token: access_token,
        }
    }
}