import { Request, Response } from 'express';
import { LoyaltyService } from '../services/loyaltyService';
import { LoyaltyModel } from '../models/Loyalty.model';

// ============================================
// LOYALTY CONTROLLER
// ============================================

/**
 * Get all loyalty tiers
 * GET /api/loyalty/tiers
 */
export async function getTiers(req: Request, res: Response): Promise<void> {
  try {
    const tiers = await LoyaltyService.getAllTiers();
    
    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    console.error('Get tiers error:', error);
    res.status(500).json({ success: false, error: 'Failed to get loyalty tiers' });
  }
}

/**
 * Get current customer's loyalty info
 * GET /api/loyalty/customer
 * Requires authentication
 */
export async function getCustomerLoyalty(req: Request, res: Response): Promise<void> {
  try {
    const customerId = (req as any).user?.id;
    
    if (!customerId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const loyaltyInfo = await LoyaltyService.getCustomerLoyaltyInfo(customerId);
    
    res.json({
      success: true,
      data: {
        loyalty: {
          available_points: loyaltyInfo.loyalty.available_points,
          lifetime_points: loyaltyInfo.loyalty.lifetime_points,
          total_orders: loyaltyInfo.loyalty.total_orders,
          tier_start_date: loyaltyInfo.loyalty.tier_start_date,
          last_activity_date: loyaltyInfo.loyalty.last_activity_date
        },
        tier: loyaltyInfo.loyalty.tier ? {
          id: loyaltyInfo.loyalty.tier.id,
          name: loyaltyInfo.loyalty.tier.name,
          slug: loyaltyInfo.loyalty.tier.slug,
          discount_percentage: loyaltyInfo.loyalty.tier.discount_percentage,
          points_boost_percentage: loyaltyInfo.loyalty.tier.points_boost_percentage,
          benefits: loyaltyInfo.loyalty.tier.benefits,
          color: loyaltyInfo.loyalty.tier.color,
          icon: loyaltyInfo.loyalty.tier.icon
        } : null,
        progress: loyaltyInfo.progress,
        redemption: loyaltyInfo.redemption,
        tiers: loyaltyInfo.tiers.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          min_points: t.min_points,
          max_points: t.max_points,
          discount_percentage: t.discount_percentage,
          points_boost_percentage: t.points_boost_percentage,
          benefits: t.benefits,
          color: t.color,
          icon: t.icon
        }))
      }
    });
  } catch (error) {
    console.error('Get customer loyalty error:', error);
    res.status(500).json({ success: false, error: 'Failed to get loyalty info' });
  }
}

/**
 * Get customer's point transaction history
 * GET /api/loyalty/history
 * Requires authentication
 */
export async function getTransactionHistory(req: Request, res: Response): Promise<void> {
  try {
    const customerId = (req as any).user?.id;
    
    if (!customerId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const transactions = await LoyaltyService.getTransactionHistory(customerId, limit, offset);
    
    res.json({
      success: true,
      data: transactions.map(t => ({
        id: t.id,
        points: t.points,
        transaction_type: t.transaction_type,
        description: t.description,
        balance_after: t.balance_after,
        created_at: t.created_at
      }))
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ success: false, error: 'Failed to get transaction history' });
  }
}

/**
 * Calculate discount for checkout
 * POST /api/loyalty/calculate-discount
 * Body: { subtotal: number, points_to_redeem?: number }
 */
export async function calculateDiscount(req: Request, res: Response): Promise<void> {
  try {
    const customerId = (req as any).user?.id;
    const { subtotal, points_to_redeem = 0 } = req.body;

    if (!subtotal || subtotal <= 0) {
      res.status(400).json({ success: false, error: 'Valid subtotal is required' });
      return;
    }

    // If not authenticated, return no discount
    if (!customerId) {
      res.json({
        success: true,
        data: {
          tier_discount: 0,
          tier_discount_percentage: 0,
          points_redemption_discount: 0,
          points_to_redeem: 0,
          total_discount: 0,
          final_subtotal: subtotal,
          points_to_earn: 0,
          max_redeemable_points: 0,
          max_redeemable_value: 0,
          is_authenticated: false
        }
      });
      return;
    }

    const discount = await LoyaltyService.calculateCheckoutDiscount(
      customerId,
      subtotal,
      points_to_redeem
    );
    
    res.json({
      success: true,
      data: {
        tier_discount: discount.tierDiscount,
        tier_discount_percentage: discount.tierDiscountPercentage,
        points_redemption_discount: discount.pointsRedemptionDiscount,
        points_to_redeem: discount.pointsToRedeem,
        total_discount: discount.totalDiscount,
        final_subtotal: discount.finalSubtotal,
        points_to_earn: discount.pointsToEarn,
        max_redeemable_points: discount.maxRedeemablePoints,
        max_redeemable_value: discount.maxRedeemableValue,
        is_authenticated: true
      }
    });
  } catch (error) {
    console.error('Calculate discount error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate discount' });
  }
}

