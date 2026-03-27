import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined");
        }

        const hasDatabaseInUri = /mongodb(\+srv)?:\/\/[^/]+\/[^?]+/.test(mongoUri);
        const connectionString = hasDatabaseInUri ? mongoUri : `${mongoUri}/${DB_NAME}`;

        const connectionInstance = await mongoose.connect(connectionString)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

export default connectDB