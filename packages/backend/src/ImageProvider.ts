import { MongoClient, Collection, ObjectId } from "mongodb";

interface IImageDocument {
    _id: ObjectId;
    src: string;
    name: string;
    authorId: ObjectId;
}

interface IUserDocument {
    _id: ObjectId;
    username: string;
}

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}

export class ImageProvider {
    private imageCollection: Collection<IImageDocument>;
    private userCollection: Collection<IUserDocument>;

    constructor(private readonly mongoClient: MongoClient) {
        const db = this.mongoClient.db(process.env.DB_NAME);
        const imageColl = process.env.IMAGES_COLLECTION_NAME;
        const userColl = process.env.USERS_COLLECTION_NAME;

        if (!imageColl || !userColl) {
            throw new Error("Missing collection names in environment variables");
        }

        this.imageCollection = db.collection<IImageDocument>(imageColl);
        this.userCollection = db.collection<IUserDocument>(userColl);
    }

    async getAllImagesDenormalized(nameQuery?: string) {
        // Add 1-second delay as required by lab
        await waitDuration(1000);

        const query = nameQuery
            ? { name: { $regex: nameQuery, $options: "i" } }
            : {};

        const images = await this.imageCollection.find(query).toArray();
        const authorIds = images.map(img => img.authorId);

        const users = await this.userCollection.find({
            _id: { $in: authorIds }
        }).toArray();

        const userMap = new Map(users.map(user => [user._id.toString(), user]));

        return images.map(img => ({
            id: img._id.toString(),
            src: img.src,
            name: img.name,
            author: {
                id: img.authorId.toString(),
                username: userMap.get(img.authorId.toString())?.username || "Unknown"
            }
        }));
    }

    async getImageById(imageId: string) {
        if (!ObjectId.isValid(imageId)) {
            return null;
        }

        const image = await this.imageCollection.findOne({ _id: new ObjectId(imageId) });
        return image;
    }

    async updateImageName(imageId: string, newName: string): Promise<number> {
        if (!ObjectId.isValid(imageId)) {
            throw new Error("Invalid ID");
        }

        const result = await this.imageCollection.updateOne(
            { _id: new ObjectId(imageId) },
            { $set: { name: newName } }
        );

        return result.matchedCount;
    }

    async getUserById(userId: string) {
        if (!ObjectId.isValid(userId)) {
            return null;
        }
        return await this.userCollection.findOne({ _id: new ObjectId(userId) });
    }

    async createImage(src: string, name: string, authorUsername: string): Promise<void> {
        // For this lab, we'll fake the denormalization as suggested
        // Instead of looking up the user, we'll create a fake user document
        const fakeUserId = new ObjectId();

        await this.imageCollection.insertOne({
            _id: new ObjectId(),
            src,
            name,
            authorId: fakeUserId
        });

        // Also insert a fake user document if it doesn't exist
        const existingUser = await this.userCollection.findOne({ username: authorUsername });
        if (!existingUser) {
            await this.userCollection.insertOne({
                _id: fakeUserId,
                username: authorUsername
            });
        }
    }
}