import { Log } from '../logging_middleware/logger';

interface Vehicle {
    TaskId: string;
    Duration: number;
    Impact: number;
}

export function getOptimizedSchedule(vehicles: Vehicle[], availableHours: number) {
    const n = vehicles.length;

    const dp = Array.from({ length: n + 1 }, () => Array(availableHours + 1).fill(0));

    for (let i = 1; i <= n; i++) 
    {
        const { Duration, Impact } = vehicles[i - 1];
        for (let j = 1; j <= availableHours; j++) 
        {
            if (Duration <= j) 
            {
                dp[i][j] = Math.max(Impact + dp[i - 1][j - Duration], dp[i - 1][j]);
            } 
            else 
            {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    const selectedVehicles: Vehicle[] = [];
    let totalImpact = dp[n][availableHours];
    let remainingHours = availableHours;

    for (let i = n; i > 0 && totalImpact > 0; i--) 
    {
        if (totalImpact !== dp[i - 1][remainingHours]) {
            const vehicle = vehicles[i - 1];
            selectedVehicles.push(vehicle);
            totalImpact -= vehicle.Impact;
            remainingHours -= vehicle.Duration;
        }
    }

    Log("backend", "info", "service", `Optimized ${n} vehicles down to ${selectedVehicles.length} for depot.`);
    
    return 
    {
        selectedVehicles,
        totalHoursSpent: availableHours - remainingHours,
        totalImpactScore: dp[n][availableHours]
    };
}