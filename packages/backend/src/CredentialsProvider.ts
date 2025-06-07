// backend/src/CredentialsProvider.ts

import { MongoClient, Collection } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    _id: string;  // username as ID
    username: string;
    password: string;  // salted + hashed password
}

export class CredentialsProvider {
    private credsCollection: Collection<ICredentialsDocument>;

    constructor(private readonly mongoClient: MongoClient) {
        const db = this.mongoClient.db(process.env.DB_NAME);
        const credsCollectionName = process.env.CREDS_COLLECTION_NAME;

        if (!credsCollectionName) {
            throw new Error("Missing CREDS_COLLECTION_NAME in environment variables");
        }

        this.credsCollection = db.collection<ICredentialsDocument>(credsCollectionName);
    }

    async registerUser(username: string, password: string): Promise<boolean> {
        // Check if user already exists
        const existingUser = await this.credsCollection.findOne({ _id: username });
        if (existingUser) {
            return false; // User already exists
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        await this.credsCollection.insertOne({
            _id: username,
            username: username,
            password: hashedPassword
        });

        return true; // Success
    }

    async verifyPassword(username: string, password: string): Promise<boolean> {
        const userRecord = await this.credsCollection.findOne({ _id: username });
        if (!userRecord) {
            return false; // User doesn't exist
        }

        // Compare password with stored hash
        return await bcrypt.compare(password, userRecord.password);
    }
}