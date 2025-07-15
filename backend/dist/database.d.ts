export const pool: any;
export namespace db {
    function query(text: any, params: any): Promise<any>;
    function findUserByPhone(phone: any): Promise<any>;
    function createUser(userData: any): Promise<any>;
    function getAllUsers(): Promise<any>;
    function createConsignment(consignmentData: any): Promise<any>;
    function getConsignmentsByFarmer(farmerId: any): Promise<any>;
    function getAllConsignments(): Promise<any>;
    function updateConsignment(id: any, updates: any): Promise<any>;
    function getAllProducts(): Promise<any>;
    function createProduct(productData: any): Promise<any>;
    function getWalletByUserId(userId: any): Promise<any>;
    function createWallet(userId: any): Promise<any>;
    function updateWalletBalance(walletId: any, amount: any): Promise<any>;
    function createWalletTransaction(transactionData: any): Promise<any>;
    function getAllWarehouses(): Promise<any>;
    function createNotification(notificationData: any): Promise<any>;
    function getNotificationsByUser(userId: any): Promise<any>;
}
export function testConnection(): Promise<boolean>;
