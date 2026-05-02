import axios from 'axios';
import dotenv from 'dotenv';
import { Log } from '../logging_middleware/logger';

dotenv.config();

const BASE_URL = 'http://20.207.122.201/evaluation-service';

async function runNotifications() {
    try {
        await Log("backend", "info", "notifications", "Fetching student notifications.");

        const authRes = await axios.post(`${BASE_URL}/auth`, {
            email: process.env.EMAIL,
            name: "Priyanka Sen",
            rollNo: process.env.ROLL_NO,
            accessCode: process.env.ACCESS_CODE,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        });
        const token = authRes.data.access_token;

        const notifyRes = await axios.get(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Handle case where notifications might be inside a data property
        const notifications = notifyRes.data.notifications || notifyRes.data;

        const priorityMap: any = { "Placement": 1, "Results": 2, "Events": 3 };

        const sorted = notifications.sort((a: any, b: any) => {
            return (priorityMap[a.Category] || 4) - (priorityMap[b.Category] || 4);
        });

        console.log("\n--- PRIORITY INBOX ---");
        console.table(sorted.map((n: any) => ({
            Category: n.Category,
            // Safe check for Content
            Content: n.Content ? (n.Content.substring(0, 50) + "...") : "N/A",
            Time: n.Timestamp || n.time
        })));

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

runNotifications();