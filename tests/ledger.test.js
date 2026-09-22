const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('app/src/main/assets/index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'app script should exist');

const elements = new Map();
const element = key => {
  if (!elements.has(key)) elements.set(key, { innerHTML: '', value: '', hidden: true, disabled: true, classList: { add: () => {}, remove: () => {} } });
  return elements.get(key);
};
const context = vm.createContext({
  localStorage: { getItem: () => null, setItem: () => {} },
  document: { querySelector: element },
  window: {},
  scrollTo: () => {},
  setTimeout: () => {},
  Intl,
  Date,
  Number,
});
vm.runInContext(script.replace(/window\.appBack=[\s\S]*?;render\(\);\s*$/, ''), context);

const evalInApp = expression => vm.runInContext(expression, context);
assert.equal(evalInApp("profitCents({saleAmount:'100.10',supplyAmount:'60.05',taxAmount:'5.01',otherExpense:'2.04'})"), 3300);
assert.equal(evalInApp("profitCents({saleAmount:'50',supplyAmount:'70',taxAmount:'',otherExpense:''})"), -2000);
assert.equal(evalInApp("profitCents({saleAmount:'100',supplyAmount:''})"), null);
assert.equal(evalInApp("profitCents({saleAmount:'',supplyAmount:'50'})"), null);
assert.equal(evalInApp("profitCents({saleAmount:'100',supplyAmount:'60'})"), 4000);

evalInApp("db.records=[{date:'2026-01-10',saleAmount:'100',supplyAmount:'60',taxAmount:'5',otherExpense:'2'},{date:'2026-01-20',saleAmount:'50',supplyAmount:''},{date:'2026-02-01',saleAmount:'80',supplyAmount:'90'},{date:'2025-12-31',saleAmount:'999',supplyAmount:'1'}];dashboardYear=2026;dashboardMonth=1");
const board = evalInApp('dashboard()');
assert.ok(board.includes('¥ 230.00'), 'annual sales should exclude other years');
assert.ok(board.includes('¥ 150.00'), 'January sales should sum all entered sales');
assert.ok(board.includes('¥ 23.00'), 'annual profit should include complete records only');
assert.ok(board.includes('1 笔金额待补'), 'missing purchase amount should be disclosed');

evalInApp("db.records=[{id:'keep',date:'2026-01-10',client:'甲'}, {id:'delete',date:'2026-01-11',client:'乙'}];editId='delete';deleteTargetId='delete'");
element('#deletePhrase').value = '不确认';
evalInApp('updateDeleteButton()');
assert.equal(element('#deleteConfirmButton').disabled, true, 'wrong phrase must keep delete disabled');
evalInApp('deleteConfirmed({preventDefault(){}})');
assert.equal(evalInApp('db.records.length'), 2, 'wrong phrase must not delete');
element('#deletePhrase').value = '确认';
evalInApp('updateDeleteButton()');
assert.equal(element('#deleteConfirmButton').disabled, false, 'exact phrase should enable delete');
evalInApp('deleteConfirmed({preventDefault(){}})');
assert.equal(evalInApp('db.records.length'), 1, 'exact phrase should delete one record');
assert.equal(evalInApp('db.records[0].id'), 'keep', 'other records should remain');

console.log('Ledger profit and dashboard tests passed');
