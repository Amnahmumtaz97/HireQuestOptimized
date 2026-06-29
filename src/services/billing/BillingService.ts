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

let cached: IBillingService | null = null

/**
 * @summary Returns the billing service for web checkout.
 */
export function getBillingService(): IBillingService {
  if (cached) return cached
  cached = new WebBillingService()
  return cached
}
