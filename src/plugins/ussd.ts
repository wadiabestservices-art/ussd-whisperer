import { registerPlugin } from '@capacitor/core';

export interface UssdPlugin {
  executeUssd(options: { code: string }): Promise<{ success: boolean; response: string }>;
  executeMultiLevelUssd(options: { 
    levels: Array<{ step: number; code: string; prompt: string }> 
  }): Promise<{ success: boolean; responses: string[] }>;
}

const Ussd = registerPlugin<UssdPlugin>('Ussd', {
  web: async () => {
    // Web fallback - just simulate
    return {
      executeUssd: async (options: { code: string }) => {
        console.log('Web: Simulating USSD code:', options.code);
        return { 
          success: true, 
          response: 'Web simulation - USSD not supported in browser' 
        };
      },
      executeMultiLevelUssd: async (options) => {
        console.log('Web: Simulating multi-level USSD');
        return { 
          success: true, 
          responses: options.levels.map(l => `Step ${l.step} simulated`) 
        };
      }
    };
  }
});

export const executeUssdCode = async (code: string): Promise<string> => {
  try {
    const result = await Ussd.executeUssd({ code });
    if (result.success) {
      return result.response;
    }
    throw new Error('USSD execution failed');
  } catch (error) {
    console.error('USSD execution error:', error);
    throw error;
  }
};

export const executeMultiLevelUssd = async (
  levels: Array<{ step: number; code: string; prompt: string }>
): Promise<string[]> => {
  try {
    const result = await Ussd.executeMultiLevelUssd({ levels });
    if (result.success) {
      return result.responses;
    }
    throw new Error('Multi-level USSD execution failed');
  } catch (error) {
    console.error('Multi-level USSD execution error:', error);
    throw error;
  }
};
