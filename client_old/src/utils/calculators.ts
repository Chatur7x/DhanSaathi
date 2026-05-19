// ============================================
// Financial Calculation Utilities
// ============================================

/**
 * SIP Future Value Calculator
 * FV = P × [((1+r)^n - 1) / r] × (1+r)
 */
export function calcSIP(monthly: number, years: number, ratePercent: number) {
  const n = years * 12;
  const r = ratePercent / 100 / 12;
  if (r === 0) return { futureValue: monthly * n, totalInvested: monthly * n, wealthGained: 0 };
  const fv = monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
  const totalInvested = monthly * n;
  return {
    futureValue: Math.round(fv),
    totalInvested: Math.round(totalInvested),
    wealthGained: Math.round(fv - totalInvested),
  };
}

/**
 * SIP Year-wise breakdown for chart
 */
export function calcSIPYearwise(monthly: number, years: number, ratePercent: number) {
  const r = ratePercent / 100 / 12;
  const data = [];
  for (let y = 1; y <= years; y++) {
    const n = y * 12;
    const fv = r === 0 ? monthly * n : monthly * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const invested = monthly * n;
    data.push({ year: y, invested: Math.round(invested), value: Math.round(fv), gains: Math.round(fv - invested) });
  }
  return data;
}

/**
 * Lumpsum Future Value Calculator
 * FV = P × (1+r)^n
 */
export function calcLumpsum(principal: number, years: number, ratePercent: number) {
  const r = ratePercent / 100;
  const fv = principal * Math.pow(1 + r, years);
  return {
    futureValue: Math.round(fv),
    totalInvested: principal,
    wealthGained: Math.round(fv - principal),
  };
}

export function calcLumpsumYearwise(principal: number, years: number, ratePercent: number) {
  const r = ratePercent / 100;
  return Array.from({ length: years }, (_, i) => {
    const y = i + 1;
    const fv = principal * Math.pow(1 + r, y);
    return { year: y, invested: principal, value: Math.round(fv), gains: Math.round(fv - principal) };
  });
}

/**
 * Step-up SIP Calculator
 */
export function calcStepUpSIP(monthly: number, annualStepUp: number, years: number, ratePercent: number) {
  const r = ratePercent / 100 / 12;
  const g = annualStepUp / 100 / 12;
  let totalInvested = 0;
  let fv = 0;
  const data = [];

  for (let m = 1; m <= years * 12; m++) {
    const yearIdx = Math.floor((m - 1) / 12);
    const monthlyAmount = monthly * Math.pow(1 + annualStepUp / 100, yearIdx);
    totalInvested += monthlyAmount;
    fv = (fv + monthlyAmount) * (1 + r);

    if (m % 12 === 0) {
      data.push({
        year: m / 12,
        invested: Math.round(totalInvested),
        value: Math.round(fv),
        gains: Math.round(fv - totalInvested),
        monthlyAtYear: Math.round(monthlyAmount),
      });
    }
  }

  return {
    futureValue: Math.round(fv),
    totalInvested: Math.round(totalInvested),
    wealthGained: Math.round(fv - totalInvested),
    yearwise: data,
  };
}

/**
 * SWP (Systematic Withdrawal Plan) Calculator
 */
export function calcSWP(corpus: number, monthlyWithdrawal: number, ratePercent: number, years: number) {
  const r = ratePercent / 100 / 12;
  const data = [];
  let balance = corpus;

  for (let m = 1; m <= years * 12; m++) {
    balance = balance * (1 + r) - monthlyWithdrawal;
    if (balance < 0) balance = 0;

    if (m % 12 === 0) {
      data.push({
        year: m / 12,
        balance: Math.round(balance),
        withdrawn: Math.round(monthlyWithdrawal * m),
      });
    }
  }

  const totalWithdrawn = Math.round(monthlyWithdrawal * years * 12);
  return {
    finalBalance: Math.round(balance),
    totalWithdrawn,
    data,
  };
}

/**
 * CAGR Calculator
 */
export function calcCAGR(initialValue: number, finalValue: number, years: number) {
  const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
  return Math.round(cagr * 100) / 100;
}

/**
 * Options Payoff Calculator
 */
export function calcOptionsPayoff(
  strikePrice: number,
  premium: number,
  optionType: 'call' | 'put',
  position: 'buy' | 'sell',
  spotRange: [number, number]
) {
  const [minSpot, maxSpot] = spotRange;
  const steps = 50;
  const stepSize = (maxSpot - minSpot) / steps;
  const data = [];

  for (let i = 0; i <= steps; i++) {
    const spot = minSpot + i * stepSize;
    let intrinsic = 0;

    if (optionType === 'call') {
      intrinsic = Math.max(spot - strikePrice, 0);
    } else {
      intrinsic = Math.max(strikePrice - spot, 0);
    }

    let pnl = position === 'buy' ? intrinsic - premium : premium - intrinsic;

    data.push({ spot: Math.round(spot), pnl: Math.round(pnl * 100) / 100 });
  }

  const breakeven = optionType === 'call'
    ? strikePrice + premium
    : strikePrice - premium;

  return { data, breakeven: Math.round(breakeven * 100) / 100 };
}

