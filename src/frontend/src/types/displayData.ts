export type DisplayData = {
    displayName: string,
    macAddress: string,
    id: number,
    brand: string,
    model: string,
    width: number,
    height: number,
    orientation: string,
    filename: string,
    defaultFilename: string,
    runningSince: string,
    wakeTime: string,
    nextEventTime: string,
    battery_percentage: number,
    timeOfBattery: string,
    errors: DisplayErrors[],
}

export type DisplayErrors = {
    errorCode: number,
    errorMessage: string
}