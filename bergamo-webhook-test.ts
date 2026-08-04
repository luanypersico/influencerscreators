process.env.HOTMART_HOTTOK = "test-hottok-" + "s3cr3t";
import { createClient } from "@supabase/supabase-js";
const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { handleHotmartWebhook } = await import("/dev-server/src/lib/hotmart.server.ts");

const HOTTOK = process.env.HOTMART_HOTTOK!;
const UCODE = "ucode-test-" + Date.now();
const OFFER = "offer27";
const BUYER = `comprador.teste.${Date.now()}@example.com`;
const BOLETO_BUYER = `boleto.teste.${Date.now()}@example.com`;

let pass = 0, fail = 0;
function check(name: string, ok: boolean, extra?: unknown) {
  if (ok) { pass++; console.log("PASS  " + name); }
  else { fail++; console.log("FAIL  " + name, JSON.stringify(extra)); }
}

const { data: product } = await admin.from("products").select("id,checkout_url,price_cents,status").eq("slug", "bergamo").single();
const productId = product!.id;

const { data: integ } = await admin.from("payment_integrations").insert({
  provider: "hotmart", product_id: productId, environment: "test",
  external_product_ucode: UCODE, external_product_id: "999", external_offer_id: OFFER, active: true,
}).select("id").single();

function payload(o: {event: string; tx: string; ts: number; email?: string; ucode?: string; offer?: string; amount?: number; omitTx?: boolean; id?: string}) {
  const purchase: Record<string, unknown> = {
    offer: { code: o.offer ?? OFFER },
    price: { value: o.amount ?? 27, currency_value: "BRL" },
    status: o.event.replace("PURCHASE_", ""),
  };
  if (!o.omitTx) purchase.transaction = o.tx;
  return {
    id: o.id ?? `${o.event}-${o.tx}-${o.ts}`,
    event: o.event,
    creation_date: o.ts,
    data: {
      product: { id: 999, ucode: o.ucode ?? UCODE, name: "Bergamo" },
      buyer: { email: o.email ?? BUYER, name: "Comprador Teste" },
      purchase,
    },
  };
}
async function post(body: unknown, hottok = HOTTOK) {
  const res = await handleHotmartWebhook(new Request("http://localhost/api/public/webhooks/hotmart", {
    method: "POST", headers: { "content-type": "application/json", "x-hotmart-hottok": hottok },
    body: JSON.stringify(body),
  }));
  return { status: res.status, body: await res.json() };
}
const accessState = async () => {
  const uid = (await admin.rpc("find_user_id_by_email", { _email: BUYER })).data;
  if (!uid) return null;
  const { data } = await admin.from("product_access").select("revoked_at,suspended_at,status_reason").eq("user_id", uid).eq("product_id", productId).maybeSingle();
  return data;
};
const orderCount = async (tx?: string) => {
  let q = admin.from("orders").select("id,status,user_id,provider_ref", { count: "exact" }).eq("provider", "hotmart").eq("product_id", productId);
  if (tx) q = q.eq("provider_ref", tx);
  const { data, count } = await q;
  return { count: count ?? 0, rows: data ?? [] };
};

// ---- 1. método
const getRes = await handleHotmartWebhook(new Request("http://localhost/x", { method: "GET" }));
check("GET rejeitado com 405", getRes.status === 405, getRes.status);

// ---- 2. hottok inválido
let r = await post(payload({ event: "PURCHASE_APPROVED", tx: "TXBAD", ts: Date.now() }), "errado");
check("hottok inválido = 401 sem persistir", r.status === 401 && (await orderCount("TXBAD")).count === 0, r);

// ---- 3. payload inválido
r = await post(payload({ event: "PURCHASE_APPROVED", tx: "TXINV", ts: Date.now(), omitTx: true }));
check("payload sem transação = 400", r.status === 400, r);

// ---- 4. outro produto
r = await post(payload({ event: "PURCHASE_APPROVED", tx: "TXOTHER", ts: Date.now(), ucode: "ucode-de-outro-produto", email: "outro@example.com" }));
const otherEvent = await admin.from("webhook_events").select("id").eq("transaction_ref", "TXOTHER");
const otherUser = await admin.rpc("find_user_id_by_email", { _email: "outro@example.com" });
check("outro produto = 200 ignored, sem evento/dados pessoais",
  r.status === 200 && r.body.status === "ignored" && (otherEvent.data ?? []).length === 0 && !otherUser.data, r);

