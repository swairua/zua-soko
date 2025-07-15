declare const _exports: MpesaService;
export = _exports;
declare class MpesaService {
    consumerKey: string;
    consumerSecret: string;
    businessShortCode: string;
    passkey: string;
    callbackUrl: string;
    baseUrl: string;
    accessToken: any;
    tokenExpiry: Date | null;
    getAccessToken(): Promise<any>;
    generatePassword(): {
        password: string;
        timestamp: string;
    };
    initiateSTKPush(phoneNumber: any, amount: any, accountReference: any, transactionDesc: any): Promise<any>;
    querySTKStatus(checkoutRequestID: any): Promise<any>;
    validateCallback(callbackData: any): boolean;
    processCallback(callbackData: any): {
        merchantRequestID: any;
        checkoutRequestID: any;
        resultCode: any;
        resultDesc: any;
    };
}
