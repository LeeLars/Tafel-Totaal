import { Request, Response } from 'express';
import { ProductComponentModel } from '../models/ProductComponent.model';

/**
 * Get components for a product set
 */
export async function getProductComponents(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const components = await ProductComponentModel.getComponentsByParentId(productId);
    
    res.json({
      success: true,
      data: components
    });
  } catch (error) {
    console.error('Error fetching product components:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product components'
    });
  }
}

/**
 * Get parent sets that contain this product
 */
export async function getProductParents(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const parents = await ProductComponentModel.getParentsByComponentId(productId);
    
    res.json({
      success: true,
      data: parents
    });
  } catch (error) {
    console.error('Error fetching product parents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product parents'
    });
  }
}

/**
 * Add a component to a product set (admin only)
 */
export async function addProductComponent(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const { component_product_id, quantity } = req.body;

    if (!component_product_id || !quantity) {
      res.status(400).json({
        success: false,
        error: 'component_product_id and quantity are required'
      });
      return;
    }

    // Prevent circular references
    if (productId === component_product_id) {
      res.status(400).json({
        success: false,
        error: 'A product cannot be a component of itself'
      });
      return;
    }

    const component = await ProductComponentModel.addComponent(
      productId,
      component_product_id,
      quantity
    );

    res.json({
      success: true,
      data: component,
      message: 'Component added to product set'
    });
  } catch (error) {
    console.error('Error adding product component:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add product component'
    });
  }
}

/**
 * Remove a component from a product set (admin only)
 */
export async function removeProductComponent(req: Request, res: Response): Promise<void> {
  try {
    const { productId, componentId } = req.params;

    await ProductComponentModel.removeComponent(productId, componentId);

    res.json({
      success: true,
      message: 'Component removed from product set'
    });
  } catch (error) {
    console.error('Error removing product component:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove product component'
    });
  }
}

/**
 * Update component quantity (admin only)
 */
export async function updateComponentQuantity(req: Request, res: Response): Promise<void> {
  try {
    const { productId, componentId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
      return;
    }

    await ProductComponentModel.updateComponentQuantity(productId, componentId, quantity);

    res.json({
      success: true,
      message: 'Component quantity updated'
    });
  } catch (error) {
    console.error('Error updating component quantity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update component quantity'
    });
  }
}

/**
 * Get all product sets
 */
export async function getAllProductSets(_req: Request, res: Response): Promise<void> {
  try {
    const sets = await ProductComponentModel.getAllSets();
    
    res.json({
      success: true,
      data: sets
    });
  } catch (error) {
    console.error('Error fetching product sets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product sets'
    });
  }
}

/**
 * Calculate available stock for a set
 */
export async function calculateSetAvailability(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      res.status(400).json({
        success: false,
        error: 'start_date and end_date are required'
      });
      return;
    }

    const startDate = new Date(start_date as string);
    const endDate = new Date(end_date as string);

    const availability = await ProductComponentModel.calculateSetAvailability(
      productId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: {
        product_id: productId,
        available_sets: availability,
        start_date: startDate,
        end_date: endDate
      }
    });
  } catch (error) {
    console.error('Error calculating set availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate set availability'
    });
  }
}
