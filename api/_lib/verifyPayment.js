const REFERENCE_PATTERN = /^PLUME-\d+-[a-z0-9]+$/i;

export function getVerifiedPaymentSummary(transaction, reference, integrationId) {
  const cleanReference = String(reference || "").trim();
  const expectedIntegrationIds = (Array.isArray(integrationId)
    ? integrationId
    : [integrationId]
  )
    .map(Number)
    .filter((id) => Number.isSafeInteger(id) && id > 0);
  const actualIntegrationId = Number(transaction?.integration_id);
  const order = transaction?.order;
  const amountCents = Number(transaction?.amount_cents);
  const orderAmountCents = Number(order?.amount_cents);

  if (!REFERENCE_PATTERN.test(cleanReference)) return null;
  if (order?.merchant_order_id !== cleanReference) return null;
  if (!expectedIntegrationIds.includes(actualIntegrationId)) return null;
  if (!order?.id || !Number.isSafeInteger(amountCents) || amountCents < 1) {
    return null;
  }
  if (orderAmountCents !== amountCents) return null;
  if (transaction?.currency !== "EGP" || order?.currency !== "EGP") return null;

  const cancelled =
    transaction?.is_cancel === true ||
    transaction?.is_void === true ||
    transaction?.is_voided === true ||
    order?.is_cancel === true ||
    order?.is_canceled === true;
  const refunded =
    transaction?.is_refund === true ||
    transaction?.is_refunded === true ||
    Number(transaction?.refunded_amount_cents || 0) > 0 ||
    order?.is_returned === true;

  let status = "failed";
  if (transaction?.pending === true) {
    status = "pending";
  } else if (refunded) {
    status = "refunded";
  } else if (cancelled) {
    status = "cancelled";
  } else if (transaction?.success === true && transaction?.error_occured !== true) {
    status = "success";
  }

  return {
    status,
    orderNumber: String(order.id),
    reference: cleanReference,
    amountCents,
    currency: "EGP",
    paidAt: String(transaction?.paid_at || transaction?.created_at || ""),
  };
}
