import { Request, Response } from 'express';
// import { query, queryOne } from '../config/database';
import { AvailabilityService } from '../services/availabilityService';

export async function checkAvailability(req: Request, res: Response): Promise<void> {
  try {
    const { type, id, quantity, startDate, endDate, persons } = req.body;

    // TODO: Implement full availability check
    // 1. Get product/package stock
    // 2. Get existing reservations for date range
    // 3. Calculate available quantity (stock - reserved - buffer)
    // 4. Return availability status

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (type === 'product') {
      const result = await AvailabilityService.checkProductAvailability(id, start, end, quantity);
      res.json({ success: true, data: result });
      return;
    }

    const p = persons || 1;
    const result = await AvailabilityService.checkPackageAvailability(id, start, end, p);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ success: false, error: 'Failed to check availability' });
  }
}
