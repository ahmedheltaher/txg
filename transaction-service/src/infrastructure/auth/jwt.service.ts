import jwt from "jsonwebtoken";
import { config } from "../../config";

interface JwtPayload {
	userId: string;
	iat: number;
	exp: number;
}

export class JwtService {
	private readonly secret: string;
	private readonly expiresIn: string;

	constructor() {
		this.secret = config.jwt.secret;
		this.expiresIn = config.jwt.expiresIn;
	}

	generateToken(userId: string): string {
		return jwt.sign({ userId }, this.secret, {
			expiresIn: this.expiresIn,
		} as jwt.SignOptions);
	}

	verifyToken(token: string): JwtPayload {
		try {
			return jwt.verify(token, this.secret) as JwtPayload;
		} catch (error) {
			throw new Error("Invalid token");
		}
	}
}
