export interface DayTimeConfig {
    enabled: boolean;
    startTime: string;
    endTime: string;
}

export interface Config {
    displayIntervalDay: string;
    vorlaufzeit: string;
    nachlaufzeit: string;
    deleteAfterDays: string;
    weekdayTimes: { [day: string]: DayTimeConfig };
}