/**
 * Tax Calculator (India 2024-25)
 */
export function calcTax(gainAmount: number, gainType: 'STCG' | 'LTCG', assetClass: 'equity' | 'debt' | 'other') {
  if (gainType === 'STCG') {
    if (assetClass === 'equity') {
      return { tax: Math.round(gainAmount * 0.20), rate: 20, note: 'STCG on Equity/ETF: 20%' };
    }
    return { tax: Math.round(gainAmount * 0.30), rate: 30, note: 'STCG on Debt: As per slab (assumed 30%)' };
  } else {
    if (assetClass === 'equity') {
      const exemption = 125000;
      const taxableGain = Math.max(gainAmount - exemption, 0);
      return {
        tax: Math.round(taxableGain * 0.125),
        rate: 12.5,
        exemption,
        taxableGain,
        note: 'LTCG on Equity: 12.5% above ₹1.25L exemption',
      };
    }
    return { tax: Math.round(gainAmount * 0.20), rate: 20, note: 'LTCG on Debt: 20% (indexation removed)' };
  }
}

/**
 * EMI Calculator
 */
export function calcEMI(principal: number, annualRate: number, tenureMonths: number) {
  const r = annualRate / 100 / 12;
  const emi = r === 0
    ? principal / tenureMonths
    : (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  const totalAmount = emi * tenureMonths;
  const totalInterest = totalAmount - principal;

  const schedule = [];
  let balance = principal;
  for (let m = 1; m <= tenureMonths; m++) {
    const interestPart = balance * r;
    const principalPart = emi - interestPart;
    balance -= principalPart;
    if (m % 12 === 0 || m === tenureMonths) {
      schedule.push({
        month: m,
        year: Math.ceil(m / 12),
        emi: Math.round(emi),
        principal: Math.round(principalPart),
        interest: Math.round(interestPart),
        balance: Math.max(Math.round(balance), 0),
      });
    }
  }

  return {
    emi: Math.round(emi),
    totalAmount: Math.round(totalAmount),
    totalInterest: Math.round(totalInterest),
    schedule,
  };
}

/**
 * Inflation Calculator
 */
export function calcInflation(currentCost: number, inflationRate: number, years: number) {
  const futureCost = currentCost * Math.pow(1 + inflationRate / 100, years);
  const purchasingPowerLoss = futureCost - currentCost;
  const data = Array.from({ length: years }, (_, i) => ({
    year: i + 1,
    value: Math.round(currentCost * Math.pow(1 + inflationRate / 100, i + 1)),
  }));
  return {
    futureCost: Math.round(futureCost),
    purchasingPowerLoss: Math.round(purchasingPowerLoss),
    data,
  };
}

/**
 * Goal Planner — required monthly SIP
 */
export function calcGoalSIP(targetAmount: number, years: number, ratePercent: number) {
  const n = years * 12;
  const r = ratePercent / 100 / 12;
  if (r === 0) return Math.round(targetAmount / n);
  const fv_factor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const monthlySIP = targetAmount / fv_factor;
  return Math.round(monthlySIP);
}

/**
 * XIRR (Extended Internal Rate of Return) Calculator Approximation
 */
export function calcXIRR(cashflows: { amount: number; date: Date }[]) {
  if (cashflows.length < 2) return null;
  
  // Sort cashflows by date
  const sorted = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // XIRR requires at least one positive and one negative cashflow
  const hasPositive = sorted.some(c => c.amount > 0);
  const hasNegative = sorted.some(c => c.amount < 0);
  if (!hasPositive || !hasNegative) return null;

  const xirrNPV = (rate: number) => {
    let npv = 0;
    const t0 = sorted[0].date.getTime();
    for (const cf of sorted) {
      const days = (cf.date.getTime() - t0) / (1000 * 60 * 60 * 24);
      npv += cf.amount / Math.pow(1 + rate, days / 365);
    }
    return npv;
  };

  // Newton-Raphson approximation
  let guess = 0.1;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    const npv = xirrNPV(guess);
    const npvDerivative = (xirrNPV(guess + 0.0001) - npv) / 0.0001;
    const newGuess = guess - npv / npvDerivative;
    if (Math.abs(newGuess - guess) < tolerance) {
      return newGuess * 100; // Return as percentage
    }
    guess = newGuess;
  }
  return null; // Failed to converge
}
