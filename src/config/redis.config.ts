import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_SERVICE_URI as string);

export default redis