// ---- 15. usuário Auth criado + falha da RPC, depois reprocessamento
const tsA = Date.now();
// simula "identidade criada, RPC falhou": usuário existe, nada comercial gravado
const preCreated = await admin.auth.admin.createUser({ email: BUYER, email_confirm: false });
const preUid = preCreated.data.user!.id;
const failed = await admin.rpc("process_hotmart_event", {
  p_integration_id: integ!.id, p_product_id: productId,
  p_external_event_id: "FALHA-SIMULADA-TXA", p_event_type: "PURCHASE_APPROVED",
  p_event_occurred_at: new Date(tsA).toISOString(), p_transaction_ref: "TXA",
  p_purchase_status: "APPROVED", p_payload: {},
  p_user_id: "00000000-0000-0000-0000-000000000000",
  p_buyer_email: BUYER, p_buyer_name: "Comprador Teste", p_amount_cents: 2700,
} as never);
const evAfterFail = await admin.from("webhook_events").select("processing_status").eq("external_event_id", "FALHA-SIMULADA-TXA").maybeSingle();
check("RPC falha => erro, usuário Auth preservado, sem pedido, sem acesso, sem evento processado",
  !!failed.error && !!preUid && (await orderCount("TXA")).count === 0 &&
  (await accessState()) === null && evAfterFail.data?.processing_status !== "processed",
  { err: failed.error?.message, ev: evAfterFail.data });

// reprocessa o evento real: precisa reutilizar o usuário já existente
r = await post(payload({ event: "PURCHASE_APPROVED", tx: "TXA", ts: tsA }));
const uidAfterRetry = (await admin.rpc("find_user_id_by_email", { _email: BUYER })).data;
let acc = await accessState();
const { count: profileCount } = await admin.from("profiles").select("id", { count: "exact" }).eq("email", BUYER);
check("reprocessamento reusa o mesmo usuário, 1 pedido, acesso só depois da RPC",
  r.status === 200 && uidAfterRetry === preUid && profileCount === 1 &&
  (await orderCount("TXA")).count === 1 && acc?.revoked_at === null && acc?.suspended_at === null, { r, acc, uidAfterRetry, preUid });

// ---- 6. evento duplicado
r = await post(payload({ event: "PURCHASE_APPROVED", tx: "TXA", ts: tsA }));
check("evento duplicado ignorado sem duplicar pedido", r.status === 200 && (await orderCount("TXA")).count === 1, r);

// ---- 7. COMPLETE posterior da mesma transação
r = await post(payload({ event: "PURCHASE_COMPLETE", tx: "TXA", ts: tsA + 1000 }));
check("COMPLETE posterior processa sem duplicar pedido nem usuário",
  r.status === 200 && (await orderCount("TXA")).count === 1, r);

// ---- 8. boleto não cria usuário Auth
r = await post(payload({ event: "PURCHASE_BILLET_PRINTED", tx: "TXC", ts: Date.now(), email: BOLETO_BUYER }));
const boletoUser = await admin.rpc("find_user_id_by_email", { _email: BOLETO_BUYER });
const txc = await orderCount("TXC");
check("boleto cria pedido pendente sem usuário Auth",
  r.status === 200 && !boletoUser.data && txc.count === 1 && txc.rows[0].status === "pending" && txc.rows[0].user_id === null, { r, txc });

// ---- 14. refund sem pedido existente
r = await post(payload({ event: "PURCHASE_REFUNDED", tx: "TXGHOST", ts: Date.now(), email: `fantasma.${Date.now()}@example.com` }));
check("refund sem pedido = needs_review, sem criar pedido", r.status === 200 && r.body.status === "needs_review" && (await orderCount("TXGHOST")).count === 0, r);

// ---- 9. segunda compra (TXB)
const tsB = Date.now() + 5000;
r = await post(payload({ event: "PURCHASE_APPROVED", tx: "TXB", ts: tsB }));
acc = await accessState();
check("segunda compra cria segundo pedido e mantém acesso", r.status === 200 && (await orderCount("TXB")).count === 1 && acc?.revoked_at === null, { r, acc });

