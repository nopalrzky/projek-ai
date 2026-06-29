const base = process.env.SMOKE_URL || 'http://localhost:3000';
const post = async (action, payload = {}) => {
  const res = await fetch(`${base}/api/${action}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const json = await res.json();
  if (!json.ok) throw new Error(`${action}: ${json.error}`);
  return json.data;
};
const checks = [];
async function check(name, fn) {
  try { await fn(); checks.push([name, 'OK']); }
  catch (e) { checks.push([name, `FAIL ${e.message}`]); process.exitCode = 1; }
}
await check('health', async () => { const r = await fetch(`${base}/health`); if (!r.ok) throw new Error(String(r.status)); });
for (const action of ['bootstrap','dashboard','reportFinance','globalSearch','listCustomers','listVehicles','listItems','listWorkOrders','listInvoices','listTables','exportTemplate']) {
  await check(action, () => post(action));
}
await check('db route forbidden', async () => { const r = await fetch(`${base}/data/bengkel.db`); if (r.status !== 403) throw new Error(`expected 403 got ${r.status}`); });
for (const [name, status] of checks) console.log(`${name}: ${status}`);
if (process.exitCode) process.exit(process.exitCode);
