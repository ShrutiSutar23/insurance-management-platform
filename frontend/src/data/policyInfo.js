import { HeartPulse, Users, Car, Home, ShieldCheck } from "lucide-react";

const policyInfo = {
  "Health Insurance": {
    tagline: "Comprehensive medical coverage for you and your family",
    description: "Covers hospitalization, surgery, and medical treatment costs, so unexpected medical bills don't derail your finances.",
    benefits: ["Cashless hospitalization", "Pre & post-hospitalization expenses", "Annual health checkup", "No-claim bonus", "Covers pre-existing diseases after waiting period"],
    startingPremium: 3000,
    color: "bg-blue-600",
    icon: HeartPulse,
  },
  "Life Insurance": {
    tagline: "Financial security for your loved ones",
    description: "Provides a lump sum payout to your family in case of your unfortunate demise, ensuring their financial future stays protected.",
    benefits: ["Death benefit payout", "Tax benefits under 80C", "Optional riders for accident/disability", "Flexible premium terms"],
    startingPremium: 1000,
    color: "bg-purple-600",
    icon: Users,
  },
  "Vehicle Insurance": {
    tagline: "Drive worry-free, we've got you covered",
    description: "Protects your vehicle against accidental damage, theft, and third-party liability as required by law.",
    benefits: ["Own damage cover", "Third-party liability cover", "Roadside assistance", "Zero depreciation add-on", "Cashless garage network"],
    startingPremium: 2000,
    color: "bg-amber-600",
    icon: Car,
  },
  "Home Insurance": {
    tagline: "Protect the place you call home",
    description: "Covers your home structure and belongings against fire, natural disasters, theft, and other unforeseen events.",
    benefits: ["Fire & natural disaster cover", "Burglary protection", "Contents cover", "Rent for alternative accommodation"],
    startingPremium: 1500,
    color: "bg-emerald-600",
    icon: Home,
  },
};

export function getPolicyInfo(type) {
  return policyInfo[type] || {
    tagline: "Comprehensive protection plan",
    description: "A comprehensive insurance plan tailored to your needs.",
    benefits: ["Financial protection", "Claim support", "24/7 customer assistance"],
    startingPremium: 1000,
    color: "bg-slate-600",
    icon: ShieldCheck,
  };
}

export default policyInfo;