import * as bcrypt from 'bcryptjs';

export class PasswordHelper {
	async encryptPassword(password: string): Promise<string> {
		const hash: string = await bcrypt.hash(password, 10);
		return hash;
	}

	async comparePassword(password: string, hash: string): Promise<boolean> {
		const match: boolean = await bcrypt.compare(password, hash);
		return match;
	}
}
