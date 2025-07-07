// Sistema centralizado de gerenciamento de créditos
// Em produção, substitua por um banco de dados real

class CreditManager {
  private static instance: CreditManager;
  private userCredits: { [email: string]: number } = {};

  private constructor() {}

  public static getInstance(): CreditManager {
    if (!CreditManager.instance) {
      CreditManager.instance = new CreditManager();
    }
    return CreditManager.instance;
  }

  public getCredits(email: string): number {
    return this.userCredits[email] || 0;
  }

  public addCredits(email: string, amount: number): number {
    this.userCredits[email] = (this.userCredits[email] || 0) + amount;
    return this.userCredits[email];
  }

  public subtractCredits(email: string, amount: number): { success: boolean; credits: number; error?: string } {
    const currentCredits = this.userCredits[email] || 0;
    
    if (currentCredits < amount) {
      return {
        success: false,
        credits: currentCredits,
        error: "Créditos insuficientes"
      };
    }

    this.userCredits[email] = currentCredits - amount;
    return {
      success: true,
      credits: this.userCredits[email]
    };
  }

  public hasCredits(email: string, amount: number = 1): boolean {
    return (this.userCredits[email] || 0) >= amount;
  }
}

export const creditManager = CreditManager.getInstance();