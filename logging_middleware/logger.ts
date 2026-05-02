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

/**
 * Sends a log entry to the evaluation server.
 * @param stack - "backend" or "frontend"
 * @param level - "info", "warn", or "error"
 * @param pkg - The component name (e.g., "scheduler", "notifications")
 * @param message - The log message
 */
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
        // Always log to console as well for your screenshots
        console.log(`[${level.toUpperCase()}] ${pkg}: ${message}`);
    } catch (err) {
        console.log(`[LOCAL-ONLY] ${pkg}: ${message}`);
    }
}