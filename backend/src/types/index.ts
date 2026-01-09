export type OrderStatus = 
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_delivery'
  | 'delivered'
  | 'returned'
  | 'completed'
  | 'cancelled'
  | 'payment_failed';

export type DeliveryMethod = 'DELIVERY' | 'PICKUP';

export type ReservationType = 'SOFT' | 'HARD';

export type ReservationStatus = 'PENDING' | 'ACTIVE' | 'RELEASED' | 'COMPLETED';

export type UserRole = 'customer' | 'admin';

export type ServiceLevel = 'STANDAARD' | 'LUXE';

export type PricingType = 'FORFAIT' | 'PER_DAY';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  created_at: Date;
}

export interface Customer {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  company_name: string | null;
  vat_number: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string;
  subcategory_id: string | null;
  service_level: ServiceLevel;
  price_per_day: number;
  deposit_per_item: number;
  stock_total: number;
  stock_buffer: number;
  turnaround_days: number;
  images: string[];
  specs: Record<string, unknown>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  service_level: ServiceLevel;
  pricing_type: PricingType;
  base_price: number;
  price_per_extra_day: number;
  forfait_days: number;
  min_persons: number;
  max_persons: number;
  deposit_percentage: number;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface PackageItem {
  id: string;
  package_id: string;
  product_id: string;
  quantity_per_person: number;
  is_optional: boolean;
  extra_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  deposit_total: number;
  total: number;
  delivery_method: DeliveryMethod;
  delivery_address_id: string | null;
  rental_start_date: Date;
  rental_end_date: Date;
  delivery_date: Date | null;
  return_date: Date | null;
  notes: string | null;
  admin_notes: string | null;
  mollie_payment_id: string | null;
  paid_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_type: 'package' | 'product';
  package_id: string | null;
  product_id: string | null;
  quantity: number;
  persons: number | null;
  unit_price: number;
  deposit_amount: number;
  line_total: number;
}

export interface Session {
  id: string;
  session_token: string;
  customer_id: string | null;
  cart_data: CartItem[];
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  type: 'package' | 'product';
  id: string;
  quantity: number;
  persons?: number;
  addons?: string[];
  startDate: string;
  endDate: string;
}

export interface Reservation {
  id: string;
  product_id: string;
  order_id: string | null;
  session_id: string | null;
  quantity: number;
  start_date: Date;
  end_date: Date;
  type: ReservationType;
  status: ReservationStatus;
  expires_at: Date | null;
  created_at: Date;
}

export interface Address {
  id: string;
  customer_id: string;
  type: 'delivery' | 'billing';
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  country: string;
  is_default: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
