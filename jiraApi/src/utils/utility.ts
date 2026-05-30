

class Utility {
    /* Logs messages to the console only in the development environment */
  /**
   *
   * @param {...any} args
   */
  public log(...args: any[]) {
    if (process.env.NODE_ENV == 'development') {
      console.log('[' + process.env.NODE_ENV + ']', ...args);
    }
  }

  public error(...args: any[]) {
    if (process.env.NODE_ENV == 'development') {
      console.error('[' + process.env.NODE_ENV + ']', ...args);
    }
  }

  public warn(...args: any[]){
    if (process.env.NODE_ENV == 'development') {
      console.warn('[' + process.env.NODE_ENV + ']', ...args);
    }
  }

}

export const utility = new Utility();