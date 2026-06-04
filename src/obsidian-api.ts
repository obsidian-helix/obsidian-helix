
export interface DataStorage {
    loadData(): Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    saveData(data: any): Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
}
