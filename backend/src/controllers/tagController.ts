import { Request, Response } from 'express';
import { TagModel } from '../models/Tag.model';

/**
 * Get all tag groups with their tags
 */
export async function getAllTagGroups(_req: Request, res: Response): Promise<void> {
  try {
    const groups = await TagModel.findAllGroups(true);
    
    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching tag groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tag groups'
    });
  }
}

/**
 * Get all tags (flat list)
 */
export async function getAllTags(_req: Request, res: Response): Promise<void> {
  try {
    const tags = await TagModel.findAllTags(true);
    
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tags'
    });
  }
}

/**
 * Get tags for a specific product
 */
export async function getProductTags(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const tags = await TagModel.findByProductId(productId);
    
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching product tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product tags'
    });
  }
}

/**
 * Set tags for a product (admin only)
 */
export async function setProductTags(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const { tag_ids } = req.body;
    
    if (!Array.isArray(tag_ids)) {
      res.status(400).json({
        success: false,
        error: 'tag_ids must be an array'
      });
      return;
    }
    
    await TagModel.setProductTags(productId, tag_ids);
    
    res.json({
      success: true,
      message: 'Product tags updated'
    });
  } catch (error) {
    console.error('Error setting product tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set product tags'
    });
  }
}
