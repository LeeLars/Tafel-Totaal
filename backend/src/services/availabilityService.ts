import { ReservationModel } from '../models/Reservation.model';
import { ProductModel } from '../models/Product.model';
import { PackageModel } from '../models/Package.model';

export interface AvailabilityCheckResult {
  available: boolean;
  availableQuantity: number;
  requestedQuantity: number;
  stockTotal: number;
  reservedQuantity: number;
  message?: string;
}

export interface PackageAvailabilityResult {
  available: boolean;
  packageId: string;
  persons: number;
  unavailableItems: {
    productId: string;
    productName: string;
    required: number;
    available: number;
  }[];
}

export const AvailabilityService = {
  /**
   * Check if a product is available for the given dates and quantity
   */
  async checkProductAvailability(
    productId: string,
    startDate: Date,
    endDate: Date,
    quantity: number,
    excludeSessionId?: string
  ): Promise<AvailabilityCheckResult> {
    const product = await ProductModel.findById(productId);
    
    if (!product) {
      return {
        available: false,
        availableQuantity: 0,
        requestedQuantity: quantity,
        stockTotal: 0,
        reservedQuantity: 0,
        message: 'Product niet gevonden'
      };
    }

    if (!product.is_active) {
      return {
        available: false,
        availableQuantity: 0,
        requestedQuantity: quantity,
        stockTotal: product.stock_total,
        reservedQuantity: 0,
        message: 'Product is niet beschikbaar'
      };
    }

    // Add turnaround days to the date range
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + product.turnaround_days);

    const result = await ReservationModel.checkAvailability(
      productId,
      startDate,
      adjustedEndDate,
      quantity
    );

    // If excluding a session, recalculate without that session's reservations
    if (excludeSessionId) {
      const sessionReserved = await ReservationModel.getReservedQuantity(
        productId,
        startDate,
        adjustedEndDate,
        excludeSessionId
      );
      
      const adjustedAvailable = product.stock_total - sessionReserved;
      
      return {
        available: adjustedAvailable >= quantity,
        availableQuantity: Math.max(adjustedAvailable, 0),
        requestedQuantity: quantity,
        stockTotal: product.stock_total,
        reservedQuantity: sessionReserved,
        message: adjustedAvailable >= quantity ? undefined : `Slechts ${Math.max(adjustedAvailable, 0)} beschikbaar`
      };
    }

    return {
      available: result.available,
      availableQuantity: result.available_quantity,
      requestedQuantity: quantity,
      stockTotal: result.stock_total,
      reservedQuantity: result.reserved_quantity,
      message: result.available ? undefined : `Slechts ${result.available_quantity} beschikbaar`
    };
  },

  /**
   * Check if a package is available for the given dates and number of persons
   */
  async checkPackageAvailability(
    packageId: string,
    startDate: Date,
    endDate: Date,
    persons: number,
    excludeSessionId?: string
  ): Promise<PackageAvailabilityResult> {
    const pkg = await PackageModel.findById(packageId, true);
    
    if (!pkg || !pkg.items) {
      return {
        available: false,
        packageId,
        persons,
        unavailableItems: []
      };
    }

    // Check if persons is within range
    if (persons < pkg.min_persons || persons > pkg.max_persons) {
      return {
        available: false,
        packageId,
        persons,
        unavailableItems: [{
          productId: '',
          productName: 'Aantal personen',
          required: persons,
          available: 0
        }]
      };
    }

    const unavailableItems: PackageAvailabilityResult['unavailableItems'] = [];

    // Check each required (non-optional) item
    for (const item of pkg.items) {
      if (item.is_optional) continue;

      const requiredQuantity = item.quantity_per_person * persons;
      const availability = await this.checkProductAvailability(
        item.product_id,
        startDate,
        endDate,
        requiredQuantity,
        excludeSessionId
      );

      if (!availability.available) {
        unavailableItems.push({
          productId: item.product_id,
          productName: item.product_name || 'Onbekend product',
          required: requiredQuantity,
          available: availability.availableQuantity
        });
      }
    }

    return {
      available: unavailableItems.length === 0,
      packageId,
      persons,
      unavailableItems
    };
  },

  /**
   * Create soft reservations for cart items
   */
  async createSoftReservationsForProduct(
    productId: string,
    sessionId: string,
    quantity: number,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const availability = await this.checkProductAvailability(
      productId,
      startDate,
      endDate,
      quantity,
      sessionId
    );

    if (!availability.available) {
      return false;
    }

    await ReservationModel.createSoftReservation({
      product_id: productId,
      session_id: sessionId,
      quantity,
      start_date: startDate,
      end_date: endDate
    });

    return true;
  },

  /**
   * Create soft reservations for a package
   */
  async createSoftReservationsForPackage(
    packageId: string,
    sessionId: string,
    persons: number,
    startDate: Date,
    endDate: Date,
    selectedAddons: string[] = []
  ): Promise<boolean> {
    const pkg = await PackageModel.findById(packageId, true);
    if (!pkg || !pkg.items) return false;

    // Check availability first
    const availability = await this.checkPackageAvailability(
      packageId,
      startDate,
      endDate,
      persons,
      sessionId
    );

    if (!availability.available) {
      return false;
    }

    // Create reservations for each item
    for (const item of pkg.items) {
      // Skip optional items unless selected as addon
      if (item.is_optional && !selectedAddons.includes(item.product_id)) {
        continue;
      }

      const quantity = item.quantity_per_person * persons;
      
      await ReservationModel.createSoftReservation({
        product_id: item.product_id,
        session_id: sessionId,
        quantity,
        start_date: startDate,
        end_date: endDate
      });
    }

    return true;
  },

  /**
   * Convert soft reservations to hard reservations when order is paid
   */
  async convertToHardReservations(sessionId: string, orderId: string): Promise<number> {
    return ReservationModel.convertToHard(sessionId, orderId);
  },

  /**
   * Release all reservations for a session (e.g., when cart is cleared or session expires)
   */
  async releaseSessionReservations(sessionId: string): Promise<number> {
    return ReservationModel.releaseBySession(sessionId);
  },

  /**
   * Release all reservations for an order (e.g., when order is cancelled)
   */
  async releaseOrderReservations(orderId: string): Promise<number> {
    return ReservationModel.releaseByOrder(orderId);
  },

  /**
   * Complete reservations when rental is returned
   */
  async completeReservations(orderId: string): Promise<number> {
    return ReservationModel.complete(orderId);
  },

  /**
   * Cleanup expired soft reservations (should be run periodically)
   */
  async cleanupExpiredReservations(): Promise<number> {
    return ReservationModel.cleanupExpired();
  },

  /**
   * Get available dates for a product in a date range
   */
  async getAvailableDates(
    productId: string,
    fromDate: Date,
    toDate: Date,
    quantity: number
  ): Promise<Date[]> {
    const availableDates: Date[] = [];
    const currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + 1);

      const availability = await this.checkProductAvailability(
        productId,
        currentDate,
        endDate,
        quantity
      );

      if (availability.available) {
        availableDates.push(new Date(currentDate));
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableDates;
  }
};
