import { PackageModel } from '../models/Package.model';
import { ProductModel } from '../models/Product.model';
import { CityModel } from '../models/City.model';
import { CartItem } from '../types';

export interface PriceBreakdown {
  subtotal: number;
  deliveryFee: number;
  damageCompensationTotal: number;
  total: number;
  items: PriceBreakdownItem[];
}

export interface PriceBreakdownItem {
  type: 'package' | 'product';
  id: string;
  name: string;
  quantity: number;
  persons?: number;
  days: number;
  unitPrice: number;
  lineTotal: number;
  damageCompensationAmount: number;
}

// Delivery fee configuration
const DELIVERY_CONFIG = {
  baseDeliveryFee: 25,
  freeDeliveryThreshold: 250,
  pickupDiscount: 0 // No discount for pickup, but no delivery fee either
};

export const PricingService = {
  /**
   * Calculate the number of rental days between two dates
   */
  calculateDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1); // Minimum 1 day
  },

  /**
   * Calculate price for a package
   */
  async calculatePackagePrice(
    packageId: string,
    persons: number,
    startDate: Date,
    endDate: Date,
    selectedAddons: string[] = []
  ): Promise<{ unitPrice: number; lineTotal: number; damageCompensationAmount: number } | null> {
    const pkg = await PackageModel.findById(packageId, true);
    if (!pkg) return null;

    const days = this.calculateDays(startDate, endDate);
    let unitPrice = 0;
    let damageCompensationAmount = 0;

    if (pkg.pricing_type === 'FORFAIT') {
      // Forfait pricing: base price for forfait_days, then extra per day
      unitPrice = pkg.base_price;
      
      const extraDays = Math.max(0, days - pkg.forfait_days);
      if (extraDays > 0) {
        unitPrice += extraDays * pkg.price_per_extra_day;
      }
    } else {
      // Per day pricing
      unitPrice = pkg.base_price * days;
    }

    // Scale by number of persons (packages are typically priced per person)
    let lineTotal = unitPrice * persons;

    // Add addon prices
    if (pkg.items && selectedAddons.length > 0) {
      for (const item of pkg.items) {
        if (item.is_optional && selectedAddons.includes(item.product_id)) {
          const addonTotal = item.extra_price * persons * days;
          // Add to line total (addons are extra)
          // Note: This is simplified - you might want separate addon line items
          lineTotal += addonTotal;
        }
      }
    }

    // Calculate damage compensation (after addons)
    damageCompensationAmount = (lineTotal * pkg.damage_compensation_percentage) / 100;

    return {
      unitPrice,
      lineTotal,
      damageCompensationAmount
    };
  },

  /**
   * Calculate price for a product
   */
  async calculateProductPrice(
    productId: string,
    quantity: number,
    startDate: Date,
    endDate: Date
  ): Promise<{ unitPrice: number; lineTotal: number; damageCompensationAmount: number } | null> {
    const product = await ProductModel.findById(productId);
    if (!product) return null;

    const days = this.calculateDays(startDate, endDate);
    
    const unitPrice = product.price_per_day * days;
    const lineTotal = unitPrice * quantity;
    const damageCompensationAmount = product.damage_compensation_per_item * quantity;

    return {
      unitPrice,
      lineTotal,
      damageCompensationAmount
    };
  },

  /**
   * Calculate full price breakdown for cart items
   */
  async calculateCartTotal(
    cartItems: CartItem[],
    deliveryMethod: 'DELIVERY' | 'PICKUP' = 'DELIVERY',
    postalCode?: string
  ): Promise<PriceBreakdown> {
    const items: PriceBreakdownItem[] = [];
    let subtotal = 0;
    let damageCompensationTotal = 0;

    for (const cartItem of cartItems) {
      const startDate = new Date(cartItem.startDate);
      const endDate = new Date(cartItem.endDate);
      const days = this.calculateDays(startDate, endDate);

      if (cartItem.type === 'package') {
        const pricing = await this.calculatePackagePrice(
          cartItem.id,
          cartItem.persons || 1,
          startDate,
          endDate,
          cartItem.addons
        );

        if (pricing) {
          const pkg = await PackageModel.findById(cartItem.id, false);
          
          items.push({
            type: 'package',
            id: cartItem.id,
            name: pkg?.name || 'Pakket',
            quantity: cartItem.quantity,
            persons: cartItem.persons,
            days,
            unitPrice: pricing.unitPrice,
            lineTotal: pricing.lineTotal * cartItem.quantity,
            damageCompensationAmount: pricing.damageCompensationAmount * cartItem.quantity
          });

          subtotal += pricing.lineTotal * cartItem.quantity;
          damageCompensationTotal += pricing.damageCompensationAmount * cartItem.quantity;
        }
      } else {
        const pricing = await this.calculateProductPrice(
          cartItem.id,
          cartItem.quantity,
          startDate,
          endDate
        );

        if (pricing) {
          const product = await ProductModel.findById(cartItem.id);
          
          items.push({
            type: 'product',
            id: cartItem.id,
            name: product?.name || 'Product',
            quantity: cartItem.quantity,
            days,
            unitPrice: pricing.unitPrice,
            lineTotal: pricing.lineTotal,
            damageCompensationAmount: pricing.damageCompensationAmount
          });

          subtotal += pricing.lineTotal;
          damageCompensationTotal += pricing.damageCompensationAmount;
        }
      }
    }

    // Calculate delivery fee
    let deliveryFee = 0;
    if (deliveryMethod === 'DELIVERY') {
      if (postalCode) {
        deliveryFee = await this.calculateDeliveryFee(postalCode, subtotal);
      } else if (subtotal < DELIVERY_CONFIG.freeDeliveryThreshold) {
        deliveryFee = DELIVERY_CONFIG.baseDeliveryFee;
      }
    }

    // NOTE: Damage compensation is NOT included in total as it's not paid upfront
    const total = subtotal + deliveryFee;

    return {
      subtotal,
      deliveryFee,
      damageCompensationTotal,
      total,
      items
    };
  },

  /**
   * Calculate delivery fee based on location (city/postal code)
   */
  async calculateDeliveryFee(
    postalCode: string,
    subtotal: number
  ): Promise<number> {
    // Free delivery above threshold
    if (subtotal >= DELIVERY_CONFIG.freeDeliveryThreshold) {
      return 0;
    }

    const city = await CityModel.findByPostalCode(postalCode);
    if (!city) {
      return DELIVERY_CONFIG.baseDeliveryFee;
    }

    return Number(city.delivery_fee) || DELIVERY_CONFIG.baseDeliveryFee;
  },

  /**
   * Format price for display (Belgian format)
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('nl-BE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  /**
   * Calculate damage compensation charge (only if damage occurred)
   */
  calculateDamageCharge(
    damageCost: number
  ): number {
    return damageCost;
  }
};
