import axios from 'axios';
import dotenv from 'dotenv';
import { Log } from '../logging_middleware/logger';
import { getOptimizedSchedule } from './scheduler';

dotenv.config();

const BASE_URL = 'http://20.207.122.201/evaluation-service';

async function runScheduler() {
    try {
        await Log("backend", "info", "service", "Starting Scheduler...");

        const authRes = await axios.post(`${BASE_URL}/auth`, {
            email: process.env.EMAIL,
            name: "Priyanka Sen",
            rollNo: process.env.ROLL_NO,
            accessCode: process.env.ACCESS_CODE,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        });
        const token = authRes.data.access_token;

        const [depotsRes, vehiclesRes] = await Promise.all([
            axios.get(`${BASE_URL}/depots`, { headers: { Authorization: `Bearer ${token}` } }),
            axios.get(`${BASE_URL}/vehicles`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const depots = depotsRes.data.depots;
        const allVehicles = vehiclesRes.data.vehicles;

        const results = depots.map((depot: any) => {
            const schedule: any = getOptimizedSchedule(allVehicles, depot.MechanicHours);
            return {
                DepotID: depot.ID,
                Available: depot.MechanicHours,
                Used: schedule.totalHoursSpent,
                Score: schedule.totalImpactScore,
                Count: schedule.selectedVehicles.length
            };
        });

        console.log("\n--- OPTIMIZED MAINTENANCE SCHEDULES ---");
        console.table(results);

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

runScheduler();