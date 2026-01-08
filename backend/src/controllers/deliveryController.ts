import { Request, Response } from 'express';
import { CityModel } from '../models/City.model';

export async function getDeliveryZone(req: Request, res: Response): Promise<void> {
  try {
    const postalCode = (req.query.postalCode as string | undefined)?.trim();

    if (!postalCode) {
      const cities = await CityModel.listActive();
      res.json({ success: true, data: cities });
      return;
    }

    const city = await CityModel.findByPostalCode(postalCode);

    if (!city) {
      res.status(404).json({ success: false, error: 'No delivery zone found for this postal code' });
      return;
    }

    res.json({
      success: true,
      data: {
        postalCode,
        deliveryFee: city.delivery_fee,
        city: {
          id: city.id,
          name: city.name,
          province: city.province,
          slug: city.slug
        }
      }
    });
  } catch (error) {
    console.error('Get delivery zone error:', error);
    res.status(500).json({ success: false, error: 'Failed to get delivery zone' });
  }
}
