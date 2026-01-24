import { query, queryOne } from '../config/database';

// ============================================
// TYPES
// ============================================

export interface LoyaltyTier {
  id: string;
  name: string;
  slug: string;
  min_points: number;
  max_points: number | null;
  discount_percentage: number;
  points_boost_percentage: number;
  benefits: string[];
  color: string;
  icon: string;
  sort_order: number;
  gradient_colors: string[];
  background_color: string;
  is_locked_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerLoyalty {
  id: string;
  customer_id: string;
  total_points: number;
  available_points: number;
  lifetime_points: number;
  current_tier_id: string | null;
  tier_start_date: Date | null;
  last_activity_date: Date | null;
  total_orders: number;
  yearly_spend: number;
  yearly_spend_year: number;
  previous_year_spend: number;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  tier?: LoyaltyTier;
}

export interface PointTransaction {
  id: string;
  customer_id: string;
  order_id: string | null;
  points: number;
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'adjustment';
  description: string | null;
  balance_after: number | null;
  created_at: Date;
}

export interface LoyaltyMilestone {
  id: string;
  customer_id: string;
  milestone_type: 'first_order' | 'orders_5' | 'orders_10' | 'orders_25' | 'orders_50' | 'birthday' | 'review';
  points_awarded: number;
  order_id: string | null;
  achieved_at: Date;
}

export type MilestoneType = LoyaltyMilestone['milestone_type'];

// Milestone configuration
export const MILESTONE_CONFIG: Record<MilestoneType, { points: number; description: string; orderCount?: number }> = {
  first_order: { points: 50, description: 'Welkomstbonus - Eerste bestelling' },
  orders_5: { points: 100, description: 'Mijlpaal - 5e bestelling', orderCount: 5 },
  orders_10: { points: 200, description: 'Mijlpaal - 10e bestelling', orderCount: 10 },
  orders_25: { points: 500, description: 'Mijlpaal - 25e bestelling', orderCount: 25 },
  orders_50: { points: 1000, description: 'Mijlpaal - 50e bestelling', orderCount: 50 },
  birthday: { points: 50, description: 'Verjaardagsbonus' },
  review: { points: 25, description: 'Review geschreven' }
};

// ============================================
// LOYALTY MODEL
// ============================================

export const LoyaltyModel = {
  // ----------------------------------------
  // TIERS
  // ----------------------------------------

  async getAllTiers(): Promise<LoyaltyTier[]> {
    const result = await query<LoyaltyTier>(
      `SELECT * FROM loyalty_tiers ORDER BY sort_order ASC`
    );
    return result.map(tier => ({
      ...tier,
      benefits: typeof tier.benefits === 'string' ? JSON.parse(tier.benefits) : (tier.benefits || []),
      gradient_colors: tier.gradient_colors || [],
      background_color: tier.background_color || '#FFFFFF',
      is_locked_default: tier.is_locked_default || false
    }));
  },

  async getTierById(id: string): Promise<LoyaltyTier | null> {
    const tier = await queryOne<LoyaltyTier>(
      `SELECT * FROM loyalty_tiers WHERE id = $1`,
      [id]
    );
    if (tier) {
      tier.benefits = typeof tier.benefits === 'string' ? JSON.parse(tier.benefits) : tier.benefits;
    }
    return tier;
  },

  async getTierBySlug(slug: string): Promise<LoyaltyTier | null> {
    const tier = await queryOne<LoyaltyTier>(
      `SELECT * FROM loyalty_tiers WHERE slug = $1`,
      [slug]
    );
    if (tier) {
      tier.benefits = typeof tier.benefits === 'string' ? JSON.parse(tier.benefits) : tier.benefits;
    }
    return tier;
  },

  async getTierForPoints(points: number): Promise<LoyaltyTier | null> {
    const tier = await queryOne<LoyaltyTier>(
      `SELECT * FROM loyalty_tiers 
       WHERE $1 >= min_points AND ($1 <= max_points OR max_points IS NULL)
       ORDER BY min_points DESC
       LIMIT 1`,
      [points]
    );
    if (tier) {
      tier.benefits = typeof tier.benefits === 'string' ? JSON.parse(tier.benefits) : tier.benefits;
    }
    return tier;
  },

  // ----------------------------------------
  // CUSTOMER LOYALTY
  // ----------------------------------------

  async getCustomerLoyalty(customerId: string): Promise<CustomerLoyalty | null> {
    const loyalty = await queryOne<CustomerLoyalty & { 
      tier_name?: string; 
      tier_slug?: string; 
      tier_discount?: number; 
      tier_boost?: number; 
      tier_benefits?: string[]; 
      tier_color?: string; 
      tier_icon?: string;
      tier_gradient_colors?: string[];
      tier_background_color?: string;
      tier_is_locked_default?: boolean;
    }>(
      `SELECT cl.*, 
              lt.name as tier_name, 
              lt.slug as tier_slug,
              lt.discount_percentage as tier_discount,
              lt.points_boost_percentage as tier_boost,
              lt.benefits as tier_benefits,
              lt.color as tier_color,
              lt.icon as tier_icon,
              lt.min_points as tier_min_points,
              lt.max_points as tier_max_points,
              lt.gradient_colors as tier_gradient_colors,
              lt.background_color as tier_background_color,
              lt.is_locked_default as tier_is_locked_default
       FROM customer_loyalty cl
       LEFT JOIN loyalty_tiers lt ON cl.current_tier_id = lt.id
       WHERE cl.customer_id = $1`,
      [customerId]
    );

    if (loyalty) {
      // Construct tier object from joined fields
      if (loyalty.tier_name) {
        loyalty.tier = {
          id: loyalty.current_tier_id!,
          name: loyalty.tier_name,
          slug: loyalty.tier_slug!,
          min_points: (loyalty as any).tier_min_points,
          max_points: (loyalty as any).tier_max_points,
          discount_percentage: loyalty.tier_discount!,
          points_boost_percentage: loyalty.tier_boost!,
          benefits: typeof loyalty.tier_benefits === 'string' ? JSON.parse(loyalty.tier_benefits) : loyalty.tier_benefits || [],
          color: loyalty.tier_color!,
          icon: loyalty.tier_icon!,
          sort_order: 0,
          gradient_colors: loyalty.tier_gradient_colors || [],
          background_color: loyalty.tier_background_color || '#FFFFFF',
          is_locked_default: loyalty.tier_is_locked_default || false,
          created_at: new Date(),
          updated_at: new Date()
        };
      }
    }

    return loyalty;
  },

  async initializeCustomerLoyalty(customerId: string): Promise<CustomerLoyalty> {
    // Get bronze tier
    const bronzeTier = await this.getTierBySlug('bronze');
    
    const loyalty = await queryOne<CustomerLoyalty>(
      `INSERT INTO customer_loyalty (customer_id, current_tier_id, tier_start_date, last_activity_date)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (customer_id) DO UPDATE SET last_activity_date = NOW()
       RETURNING *`,
      [customerId, bronzeTier?.id]
    );

    return loyalty!;
  },

  async updateCustomerPoints(
    customerId: string, 
    pointsChange: number, 
    transactionType: PointTransaction['transaction_type'],
    description: string,
    orderId?: string
  ): Promise<{ loyalty: CustomerLoyalty; transaction: PointTransaction }> {
    // Ensure customer has loyalty record
    let loyalty = await this.getCustomerLoyalty(customerId);
    if (!loyalty) {
      loyalty = await this.initializeCustomerLoyalty(customerId);
    }

    // Calculate new balances
    const newAvailable = Math.max(0, loyalty.available_points + pointsChange);
    const newTotal = loyalty.total_points + (pointsChange > 0 ? pointsChange : 0);
    const newLifetime = loyalty.lifetime_points + (pointsChange > 0 ? pointsChange : 0);

    // Update loyalty record
    const updatedLoyalty = await queryOne<CustomerLoyalty>(
      `UPDATE customer_loyalty 
       SET available_points = $1,
           total_points = $2,
           lifetime_points = $3,
           last_activity_date = NOW(),
           updated_at = NOW()
       WHERE customer_id = $4
       RETURNING *`,
      [newAvailable, newTotal, newLifetime, customerId]
    );

    // Create transaction record
    const transaction = await queryOne<PointTransaction>(
      `INSERT INTO point_transactions (customer_id, order_id, points, transaction_type, description, balance_after)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [customerId, orderId || null, pointsChange, transactionType, description, newAvailable]
    );

    // Check and update tier
    const newTier = await this.getTierForPoints(newLifetime);
    if (newTier && newTier.id !== updatedLoyalty!.current_tier_id) {
      await query(
        `UPDATE customer_loyalty SET current_tier_id = $1, tier_start_date = NOW() WHERE customer_id = $2`,
        [newTier.id, customerId]
      );
    }

    // Refresh loyalty data with tier
    const finalLoyalty = await this.getCustomerLoyalty(customerId);

    return { loyalty: finalLoyalty!, transaction: transaction! };
  },

  async incrementOrderCount(customerId: string): Promise<number> {
    const result = await queryOne<{ total_orders: number }>(
      `UPDATE customer_loyalty 
       SET total_orders = total_orders + 1, updated_at = NOW()
       WHERE customer_id = $1
       RETURNING total_orders`,
      [customerId]
    );
    return result?.total_orders || 1;
  },

  // ----------------------------------------
  // POINT TRANSACTIONS
  // ----------------------------------------

  async getTransactionHistory(customerId: string, limit = 50, offset = 0): Promise<PointTransaction[]> {
    return query<PointTransaction>(
      `SELECT * FROM point_transactions 
       WHERE customer_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [customerId, limit, offset]
    );
  },

  async getTransactionsByOrder(orderId: string): Promise<PointTransaction[]> {
    return query<PointTransaction>(
      `SELECT * FROM point_transactions WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId]
    );
  },

  // ----------------------------------------
  // MILESTONES
  // ----------------------------------------

  async getMilestones(customerId: string): Promise<LoyaltyMilestone[]> {
    return query<LoyaltyMilestone>(
      `SELECT * FROM loyalty_milestones WHERE customer_id = $1 ORDER BY achieved_at DESC`,
      [customerId]
    );
  },

  async hasMilestone(customerId: string, milestoneType: MilestoneType): Promise<boolean> {
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM loyalty_milestones 
       WHERE customer_id = $1 AND milestone_type = $2`,
      [customerId, milestoneType]
    );
    return parseInt(result?.count || '0') > 0;
  },

  async hasBirthdayMilestoneThisYear(customerId: string): Promise<boolean> {
    const currentYear = new Date().getFullYear();
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM loyalty_milestones 
       WHERE customer_id = $1 
       AND milestone_type = 'birthday' 
       AND EXTRACT(YEAR FROM achieved_at) = $2`,
      [customerId, currentYear]
    );
    return parseInt(result?.count || '0') > 0;
  },

  async awardMilestone(
    customerId: string, 
    milestoneType: MilestoneType, 
    orderId?: string
  ): Promise<{ milestone: LoyaltyMilestone; transaction: PointTransaction } | null> {
    const config = MILESTONE_CONFIG[milestoneType];
    if (!config) return null;

    // Check if already awarded (except birthday which is yearly)
    if (milestoneType === 'birthday') {
      if (await this.hasBirthdayMilestoneThisYear(customerId)) {
        return null;
      }
    } else if (milestoneType !== 'review') {
      if (await this.hasMilestone(customerId, milestoneType)) {
        return null;
      }
    }

    // Create milestone record
    const milestone = await queryOne<LoyaltyMilestone>(
      `INSERT INTO loyalty_milestones (customer_id, milestone_type, points_awarded, order_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customerId, milestoneType, config.points, orderId || null]
    );

    // Award bonus points
    const { transaction } = await this.updateCustomerPoints(
      customerId,
      config.points,
      'bonus',
      config.description,
      orderId
    );

    return { milestone: milestone!, transaction };
  },

