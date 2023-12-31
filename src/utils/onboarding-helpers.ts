import stripeClient from "src/utils/stripe-loader";

const IGNORE_REQUIREMENTS = ["external_account"];

export const hasOutstandingRequirements = async (accountId: string) => {
  const stripe = stripeClient();
  const account = await stripe.accounts.retrieve(accountId);

  const outstandingRequirements = account?.requirements?.currently_due?.filter(
    (requirement) => !IGNORE_REQUIREMENTS.includes(requirement),
  );

  const result = (outstandingRequirements?.length ?? 0) > 0;

  return result;
};

export async function createAccountOnboardingUrl(accountId: string) {
  if (process.env.CONNECT_ONBOARDING_REDIRECT_URL == undefined) {
    throw new Error("CONNECT_ONBOARDING_REDIRECT_URL is not set");
  }

  const connectOnboardingRedirectUrl =
    process.env.CONNECT_ONBOARDING_REDIRECT_URL;

  const stripe = stripeClient();
  const { url } = await stripe.accountLinks.create({
    type: "account_onboarding",
    account: accountId,
    refresh_url: connectOnboardingRedirectUrl + "/onboard",
    return_url: connectOnboardingRedirectUrl + "/",
  });
  return url;
}
