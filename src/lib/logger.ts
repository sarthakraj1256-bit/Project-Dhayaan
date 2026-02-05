 /**
  * Development-only logger that prevents detailed error logging in production.
  * In production, only logs a sanitized error message.
  */
 export const logError = (context: string, error: unknown) => {
   if (import.meta.env.DEV) {
     console.error(context, error);
   } else {
     // In production, log only the context and error type, not full details
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     console.error(`${context}: ${errorMessage}`);
   }
 };
 
 /**
  * Development-only warning logger
  */
 export const logWarn = (context: string, details?: unknown) => {
   if (import.meta.env.DEV) {
     console.warn(context, details);
   }
 };