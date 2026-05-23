export function calculateNetBalances(expenses, members) {
  const balance = {};

  members.forEach((m) => {
    balance[m._id] = 0;
  });

  expenses.forEach((expense) => {
    // payer gets full amount
    balance[expense.paidBy._id] += expense.amount;

    // everyone owes their split
    expense.splits.forEach((s) => {
      balance[s.user._id] -= s.amount;
    });
  });

  return balance; // +ve = gets, -ve = owes
}
