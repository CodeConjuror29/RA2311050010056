import axios from 'axios';
import dotenv from 'dotenv';
import { Log } from '../logging_middleware/logger';
import { getOptimizedSchedule } from './scheduler';

dotenv.config();

const BASE_URL = 'http://20.207.122.201/evaluation-service';

async function runScheduler() {
    try {
        await Log("backend", "info", "controller", "Starting Vehicle Maintenance Scheduler process.");

        const authRes = await axios.post(`${BASE_URL}/auth`, 
        {
            email: process.env.EMAIL,
            name: "Priyanka Sen",
            rollNo: process.env.ROLL_NO,
            accessCode: process.env.ACCESS_CODE,
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
        });
        const token = authRes.data.access_token;
        const headers = { Authorization: `Bearer ${token}` };

        const [depotsRes, vehiclesRes] = await Promise.all([
            axios.get(`${BASE_URL}/depots`, { headers }),
            axios.get(`${BASE_URL}/vehicles`, { headers })
        ]);

        const depots = depotsRes.data.depots;
        const allVehicles = vehiclesRes.data.vehicles;

        await Log("backend", "info", "service", `Fetched ${depots.length} depots and ${allVehicles.length} vehicles.`);

        const results = depots.map((depot: any) => {
            const schedule = getOptimizedSchedule(allVehicles, depot.MechanicHours);
            return {
                depotId: depot.ID,
                availableHours: depot.MechanicHours,
                ...schedule
            };
        });

        console.log("--- FINAL OPTIMIZED SCHEDULES ---");
        console.dir(results, { depth: null });
        
        await Log("backend", "info", "handler", "Successfully calculated schedules for all depots.");

    } 
    catch (error: any) 
    {
        await Log("backend", "error", "handler", `Scheduler failed: ${error.message}`);
        console.error(error);
    }
}

runScheduler();