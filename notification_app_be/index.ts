import axios from 'axios';
import dotenv from 'dotenv';
import { Log } from '../logging_middleware/logger';

dotenv.config();

const BASE_URL = 'http://20.207.122.201/evaluation-service';

const PRIORITY_MAP: Record<string, number> = {
    'Placement': 3,
    'Result': 2,
    'Event': 1
};

async function fetchPriorityNotifications() {
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

        const response = await axios.get(`${BASE_URL}/notifications`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const notifications = response.data.notifications;

        const sortedNotifications = notifications.sort((a: any, b: any) => {
            const priorityA = PRIORITY_MAP[a.notificationType] || 0;
            const priorityB = PRIORITY_MAP[b.notificationType] || 0;
            if (priorityA !== priorityB) return priorityB - priorityA;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        console.log("--- PRIORITY INBOX ---");
        console.table(sortedNotifications.map((n: any) => ({
            Type: n.notificationType,
            Message: n.content.substring(0, 50) + "...",
            Date: new Date(n.createdAt).toLocaleDateString()
        })));

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

fetchPriorityNotifications();