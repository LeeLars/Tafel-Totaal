import { pool } from '../config/database';

export interface TagGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  tag_group_id: string;
  name: string;
  slug: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
}

export const TagModel = {
  /**
   * Get all tag groups with their tags
   */
  async findAllGroups(activeOnly: boolean = true): Promise<TagGroup[]> {
    const groupsQuery = `
      SELECT id, name, slug, description, sort_order, is_active
      FROM tag_groups
      ${activeOnly ? 'WHERE is_active = true' : ''}
      ORDER BY sort_order
    `;
    const groupsResult = await pool.query(groupsQuery);
    
    const tagsQuery = `
      SELECT id, tag_group_id, name, slug, icon, sort_order, is_active
      FROM tags
      ${activeOnly ? 'WHERE is_active = true' : ''}
      ORDER BY sort_order
    `;
    const tagsResult = await pool.query(tagsQuery);
    
    // Group tags by tag_group_id
    const tagsByGroup: Record<string, Tag[]> = {};
    tagsResult.rows.forEach((tag: Tag) => {
      if (!tagsByGroup[tag.tag_group_id]) {
        tagsByGroup[tag.tag_group_id] = [];
      }
      tagsByGroup[tag.tag_group_id].push(tag);
    });
    
    // Attach tags to groups
    return groupsResult.rows.map((group: TagGroup) => ({
      ...group,
      tags: tagsByGroup[group.id] || []
    }));
  },

  /**
   * Get all tags (flat list)
   */
  async findAllTags(activeOnly: boolean = true): Promise<Tag[]> {
    const query = `
      SELECT t.id, t.tag_group_id, t.name, t.slug, t.icon, t.sort_order, t.is_active,
             g.name as group_name, g.slug as group_slug
      FROM tags t
      JOIN tag_groups g ON t.tag_group_id = g.id
      ${activeOnly ? 'WHERE t.is_active = true AND g.is_active = true' : ''}
      ORDER BY g.sort_order, t.sort_order
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  /**
   * Get tags for a product
   */
  async findByProductId(productId: string): Promise<Tag[]> {
    const query = `
      SELECT t.id, t.tag_group_id, t.name, t.slug, t.icon, t.sort_order, t.is_active,
             g.name as group_name, g.slug as group_slug
      FROM tags t
      JOIN product_tags pt ON t.id = pt.tag_id
      JOIN tag_groups g ON t.tag_group_id = g.id
      WHERE pt.product_id = $1 AND t.is_active = true
      ORDER BY g.sort_order, t.sort_order
    `;
    const result = await pool.query(query, [productId]);
    return result.rows;
  },

  /**
   * Set tags for a product (replaces existing)
   */
  async setProductTags(productId: string, tagIds: string[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Remove existing tags
      await client.query('DELETE FROM product_tags WHERE product_id = $1', [productId]);
      
      // Add new tags
      if (tagIds.length > 0) {
        const values = tagIds.map((tagId, i) => `($1, $${i + 2})`).join(', ');
        await client.query(
          `INSERT INTO product_tags (product_id, tag_id) VALUES ${values}`,
          [productId, ...tagIds]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Add a tag to a product
   */
  async addProductTag(productId: string, tagId: string): Promise<void> {
    await pool.query(
      'INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [productId, tagId]
    );
  },

  /**
   * Remove a tag from a product
   */
  async removeProductTag(productId: string, tagId: string): Promise<void> {
    await pool.query(
      'DELETE FROM product_tags WHERE product_id = $1 AND tag_id = $2',
      [productId, tagId]
    );
  }
};
