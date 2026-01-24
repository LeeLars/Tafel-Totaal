import { Request, Response } from 'express';
import { CategoryModel } from '../models/Category.model';

/**
 * Get all categories
 */
export async function getAllCategories(_req: Request, res: Response): Promise<void> {
  try {
    const categories = await CategoryModel.findAllWithSubcategories(true);
    
    res.json({
      success: true,
      data: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image_url: cat.image_url,
        sort_order: cat.sort_order,
        subcategories: cat.subcategories?.map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          sort_order: sub.sort_order
        })) || []
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
}

/**
 * Get category by ID or slug
 */
export async function getCategoryById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let category = await CategoryModel.findById(id);
    if (!category) {
      category = await CategoryModel.findBySlug(id);
    }
    
    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    
    const subcategories = await CategoryModel.getSubcategories(category.id, true);
    
    res.json({
      success: true,
      data: {
        ...category,
        subcategories: subcategories.map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          sort_order: sub.sort_order
        }))
      }
    });
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch category' });
  }
}

/**
 * Get subcategories for a category
 */
export async function getSubcategories(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Try to find category by ID first, then by slug
    let category = await CategoryModel.findById(id);
    if (!category) {
      category = await CategoryModel.findBySlug(id);
    }
    
    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    
    const subcategories = await CategoryModel.getSubcategories(category.id, true);
    
    res.json({
      success: true,
      data: subcategories.map(sub => ({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        sort_order: sub.sort_order
      }))
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch subcategories' });
  }
}
