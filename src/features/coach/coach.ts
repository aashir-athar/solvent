// The coaching language layer.
//
// This is the "LLM only handles language" part of the verified-safe architecture, made
// concrete and dependency-free: a deterministic templater that NEVER produces a number.
// Every figure it speaks comes straight from solvent-core; the coach only phrases it,
// pulling its wording from the localized dictionaries so it speaks the user's language.
// An optional on-device model can rephrase this text warmly (see features/coach/runtime.ts)
// without ever changing a figure.
//
// Voice: calm, plain, second person, non-advisory. Numbers from the engine, words from i18n.

import type { Plan, WhatIfResult } from '@/core';
import { translate, type TranslationKey } from '@/i18n';
import { formatLongDate, formatMoney, formatSooner } from '@/lib/format';

export interface CoachContext {
  currency: string;
  locale?: string;
  debtCount?: number;
  targetAmount?: number;
}

export interface Coach {
  summary(plan: Plan, ctx: CoachContext): string;
  whyThisDate(plan: Plan, ctx: CoachContext): string;
  whatIf(result: WhatIfResult, ctx: CoachContext): string;
  weeklyNudge(plan: Plan, ctx: CoachContext): string;
}

function money(minor: number, ctx: CoachContext): string {
  return formatMoney(minor, ctx.currency, ctx.locale);
}

function clauseKey(plan: Plan): TranslationKey {
  if (plan.strategy === 'snowball') return 'coach.clause.snowball';
  if (plan.strategy === 'custom') return 'coach.clause.custom';
  return 'coach.clause.avalanche';
}

export const TemplateCoach: Coach = {
  summary(plan, ctx) {
    if (plan.kind === 'debt_free') {
      if (plan.status === 'already') return translate('coach.debt.already');
      if (plan.status === 'never') return translate('coach.debt.never');
      const principal = plan.totalApplied - plan.totalInterest;
      return translate('coach.debt.summary', {
        principal: money(principal, ctx),
        monthly: money(plan.monthlyAmount, ctx),
        date: formatLongDate(plan.date),
        interest: money(plan.totalInterest, ctx),
      });
    }
    if (plan.status === 'already') return translate('coach.savings.already');
    if (plan.status === 'never') return translate('coach.savings.never');
    const target = ctx.targetAmount ?? plan.totalApplied;
    return translate('coach.savings.summary', {
      target: money(target, ctx),
      monthly: money(plan.monthlyAmount, ctx),
      date: formatLongDate(plan.date),
    });
  },

  whyThisDate(plan, ctx) {
    if (plan.kind === 'debt_free') {
      if (plan.status === 'already') return translate('coach.why.debtAlready');
      if (plan.status === 'never') return translate('coach.debt.never');
      const principal = plan.totalApplied - plan.totalInterest;
      const count = ctx.debtCount ?? 1;
      return translate('coach.why.debt', {
        date: formatLongDate(plan.date),
        principal: money(principal, ctx),
        count,
        debtWord: translate(count === 1 ? 'coach.word.debt' : 'coach.word.debts'),
        monthly: money(plan.monthlyAmount, ctx),
        strategy: plan.strategy ?? 'avalanche',
        clause: translate(clauseKey(plan)),
        interest: money(plan.totalInterest, ctx),
      });
    }
    if (plan.status === 'already') return translate('coach.why.savingsAlready');
    if (plan.status === 'never') return translate('coach.savings.never');
    const target = ctx.targetAmount ?? plan.totalApplied;
    const yieldClause =
      plan.totalInterest > 0 ? translate('coach.why.yieldClause', { amount: money(plan.totalInterest, ctx) }) : '';
    return translate('coach.why.savings', {
      date: formatLongDate(plan.date),
      target: money(target, ctx),
      monthly: money(plan.monthlyAmount, ctx),
      yieldClause,
    });
  },

  whatIf(result, ctx) {
    if (result.baseStatus === 'never' && result.newStatus === 'reached') {
      return translate('coach.whatif.fromNever', {
        amount: money(result.extraPerMonth, ctx),
        date: formatLongDate(result.newDate),
      });
    }
    if (result.monthsSooner <= 0) return translate('coach.whatif.same');
    const sooner = formatSooner(result.monthsSooner);
    const key: TranslationKey = ctx.targetAmount !== undefined ? 'coach.whatif.reachSooner' : 'coach.whatif.freeSooner';
    const base = translate(key, {
      amount: money(result.extraPerMonth, ctx),
      sooner,
      date: formatLongDate(result.newDate),
    });
    if (result.interestSaved > 0 && ctx.targetAmount === undefined) {
      return base + translate('coach.whatif.interest', { amount: money(result.interestSaved, ctx) });
    }
    return base;
  },

  weeklyNudge(plan, ctx) {
    return TemplateCoach.summary(plan, ctx);
  },
};
