import { Log } from '../logging_middleware/logger';

export function getOptimizedSchedule(vehicles: any[], availableHours: number) {
    const n = vehicles.length;
    const dp = Array.from({ length: n + 1 }, () => Array(availableHours + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        const vehicle = vehicles[i - 1];
        // API uses these exact keys:
        const duration = vehicle.MaintenanceHours || 0; 
        const impact = vehicle.ImpactScore || 0;

        for (let j = 0; j <= availableHours; j++) {
            if (duration <= j) {
                dp[i][j] = Math.max(impact + dp[i - 1][j - duration], dp[i - 1][j]);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    const selectedVehicles: any[] = [];
    let res = dp[n][availableHours];
    let w = availableHours;

    for (let i = n; i > 0 && res > 0; i--) {
        if (res !== dp[i - 1][w]) {
            selectedVehicles.push(vehicles[i - 1]);
            res -= vehicles[i - 1].ImpactScore;
            w -= vehicles[i - 1].MaintenanceHours;
        }
    }

    Log("backend", "info", "service", `Calculated optimal impact: ${dp[n][availableHours]}`);

    return {
        selectedVehicles,
        totalHoursSpent: availableHours - w,
        totalImpactScore: dp[n][availableHours]
    };
}