export const pool: any;
export function query(text: any, params: any): Promise<any>;
export function transaction(callback: any): Promise<any>;
export function initializeDatabase(): Promise<void>;
export function initializeDemoData(): Promise<void>;
