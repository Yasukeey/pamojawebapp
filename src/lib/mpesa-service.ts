// Mock M-Pesa service for demonstration purposes
// In a real application, this would integrate with the actual M-Pesa API

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  reference: string;
  description: string;
}

export interface MpesaPaymentResponse {
  success: boolean;
  checkoutRequestId?: string;
  message: string;
  errorCode?: string;
}

export class MpesaService {
  private static instance: MpesaService;
  
  private constructor() {}
  
  public static getInstance(): MpesaService {
    if (!MpesaService.instance) {
      MpesaService.instance = new MpesaService();
    }
    return MpesaService.instance;
  }

  /**
   * Initiate M-Pesa STK push payment
   */
  public async initiatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    try {
      // Validate phone number format (Kenyan format)
      if (!this.isValidPhoneNumber(request.phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format. Please use format: 254XXXXXXXXX',
          errorCode: 'INVALID_PHONE'
        };
      }

      // Validate amount
      if (request.amount < 1 || request.amount > 70000) {
        return {
          success: false,
          message: 'Invalid amount. Amount must be between KES 1 and KES 70,000',
          errorCode: 'INVALID_AMOUNT'
        };
      }

      // Simulate API call delay
      await this.delay(2000);

      // Simulate successful payment initiation
      const checkoutRequestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        checkoutRequestId,
        message: 'STK push sent successfully. Please check your phone to complete the payment.'
      };

    } catch (error) {
      return {
        success: false,
        message: 'Failed to initiate payment. Please try again.',
        errorCode: 'API_ERROR'
      };
    }
  }

  /**
   * Check payment status
   */
  public async checkPaymentStatus(checkoutRequestId: string): Promise<MpesaPaymentResponse> {
    try {
      // Simulate API call delay
      await this.delay(1000);

      // Simulate payment status check
      // In a real app, this would query the M-Pesa API
      const isSuccessful = Math.random() > 0.1; // 90% success rate for demo

      if (isSuccessful) {
        return {
          success: true,
          message: 'Payment completed successfully',
          checkoutRequestId
        };
      } else {
        return {
          success: false,
          message: 'Payment failed or was cancelled',
          errorCode: 'PAYMENT_FAILED'
        };
      }

    } catch (error) {
      return {
        success: false,
        message: 'Failed to check payment status',
        errorCode: 'API_ERROR'
      };
    }
  }

  /**
   * Validate Kenyan phone number format
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Remove any spaces or special characters
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Check if it starts with 254 (Kenya country code)
    if (cleanNumber.startsWith('254') && cleanNumber.length === 12) {
      return true;
    }
    
    // Check if it starts with +254
    if (cleanNumber.startsWith('+254') && cleanNumber.length === 13) {
      return true;
    }
    
    return false;
  }

  /**
   * Simulate API delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format phone number to standard format
   */
  public formatPhoneNumber(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    if (cleanNumber.startsWith('+254')) {
      return cleanNumber.substring(1); // Remove the +
    }
    
    return cleanNumber;
  }

  /**
   * Get M-Pesa transaction limits
   */
  public getTransactionLimits() {
    return {
      minAmount: 1,
      maxAmount: 70000,
      dailyLimit: 140000,
      monthlyLimit: 1000000
    };
  }
}

export default MpesaService;