/**
 * Redeem points during checkout
 * POST /api/loyalty/redeem
 * Body: { order_id: string, points: number }
 * Requires authentication
 */
export async function redeemPoints(req: Request, res: Response): Promise<void> {
  try {
    const customerId = (req as any).user?.id;
    
    if (!customerId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { order_id, points } = req.body;

    if (!order_id || !points || points <= 0) {
      res.status(400).json({ success: false, error: 'Valid order_id and points are required' });
      return;
    }

    const result = await LoyaltyService.redeemPoints(customerId, order_id, points);
    
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.json({
      success: true,
      data: {
        points_redeemed: result.pointsRedeemed,
        discount_value: result.discountValue
      }
    });
  } catch (error) {
    console.error('Redeem points error:', error);
    res.status(500).json({ success: false, error: 'Failed to redeem points' });
  }
}

/**
 * Get customer milestones
 * GET /api/loyalty/milestones
 * Requires authentication
 */
export async function getMilestones(req: Request, res: Response): Promise<void> {
  try {
    const customerId = (req as any).user?.id;
    
    if (!customerId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const milestones = await LoyaltyModel.getMilestones(customerId);
    
    res.json({
      success: true,
      data: milestones.map(m => ({
        id: m.id,
        milestone_type: m.milestone_type,
        points_awarded: m.points_awarded,
        achieved_at: m.achieved_at
      }))
    });
  } catch (error) {
    console.error('Get milestones error:', error);
    res.status(500).json({ success: false, error: 'Failed to get milestones' });
  }
}

/**
 * Admin: Adjust customer points
 * POST /api/loyalty/admin/adjust
 * Body: { customer_id: string, points: number, reason: string }
 * Requires admin authentication
 */
export async function adminAdjustPoints(req: Request, res: Response): Promise<void> {
  try {
    const adminId = (req as any).user?.id;
    const { customer_id, points, reason } = req.body;

    if (!customer_id || points === undefined || !reason) {
      res.status(400).json({ success: false, error: 'customer_id, points, and reason are required' });
      return;
    }

    const result = await LoyaltyService.adjustPoints(customer_id, points, reason, adminId);
    
    res.json({
      success: true,
      data: {
        new_balance: result.newBalance
      }
    });
  } catch (error) {
    console.error('Admin adjust points error:', error);
    res.status(500).json({ success: false, error: 'Failed to adjust points' });
  }
}

/**
 * Admin: Get customer loyalty info
 * GET /api/loyalty/admin/customer/:customerId
 * Requires admin authentication
 */
export async function adminGetCustomerLoyalty(req: Request, res: Response): Promise<void> {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      res.status(400).json({ success: false, error: 'Customer ID is required' });
      return;
    }

    const loyaltyInfo = await LoyaltyService.getCustomerLoyaltyInfo(customerId);
    const transactions = await LoyaltyService.getTransactionHistory(customerId, 20);
    const milestones = await LoyaltyModel.getMilestones(customerId);
    
    res.json({
      success: true,
      data: {
        loyalty: loyaltyInfo.loyalty,
        tier: loyaltyInfo.loyalty.tier,
        progress: loyaltyInfo.progress,
        recent_transactions: transactions,
        milestones
      }
    });
  } catch (error) {
    console.error('Admin get customer loyalty error:', error);
    res.status(500).json({ success: false, error: 'Failed to get customer loyalty info' });
  }
}
