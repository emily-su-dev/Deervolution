// supabaseService.d.ts

export interface AccountData {
    userid: string;
    deers: number;
    geese: number;
    racoons: number;
    squirrels: number;
    sparrow: number;
  }
  
  export function fetchData(): Promise<AccountData[]>;
  