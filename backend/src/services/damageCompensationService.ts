import { query, queryOne } from '../config/database';

export interface DamageCompensationRule {
  id: string;
  name: string;
  description: string | null;
  min_order_value: number;
  max_order_value: number | null;
  compensation_type: 'percentage' | 'fixed';
  compensation_value: number;
  max_compensation: number | null;
  is_active: boolean;
  priority: number;
}

export interface DamageCompensationCalculation {
  compensationAmount: number;
  appliedRule: DamageCompensationRule | null;
  breakdown: {
    orderValue: number;
    compensationType: 'percentage' | 'fixed';
    compensationValue: number;
    calculatedCompensation: number;
    cappedCompensation: number;
  };
}

export const DamageCompensationService = {
  /**
   * Get all active damage compensation rules
   */
  async getRules(): Promise<DamageCompensationRule[]> {
    return query<DamageCompensationRule>(
      `SELECT * FROM damage_compensation_rules 
       WHERE is_active = true 
       ORDER BY priority DESC, min_order_value DESC`
    );
  },

  /**
   * Find the applicable damage compensation rule for an order value
   */
  async findApplicableRule(orderValue: number): Promise<DamageCompensationRule | null> {
    return queryOne<DamageCompensationRule>(
      `SELECT * FROM damage_compensation_rules 
       WHERE is_active = true 
         AND min_order_value <= $1 
         AND (max_order_value IS NULL OR max_order_value >= $1)
       ORDER BY priority DESC, min_order_value DESC
       LIMIT 1`,
      [orderValue]
    );
  },

  /**
   * Calculate damage compensation amount based on order value
   * NOTE: This is NOT paid upfront, only charged if damage occurs
   */
  async calculateCompensation(orderValue: number): Promise<DamageCompensationCalculation> {
    const rule = await this.findApplicableRule(orderValue);

    if (!rule) {
      const defaultCompensation = orderValue * 0.2;
      return {
        compensationAmount: defaultCompensation,
        appliedRule: null,
        breakdown: {
          orderValue,
          compensationType: 'percentage',
          compensationValue: 20,
          calculatedCompensation: defaultCompensation,
          cappedCompensation: defaultCompensation
        }
      };
    }

    let calculatedCompensation: number;

    if (rule.compensation_type === 'percentage') {
      calculatedCompensation = (orderValue * rule.compensation_value) / 100;
    } else {
      calculatedCompensation = rule.compensation_value;
    }

    const cappedCompensation = rule.max_compensation 
      ? Math.min(calculatedCompensation, rule.max_compensation)
      : calculatedCompensation;

    return {
      compensationAmount: cappedCompensation,
      appliedRule: rule,
      breakdown: {
        orderValue,
        compensationType: rule.compensation_type,
        compensationValue: rule.compensation_value,
        calculatedCompensation,
        cappedCompensation
      }
    };
  },

  /**
   * Calculate damage compensation for package items specifically
   */
  calculatePackageCompensation(
    packagePrice: number,
    compensationPercentage: number,
    maxCompensation?: number
  ): number {
    const compensation = (packagePrice * compensationPercentage) / 100;
    return maxCompensation ? Math.min(compensation, maxCompensation) : compensation;
  },

  /**
   * Calculate damage compensation for individual products
   */
  calculateProductCompensation(
    compensationPerItem: number,
    quantity: number
  ): number {
    return compensationPerItem * quantity;
  },

  /**
   * Calculate total damage compensation for mixed cart (packages + products)
   */
  async calculateTotalCompensation(items: {
    type: 'package' | 'product';
    price: number;
    quantity: number;
    compensationPercentage?: number;
    compensationPerItem?: number;
  }[]): Promise<number> {
    let totalCompensation = 0;

    for (const item of items) {
      if (item.type === 'package' && item.compensationPercentage) {
        totalCompensation += this.calculatePackageCompensation(
          item.price * item.quantity,
          item.compensationPercentage
        );
      } else if (item.type === 'product' && item.compensationPerItem) {
        totalCompensation += this.calculateProductCompensation(
          item.compensationPerItem,
          item.quantity
        );
      }
    }

    return totalCompensation;
  },

  /**
   * Create a new damage compensation rule (admin)
   */
  async createRule(data: {
    name: string;
    description?: string;
    min_order_value: number;
    max_order_value?: number;
    compensation_type: 'percentage' | 'fixed';
    compensation_value: number;
    max_compensation?: number;
    priority?: number;
  }): Promise<DamageCompensationRule> {
    const result = await queryOne<DamageCompensationRule>(
      `INSERT INTO damage_compensation_rules (
        name, description, min_order_value, max_order_value,
        compensation_type, compensation_value, max_compensation, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        data.name,
        data.description || null,
        data.min_order_value,
        data.max_order_value || null,
        data.compensation_type,
        data.compensation_value,
        data.max_compensation || null,
        data.priority || 0
      ]
    );

    if (!result) throw new Error('Failed to create damage compensation rule');
    return result;
  },

  /**
   * Update a damage compensation rule (admin)
   */
  async updateRule(id: string, data: Partial<{
    name: string;
    description: string;
    min_order_value: number;
    max_order_value: number;
    compensation_type: 'percentage' | 'fixed';
    compensation_value: number;
    max_compensation: number;
    is_active: boolean;
    priority: number;
  }>): Promise<DamageCompensationRule | null> {
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
    return queryOne<DamageCompensationRule>(
      `UPDATE damage_compensation_rules SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  /**
   * Delete a damage compensation rule (admin)
   */
  async deleteRule(id: string): Promise<boolean> {
    await query('DELETE FROM damage_compensation_rules WHERE id = $1', [id]);
    return true;
  }
};
