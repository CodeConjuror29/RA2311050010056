import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_URL = 'http://20.207.122.201/evaluation-service/auth';
const LOG_URL = 'http://20.207.122.201/evaluation-service/logs';

let cachedToken: string | null = null;

async function getAuthToken() {
    if (cachedToken) return cachedToken;
    try {
        const response = await axios.post(AUTH_URL, {
            email: process.env.EMAIL,
            name: "Priyanka Sen",
            rollNo: process.env.ROLL_NO,
            accessCode: process.env.ACCESS_CODE,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        });
        cachedToken = response.data.access_token;
        return cachedToken;
    } catch (error) {
        console.error("Logger Auth failed. Check your .env credentials.");
        return null;
    }
}

export async function Log(stack: "backend" | "frontend", level: string, pkg: string, message: string) {
    const token = await getAuthToken();
    try {
        if (token) {
            await axios.post(LOG_URL, {
                stack,
                level,
                package: pkg,
                message
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        console.log(`[${level.toUpperCase()}] ${pkg}: ${message}`);
    } catch (err) {
        console.log(`[LOCAL-ONLY] ${pkg}: ${message}`);
    }
}