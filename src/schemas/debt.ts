// Validation for the add / edit debt form. Amounts arrive as integer minor units from
// MoneyField; APR is a percent. Error messages are plain and take the blame.

import { z } from 'zod';

export const debtFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Give this debt a name so you can tell it apart.')
    .max(40, 'Keep the name under 40 characters.'),
  balance: z
    .number({ error: 'Enter how much you owe.' })
    .int()
    .positive('Enter how much you owe.'),
  apr: z
    .number({ error: 'Enter the interest rate, or 0 if there is none.' })
    .min(0, 'The rate cannot be negative.')
    .max(200, 'That rate looks too high. Check the number.'),
  minPayment: z
    .number({ error: 'Enter the minimum payment, or 0.' })
    .int()
    .min(0, 'The minimum payment cannot be negative.'),
});

export type DebtFormValues = z.infer<typeof debtFormSchema>;
