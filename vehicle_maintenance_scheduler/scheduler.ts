import { Log } from '../logging_middleware/logger';

interface Vehicle {
    MaintenanceHours: number; 
    ImpactScore: number;
    ID: string;
}

export function getOptimizedSchedule(vehicles: any[], availableHours: number) {
    const n = vehicles.length;
    const dp = Array.from({ length: n + 1 }, () => Array(availableHours + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const vehicle = vehicles[i - 1];
        const duration = vehicle.MaintenanceHours;
        const impact = vehicle.ImpactScore;

        for (let j = 1; j <= availableHours; j++) {
            if (duration <= j) {
                dp[i][j] = Math.max(impact + dp[i - 1][j - duration], dp[i - 1][j]);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    const selectedVehicles: any[] = [];
    let totalImpact = dp[n][availableHours];
    let remainingHours = availableHours;

    for (let i = n; i > 0 && totalImpact > 0; i--) {
        if (totalImpact !== dp[i - 1][remainingHours]) {
            const vehicle = vehicles[i - 1];
            selectedVehicles.push(vehicle);
            totalImpact -= vehicle.ImpactScore;
            remainingHours -= vehicle.MaintenanceHours;
        }
    }

    Log("backend", "info", "service", `Optimized schedule created.`);

    // FIX: The opening brace MUST be on the same line as return
    return {
        selectedVehicles,
        totalHoursSpent: availableHours - remainingHours,
        totalImpactScore: dp[n][availableHours]
    };
}