// ---- 10. reembolso de A não derruba acesso de B
r = await post(payload({ event: "PURCHASE_REFUNDED", tx: "TXA", ts: tsB + 1000 }));
acc = await accessState();
check("reembolso de A mantém acesso por causa de B", r.status === 200 && acc?.revoked_at === null && acc?.suspended_at === null, { r, acc });

// ---- 12. APPROVED antigo de A não restaura nada (terminal + stale)
r = await post(payload({ event: "PURCHASE_APPROVED", tx: "TXA", ts: tsA - 5000, id: "APPROVED-ATRASADO-TXA" }));
const txaRow = (await orderCount("TXA")).rows[0];
check("APPROVED atrasado de A ignorado (transação terminal)", r.status === 200 && r.body.status === "ignored" && txaRow.status === "refunded", { r, txaRow });

// ---- 11. protesto em A com B paga não suspende
r = await post(payload({ event: "PURCHASE_PROTEST", tx: "TXB", ts: tsB + 2000 }));
acc = await accessState();
console.log("   debug protest TXB:", JSON.stringify(r), JSON.stringify((await orderCount()).rows));
check("protesto em B (sem outra compra paga) suspende sem revogar", acc?.suspended_at !== null && acc?.revoked_at === null, acc);

// COMPLETE posterior válido remove a suspensão
r = await post(payload({ event: "PURCHASE_COMPLETE", tx: "TXB", ts: tsB + 3000 }));
acc = await accessState();
check("COMPLETE posterior remove a suspensão", acc?.suspended_at === null && acc?.revoked_at === null, acc);

// protesto em A enquanto B está paga não suspende
r = await post(payload({ event: "PURCHASE_PROTEST", tx: "TXA", ts: tsB + 4000, id: "PROTEST-TXA" }));
acc = await accessState();
check("protesto em A com B paga não suspende o acesso", acc?.suspended_at === null && acc?.revoked_at === null, acc);

// ---- 13. reembolso de B revoga
r = await post(payload({ event: "PURCHASE_REFUNDED", tx: "TXB", ts: tsB + 5000 }));
acc = await accessState();
check("reembolso de B revoga o acesso (revoked, sem suspensão)", acc?.revoked_at !== null && acc?.suspended_at === null, acc);

// ---- concorrência: dois eventos simultâneos da mesma compra
const tsD = Date.now() + 20000;
const [c1, c2] = await Promise.all([
  post(payload({ event: "PURCHASE_APPROVED", tx: "TXD", ts: tsD, email: BUYER })),
  post(payload({ event: "PURCHASE_COMPLETE", tx: "TXD", ts: tsD, email: BUYER })),
]);
const txd = await orderCount("TXD");
const { count: userCount } = await admin.from("profiles").select("id", { count: "exact" }).eq("email", BUYER);
const { count: accCount } = await admin.from("product_access").select("id", { count: "exact" }).eq("user_id", uidAfterRetry!).eq("product_id", productId);
check("eventos simultâneos não duplicam pedido, usuário nem acesso",
  c1.status === 200 && c2.status === 200 && txd.count === 1 && userCount === 1 && accCount === 1, { c1, c2, txd, userCount, accCount });

// ---- checkout como fonte única
const { data: integCols } = await admin.from("payment_integrations").select("*").eq("id", integ!.id).single();
check("payment_integrations não tem checkout_url", !("checkout_url" in (integCols as object)));
check("products.checkout_url segue sendo a fonte e Bergamo está draft a R$27",
  product!.price_cents === 2700 && product!.status === "draft", product);

// ---- outro produto não afetado
const { data: outros } = await admin.from("orders").select("id").neq("product_id", productId);
check("nenhum pedido criado para outros produtos", (outros ?? []).length === 0, outros);

// ================= LIMPEZA =================
await admin.from("webhook_events").delete().eq("integration_id", integ!.id);
await admin.from("orders").delete().eq("provider", "hotmart").in("provider_ref", ["TXA","TXB","TXC","TXD"]);
if (uidAfterRetry) {
  await admin.from("product_access").delete().eq("user_id", uidAfterRetry);
  await admin.auth.admin.deleteUser(uidAfterRetry);
}
await admin.from("payment_integrations").delete().eq("id", integ!.id);
await admin.from("admin_audit_log").delete().eq("actor_email", "system:hotmart-webhook");

console.log(`\n== RESULTADO: ${pass} passaram, ${fail} falharam ==`);
