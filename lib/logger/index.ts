const LOG_PREFIX = {
    payment: '💰 [Payment]',
    error: '❌ [Error]',
    api: '🌐 [API]',
    paymentMethod: '💳 [PaymentMethod]',
  };
  
  class SimpleLogger {
    private logToConsole(prefix: string, message: string, data?: any) {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ${prefix} ${message}`);
      if (data) {
        const safeData = this.removeSensitiveInfo(data);
        console.log('Details:', safeData);
        
        if (data instanceof Error) {
          console.log('Error Stack:', data.stack);
        }
      }
    }
  
    private removeSensitiveInfo(data: any) {
      if (typeof data !== 'object' || !data) return data;
      
      const sensitiveFields = ['card', 'token', 'password'];
      const cleaned = { ...data };
      
      sensitiveFields.forEach(field => {
        if (field in cleaned) {
          cleaned[field] = '[REDACTED]';
        }
      });
      
      return cleaned;
    }
  
    payment(message: string, data?: any) {
      this.logToConsole(LOG_PREFIX.payment, message, data);
    }
  
    error(message: string, error?: any) {
      this.logToConsole(LOG_PREFIX.error, message, error);
    }
  
    api(message: string, data?: any) {
      this.logToConsole(LOG_PREFIX.api, message, data);
    }
  
    paymentMethod(message: string, data?: any) {
      this.logToConsole(LOG_PREFIX.paymentMethod, message, data);
    }
  }
  
  export const logger = new SimpleLogger();
  export default logger;