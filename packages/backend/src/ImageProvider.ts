import { Collection, MongoClient } from "mongodb";

interface IImageDocument {
    _id: string;
    src: string;
    name: string;
    authorId: string;
}

interface IUserDocument {
    _id: string;
    username: string;
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

    async getAllImagesDenormalized() {
        const images = await this.imageCollection.find().toArray();
        const authorIds = images.map((img) => img.authorId);

        const users = await this.userCollection.find({
            _id: { $in: authorIds }
        }).toArray();

        const userMap = new Map(users.map((user) => [user._id, user]));

        return images.map((img) => ({
            id: img._id,
            src: img.src,
            name: img.name,
            author: {
                id: img.authorId,
                username: userMap.get(img.authorId)?.username || "Unknown"
            }
        }));
    }
}
