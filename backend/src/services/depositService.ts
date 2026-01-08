import { query, queryOne } from '../config/database';

export interface DepositRule {
  id: string;
  name: string;
  description: string | null;
  min_order_value: number;
  max_order_value: number | null;
  deposit_type: 'percentage' | 'fixed';
  deposit_value: number;
  max_deposit: number | null;
  is_active: boolean;
  priority: number;
}

export interface DepositCalculation {
  depositAmount: number;
  appliedRule: DepositRule | null;
  breakdown: {
    orderValue: number;
    depositType: 'percentage' | 'fixed';
    depositValue: number;
    calculatedDeposit: number;
    cappedDeposit: number;
  };
}

export const DepositService = {
  /**
   * Get all active deposit rules
   */
  async getRules(): Promise<DepositRule[]> {
    return query<DepositRule>(
      `SELECT * FROM deposit_rules 
       WHERE is_active = true 
       ORDER BY priority DESC, min_order_value DESC`
    );
  },

  /**
   * Find the applicable deposit rule for an order value
   */
  async findApplicableRule(orderValue: number): Promise<DepositRule | null> {
    return queryOne<DepositRule>(
      `SELECT * FROM deposit_rules 
       WHERE is_active = true 
         AND min_order_value <= $1 
         AND (max_order_value IS NULL OR max_order_value >= $1)
       ORDER BY priority DESC, min_order_value DESC
       LIMIT 1`,
      [orderValue]
    );
  },

  /**
   * Calculate deposit amount based on order value
   */
  async calculateDeposit(orderValue: number): Promise<DepositCalculation> {
    const rule = await this.findApplicableRule(orderValue);

    if (!rule) {
      // Default: 20% deposit if no rule matches
      const defaultDeposit = orderValue * 0.2;
      return {
        depositAmount: defaultDeposit,
        appliedRule: null,
        breakdown: {
          orderValue,
          depositType: 'percentage',
          depositValue: 20,
          calculatedDeposit: defaultDeposit,
          cappedDeposit: defaultDeposit
        }
      };
    }

    let calculatedDeposit: number;

    if (rule.deposit_type === 'percentage') {
      calculatedDeposit = (orderValue * rule.deposit_value) / 100;
    } else {
      calculatedDeposit = rule.deposit_value;
    }

    // Apply max deposit cap if set
    const cappedDeposit = rule.max_deposit 
      ? Math.min(calculatedDeposit, rule.max_deposit)
      : calculatedDeposit;

    return {
      depositAmount: cappedDeposit,
      appliedRule: rule,
      breakdown: {
        orderValue,
        depositType: rule.deposit_type,
        depositValue: rule.deposit_value,
        calculatedDeposit,
        cappedDeposit
      }
    };
  },

  /**
   * Calculate deposit for package items specifically
   * Packages often have their own deposit percentage
   */
  calculatePackageDeposit(
    packagePrice: number,
    depositPercentage: number,
    maxDeposit?: number
  ): number {
    const deposit = (packagePrice * depositPercentage) / 100;
    return maxDeposit ? Math.min(deposit, maxDeposit) : deposit;
  },

  /**
   * Calculate deposit for individual products
   */
  calculateProductDeposit(
    depositPerItem: number,
    quantity: number
  ): number {
    return depositPerItem * quantity;
  },

  /**
   * Calculate total deposit for mixed cart (packages + products)
   */
  async calculateTotalDeposit(items: {
    type: 'package' | 'product';
    price: number;
    quantity: number;
    depositPercentage?: number;
    depositPerItem?: number;
  }[]): Promise<number> {
    let totalDeposit = 0;

    for (const item of items) {
      if (item.type === 'package' && item.depositPercentage) {
        totalDeposit += this.calculatePackageDeposit(
          item.price * item.quantity,
          item.depositPercentage
        );
      } else if (item.type === 'product' && item.depositPerItem) {
        totalDeposit += this.calculateProductDeposit(
          item.depositPerItem,
          item.quantity
        );
      }
    }

    return totalDeposit;
  },

  /**
   * Create a new deposit rule (admin)
   */
  async createRule(data: {
    name: string;
    description?: string;
    min_order_value: number;
    max_order_value?: number;
    deposit_type: 'percentage' | 'fixed';
    deposit_value: number;
    max_deposit?: number;
    priority?: number;
  }): Promise<DepositRule> {
    const result = await queryOne<DepositRule>(
      `INSERT INTO deposit_rules (
        name, description, min_order_value, max_order_value,
        deposit_type, deposit_value, max_deposit, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.name,
        data.description || null,
        data.min_order_value,
        data.max_order_value || null,
        data.deposit_type,
        data.deposit_value,
        data.max_deposit || null,
        data.priority || 0
      ]
    );

    if (!result) throw new Error('Failed to create deposit rule');
    return result;
  },

  /**
   * Update a deposit rule (admin)
   */
  async updateRule(id: string, data: Partial<{
    name: string;
    description: string;
    min_order_value: number;
    max_order_value: number;
    deposit_type: 'percentage' | 'fixed';
    deposit_value: number;
    max_deposit: number;
    is_active: boolean;
    priority: number;
  }>): Promise<DepositRule | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    return queryOne<DepositRule>(
      `UPDATE deposit_rules SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  /**
   * Delete a deposit rule (admin)
   */
  async deleteRule(id: string): Promise<boolean> {
    await query('DELETE FROM deposit_rules WHERE id = $1', [id]);
    return true;
  }
};
