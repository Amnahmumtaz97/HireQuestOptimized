import { isNativeApp } from '@/lib/native/isNativeApp'

export type BillingCheckoutParams = {
  /**
   * @summary Your internal plan/price identifier.
   */
  planId: string
}

export interface IBillingService {
  /**
   * @summary Start the checkout flow for a plan.
   */
  startCheckout(params: BillingCheckoutParams): Promise<void>
}

class WebBillingService implements IBillingService {
  public async startCheckout(params: BillingCheckoutParams): Promise<void> {
    // Placeholder: wire to your existing Stripe/web checkout endpoint.
    window.location.href = `/app/subscription?plan=${encodeURIComponent(params.planId)}`
  }
}

class NativeBillingService implements IBillingService {
  public async startCheckout(params: BillingCheckoutParams): Promise<void> {
    // Placeholder: for digital goods/subscriptions consumed in-app,
    // you typically need Apple IAP / Google Play Billing.
    // Keep the UI flow identical and swap implementation here later.
    window.location.href = `/app/subscription?plan=${encodeURIComponent(params.planId)}`
  }
}

let cached: IBillingService | null = null

/**
 * @summary Returns the correct billing service for web vs native shell.
 */
export function getBillingService(): IBillingService {
  if (cached) return cached
  cached = isNativeApp() ? new NativeBillingService() : new WebBillingService()
  return cached
}

