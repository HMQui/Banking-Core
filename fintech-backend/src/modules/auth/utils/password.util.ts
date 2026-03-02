import * as bcrypt from 'bcrypt';

export class PasswordUtil {
    private static readonly SALT_ROUNDS = 12;

    /**
     * Hashes a plain text password using bcrypt.
     */
    static async hash(password: string): Promise<string> {
        const hashString: string =
            (await bcrypt.hash(password, this.SALT_ROUNDS)) || '';
        return hashString;
    }

    /**
     * Compares a plain text password with a stored hash.
     */
    static async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