  // ----------------------------------------
  // POINTS CALCULATION
  // ----------------------------------------

  calculatePointsForOrder(orderSubtotal: number, tierBoostPercentage: number = 0): number {
    // 1 point per €10 spent (excluding delivery and damage compensation)
    const basePoints = Math.floor(orderSubtotal / 10);
    
    // Apply tier boost
    const boostPoints = Math.floor(basePoints * (tierBoostPercentage / 100));
    
    return basePoints + boostPoints;
  },

  calculateRedemptionValue(points: number): number {
    // 100 points = €10
    return points / 10;
  },

  calculatePointsNeeded(euroValue: number): number {
    // €10 = 100 points
    return Math.ceil(euroValue * 10);
  },

  calculateMaxRedemption(subtotal: number, availablePoints: number): { maxPoints: number; maxValue: number } {
    // Max 40% of subtotal can be paid with points
    const maxValue = subtotal * 0.4;
    const maxPointsFromValue = this.calculatePointsNeeded(maxValue);
    const maxPoints = Math.min(availablePoints, maxPointsFromValue);
    
    return {
      maxPoints,
      maxValue: this.calculateRedemptionValue(maxPoints)
    };
  },

  // ----------------------------------------
  // TIER PROGRESS
  // ----------------------------------------

  calculateTierProgress(loyalty: CustomerLoyalty, tiers: LoyaltyTier[]): {
    currentTier: LoyaltyTier | null;
    nextTier: LoyaltyTier | null;
    pointsToNextTier: number;
    progressPercentage: number;
  } {
    const currentTier = loyalty.tier || tiers.find(t => t.id === loyalty.current_tier_id) || null;
    
    // Find next tier
    const sortedTiers = [...tiers].sort((a, b) => a.min_points - b.min_points);
    const currentIndex = currentTier ? sortedTiers.findIndex(t => t.id === currentTier.id) : -1;
    const nextTier = currentIndex >= 0 && currentIndex < sortedTiers.length - 1 
      ? sortedTiers[currentIndex + 1] 
      : null;

    // Calculate progress
    let pointsToNextTier = 0;
    let progressPercentage = 100;

    if (nextTier && currentTier) {
      pointsToNextTier = nextTier.min_points - loyalty.lifetime_points;
      const tierRange = nextTier.min_points - currentTier.min_points;
      const pointsInTier = loyalty.lifetime_points - currentTier.min_points;
      progressPercentage = Math.min(100, Math.max(0, (pointsInTier / tierRange) * 100));
    }

    return {
      currentTier,
      nextTier,
      pointsToNextTier: Math.max(0, pointsToNextTier),
      progressPercentage
    };
  }
};

export default LoyaltyModel;
