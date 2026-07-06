import "server-only";

import {
  processDueEmailAutomations,
  queueQuoteFollowUps,
} from "@/lib/email-automations";

export { queueQuoteFollowUps };

export async function processDueQuoteFollowUps() {
  return processDueEmailAutomations();
}
