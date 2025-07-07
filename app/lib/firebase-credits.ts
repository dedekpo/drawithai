import { db } from '@/lib/firebase-admin';

export interface UserCredits {
  email: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseCreditManager {
  private static instance: FirebaseCreditManager;
  private readonly collection = 'user_credits';

  private constructor() {}

  public static getInstance(): FirebaseCreditManager {
    if (!FirebaseCreditManager.instance) {
      FirebaseCreditManager.instance = new FirebaseCreditManager();
    }
    return FirebaseCreditManager.instance;
  }

  /**
   * Busca os créditos de um usuário
   */
  public async getCredits(email: string): Promise<number> {
    console.log("🔍 FirebaseCreditManager: Getting credits for email:", email);
    
    try {
      console.log("🔍 FirebaseCreditManager: Accessing Firestore collection:", this.collection);
      const docRef = db.collection(this.collection).doc(email);
      
      console.log("🔍 FirebaseCreditManager: Fetching document...");
      const doc = await docRef.get();

      if (!doc.exists) {
        console.log("🔍 FirebaseCreditManager: User document doesn't exist, creating with 0 credits");
        // Se o usuário não existe, criar com 0 créditos
        await this.createUser(email, 0);
        return 0;
      }
      
      const data = doc.data() as UserCredits;
      const credits = data.credits || 0;
      
      console.log("✅ FirebaseCreditManager: Successfully retrieved credits:", credits);
      return credits;
    } catch (error) {
      console.error('❌ FirebaseCreditManager: Error fetching credits:', error);
      console.error('❌ FirebaseCreditManager: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        email,
        collection: this.collection
      });
      throw new Error('Falha ao buscar créditos do usuário');
    }
  }

  /**
   * Adiciona créditos a um usuário
   */
  public async addCredits(email: string, amount: number): Promise<number> {
    try {
      const docRef = db.collection(this.collection).doc(email);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        // Criar usuário com os créditos iniciais
        await this.createUser(email, amount);
        return amount;
      }
      
      const currentData = doc.data() as UserCredits;
      const newCredits = (currentData.credits || 0) + amount;
      
      await docRef.update({
        credits: newCredits,
        updatedAt: new Date()
      });
      
      return newCredits;
    } catch (error) {
      console.error('Erro ao adicionar créditos:', error);
      throw new Error('Falha ao adicionar créditos');
    }
  }

  /**
   * Subtrai créditos de um usuário
   */
  public async subtractCredits(email: string, amount: number): Promise<{ success: boolean; credits: number; error?: string }> {
    try {
      const docRef = db.collection(this.collection).doc(email);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        // Se o usuário não existe, criar com 0 créditos
        await this.createUser(email, 0);
        return {
          success: false,
          credits: 0,
          error: "Créditos insuficientes"
        };
      }
      
      const currentData = doc.data() as UserCredits;
      const currentCredits = currentData.credits || 0;
      
      if (currentCredits < amount) {
        return {
          success: false,
          credits: currentCredits,
          error: "Créditos insuficientes"
        };
      }
      
      const newCredits = currentCredits - amount;
      
      await docRef.update({
        credits: newCredits,
        updatedAt: new Date()
      });
      
      return {
        success: true,
        credits: newCredits
      };
    } catch (error) {
      console.error('Erro ao subtrair créditos:', error);
      throw new Error('Falha ao subtrair créditos');
    }
  }

  /**
   * Verifica se o usuário tem créditos suficientes
   */
  public async hasCredits(email: string, amount: number = 1): Promise<boolean> {
    try {
      const credits = await this.getCredits(email);
      return credits >= amount;
    } catch (error) {
      console.error('Erro ao verificar créditos:', error);
      return false;
    }
  }

  /**
   * Cria um novo usuário no banco de dados
   */
  private async createUser(email: string, initialCredits: number = 0): Promise<void> {    console.log("🔍 FirebaseCreditManager: Creating new user:", { email, initialCredits });
        try {
      const docRef = db.collection(this.collection).doc(email);
      const userData: UserCredits = {
        email,
        credits: initialCredits,
        createdAt: new Date(),
        updatedAt: new Date()
      };
            console.log("🔍 FirebaseCreditManager: Setting user data:", userData);      await docRef.set(userData);      
      console.log("✅ FirebaseCreditManager: Successfully created user");    } catch (error) {
      console.error('❌ FirebaseCreditManager: Error creating user:', error);
      console.error('❌ FirebaseCreditManager: Create user error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        email,
        initialCredits
      });
      throw new Error('Falha ao criar usuário');
    }
  }

  /**
   * Busca todos os usuários (para administração)
   */
  public async getAllUsers(): Promise<UserCredits[]> {
    try {
      const snapshot = await db.collection(this.collection).get();
      const users: UserCredits[] = [];
      
      snapshot.forEach(doc => {
        users.push(doc.data() as UserCredits);
      });
      
      return users;
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      throw new Error('Falha ao buscar usuários');
    }
  }

  /**
   * Define créditos específicos para um usuário (para administração)
   */
  public async setCredits(email: string, credits: number): Promise<number> {
    try {
      const docRef = db.collection(this.collection).doc(email);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        await this.createUser(email, credits);
        return credits;
      }
      
      await docRef.update({
        credits,
        updatedAt: new Date()
      });
      
      return credits;
    } catch (error) {
      console.error('Erro ao definir créditos:', error);
      throw new Error('Falha ao definir créditos');
    }
  }
}

export const firebaseCreditManager = FirebaseCreditManager.getInstance();