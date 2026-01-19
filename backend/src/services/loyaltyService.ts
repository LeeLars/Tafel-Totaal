import { LoyaltyModel, CustomerLoyalty, LoyaltyTier, PointTransaction, MilestoneType, MILESTONE_CONFIG } from '../models/Loyalty.model';
import { CustomerModel } from '../models/Customer.model';

// ============================================
// LOYALTY SERVICE
// ============================================

export const LoyaltyService = {
  // ----------------------------------------
  // GET LOYALTY INFO
  // ----------------------------------------

  async getCustomerLoyaltyInfo(customerId: string): Promise<{
    loyalty: CustomerLoyalty;
    tiers: LoyaltyTier[];
    progress: {
      currentTier: LoyaltyTier | null;
      nextTier: LoyaltyTier | null;
      pointsToNextTier: number;
      progressPercentage: number;
    };
    redemption: {
      availablePoints: number;
      availableValue: number;
    };
  }> {
    // Get or initialize loyalty
    let loyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    if (!loyalty) {
      loyalty = await LoyaltyModel.initializeCustomerLoyalty(customerId);
      loyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    }

    // Get all tiers
    const tiers = await LoyaltyModel.getAllTiers();

    // Calculate progress
    const progress = LoyaltyModel.calculateTierProgress(loyalty!, tiers);

    // Calculate redemption value
    const redemption = {
      availablePoints: loyalty!.available_points,
      availableValue: LoyaltyModel.calculateRedemptionValue(loyalty!.available_points)
    };

    return {
      loyalty: loyalty!,
      tiers,
      progress,
      redemption
    };
  },

  async getTransactionHistory(customerId: string, limit = 50, offset = 0): Promise<PointTransaction[]> {
    return LoyaltyModel.getTransactionHistory(customerId, limit, offset);
  },

  // ----------------------------------------
  // POINTS EARNING
  // ----------------------------------------

  async awardPointsForOrder(
    customerId: string,
    orderId: string,
    orderSubtotal: number
  ): Promise<{
    pointsEarned: number;
    bonusPoints: number;
    milestones: Array<{ type: MilestoneType; points: number }>;
    newTotalPoints: number;
    tierUpgrade: boolean;
    newTier: LoyaltyTier | null;
  }> {
    // Get current loyalty info
    let loyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    if (!loyalty) {
      loyalty = await LoyaltyModel.initializeCustomerLoyalty(customerId);
      loyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    }

    const previousTierId = loyalty!.current_tier_id;
    const tierBoost = loyalty!.tier?.points_boost_percentage || 0;

    // Calculate base points
    const pointsEarned = LoyaltyModel.calculatePointsForOrder(orderSubtotal, tierBoost);

    // Award base points
    await LoyaltyModel.updateCustomerPoints(
      customerId,
      pointsEarned,
      'earned',
      `Punten verdiend bij bestelling`,
      orderId
    );

    // Increment order count
    const totalOrders = await LoyaltyModel.incrementOrderCount(customerId);

    // Check and award milestones
    const milestones: Array<{ type: MilestoneType; points: number }> = [];
    let bonusPoints = 0;

    // First order milestone
    if (totalOrders === 1) {
      const result = await LoyaltyModel.awardMilestone(customerId, 'first_order', orderId);
      if (result) {
        milestones.push({ type: 'first_order', points: MILESTONE_CONFIG.first_order.points });
        bonusPoints += MILESTONE_CONFIG.first_order.points;
      }
    }

    // Order count milestones
    const orderMilestones: MilestoneType[] = ['orders_5', 'orders_10', 'orders_25', 'orders_50'];
    for (const milestoneType of orderMilestones) {
      const config = MILESTONE_CONFIG[milestoneType];
      if (config.orderCount && totalOrders === config.orderCount) {
        const result = await LoyaltyModel.awardMilestone(customerId, milestoneType, orderId);
        if (result) {
          milestones.push({ type: milestoneType, points: config.points });
          bonusPoints += config.points;
        }
      }
    }

    // Check for birthday milestone
    await this.checkBirthdayMilestone(customerId);

    // Get updated loyalty info
    const updatedLoyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    const tierUpgrade = updatedLoyalty!.current_tier_id !== previousTierId;
    const newTier = tierUpgrade ? updatedLoyalty!.tier || null : null;

    return {
      pointsEarned,
      bonusPoints,
      milestones,
      newTotalPoints: updatedLoyalty!.available_points,
      tierUpgrade,
      newTier
    };
  },

  async checkBirthdayMilestone(customerId: string): Promise<boolean> {
    // Get customer birthday
    const customer = await CustomerModel.findById(customerId);
    if (!customer?.date_of_birth) return false;

    const today = new Date();
    const birthday = new Date(customer.date_of_birth);

    // Check if today is birthday (same month and day)
    if (today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate()) {
      const result = await LoyaltyModel.awardMilestone(customerId, 'birthday');
      return !!result;
    }

    return false;
  },

  async awardReviewPoints(customerId: string): Promise<{ points: number; transaction: PointTransaction } | null> {
    const result = await LoyaltyModel.awardMilestone(customerId, 'review');
    if (result) {
      return { points: MILESTONE_CONFIG.review.points, transaction: result.transaction };
    }
    return null;
  },

  // ----------------------------------------
  // POINTS REDEMPTION
  // ----------------------------------------

  async calculateCheckoutDiscount(
    customerId: string,
    orderSubtotal: number,
    pointsToRedeem: number = 0
  ): Promise<{
    tierDiscount: number;
    tierDiscountPercentage: number;
    pointsRedemptionDiscount: number;
    pointsToRedeem: number;
    totalDiscount: number;
    finalSubtotal: number;
    pointsToEarn: number;
    maxRedeemablePoints: number;
    maxRedeemableValue: number;
  }> {
    // Get loyalty info
    let loyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    if (!loyalty) {
      loyalty = await LoyaltyModel.initializeCustomerLoyalty(customerId);
      loyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    }

    const tier = loyalty!.tier;
    const tierDiscountPercentage = tier?.discount_percentage || 0;
    const tierBoost = tier?.points_boost_percentage || 0;

    // Calculate tier discount
    const tierDiscount = orderSubtotal * (tierDiscountPercentage / 100);
    const subtotalAfterTierDiscount = orderSubtotal - tierDiscount;

    // Calculate max redeemable points (40% of subtotal after tier discount)
    const { maxPoints, maxValue } = LoyaltyModel.calculateMaxRedemption(
      subtotalAfterTierDiscount,
      loyalty!.available_points
    );

    // Validate points to redeem
    const validPointsToRedeem = Math.min(pointsToRedeem, maxPoints);
    const pointsRedemptionDiscount = LoyaltyModel.calculateRedemptionValue(validPointsToRedeem);

    // Calculate totals
    const totalDiscount = tierDiscount + pointsRedemptionDiscount;
    const finalSubtotal = Math.max(0, orderSubtotal - totalDiscount);

    // Calculate points to earn (based on final subtotal, not discounted amount)
    const pointsToEarn = LoyaltyModel.calculatePointsForOrder(orderSubtotal, tierBoost);

    return {
      tierDiscount: Math.round(tierDiscount * 100) / 100,
      tierDiscountPercentage,
      pointsRedemptionDiscount: Math.round(pointsRedemptionDiscount * 100) / 100,
      pointsToRedeem: validPointsToRedeem,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      finalSubtotal: Math.round(finalSubtotal * 100) / 100,
      pointsToEarn,
      maxRedeemablePoints: maxPoints,
      maxRedeemableValue: Math.round(maxValue * 100) / 100
    };
  },

  async redeemPoints(
    customerId: string,
    orderId: string,
    pointsToRedeem: number
  ): Promise<{ success: boolean; pointsRedeemed: number; discountValue: number; error?: string }> {
    // Get loyalty info
    const loyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    if (!loyalty) {
      return { success: false, pointsRedeemed: 0, discountValue: 0, error: 'Loyalty account not found' };
    }

    // Validate points
    if (pointsToRedeem <= 0) {
      return { success: false, pointsRedeemed: 0, discountValue: 0, error: 'Invalid points amount' };
    }

    if (pointsToRedeem > loyalty.available_points) {
      return { success: false, pointsRedeemed: 0, discountValue: 0, error: 'Insufficient points' };
    }

    // Deduct points
    const discountValue = LoyaltyModel.calculateRedemptionValue(pointsToRedeem);
    
    await LoyaltyModel.updateCustomerPoints(
      customerId,
      -pointsToRedeem,
      'redeemed',
      `${pointsToRedeem} punten ingewisseld voor €${discountValue.toFixed(2)} korting`,
      orderId
    );

    return {
      success: true,
      pointsRedeemed: pointsToRedeem,
      discountValue: Math.round(discountValue * 100) / 100
    };
  },

  // ----------------------------------------
  // TIER INFO
  // ----------------------------------------

  async getAllTiers(): Promise<LoyaltyTier[]> {
    return LoyaltyModel.getAllTiers();
  },

  async getNextTierInfo(customerId: string): Promise<{
    currentTier: LoyaltyTier | null;
    nextTier: LoyaltyTier | null;
    pointsNeeded: number;
    estimatedOrdersNeeded: number;
  } | null> {
    const loyalty = await LoyaltyModel.getCustomerLoyalty(customerId);
    if (!loyalty) return null;

    const tiers = await LoyaltyModel.getAllTiers();
    const progress = LoyaltyModel.calculateTierProgress(loyalty, tiers);

    // Estimate orders needed (assuming average order of €200)
    const avgOrderValue = 200;
    const avgPointsPerOrder = Math.floor(avgOrderValue / 10);
    const estimatedOrdersNeeded = progress.pointsToNextTier > 0 
      ? Math.ceil(progress.pointsToNextTier / avgPointsPerOrder)
      : 0;

    return {
      currentTier: progress.currentTier,
      nextTier: progress.nextTier,
      pointsNeeded: progress.pointsToNextTier,
      estimatedOrdersNeeded
    };
  },

  // ----------------------------------------
  // ADMIN FUNCTIONS
  // ----------------------------------------

  async adjustPoints(
    customerId: string,
    points: number,
    reason: string,
    adminId?: string
  ): Promise<{ success: boolean; newBalance: number }> {
    const description = `Handmatige aanpassing: ${reason}${adminId ? ` (door admin)` : ''}`;
    
    const { loyalty } = await LoyaltyModel.updateCustomerPoints(
      customerId,
      points,
      'adjustment',
      description
    );

    return {
      success: true,
      newBalance: loyalty.available_points
    };
  },

  async expireInactivePoints(inactiveDays: number = 730): Promise<number> {
    // This would be called by a scheduled job
    // For now, just return 0 as we haven't implemented point expiration yet
    console.log(`Would expire points for customers inactive for ${inactiveDays} days`);
    return 0;
  }
};

export default LoyaltyService;
