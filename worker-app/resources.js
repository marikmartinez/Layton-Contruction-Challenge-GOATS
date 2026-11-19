/*
 * Mental health and substance use resources shown on the Resources page.
 *
 * Only national US services with stable, published contact details are listed.
 * Company-specific details (EAP provider, phone, chaplain/peer program) are not
 * known yet. Fill in EAP below and the card will show call buttons.
 *
 * Action kinds: call | text | web
 */

/* eslint-disable no-unused-vars */

const EAP = {
  // TODO: add Layton's EAP provider details, e.g. { name: "…", phone: "1-800-…", url: "https://…" }
  name: "",
  phone: "",
  url: "",
};

const RESOURCE_SECTIONS = [
  {
    id: "crisis",
    title: "Crisis support, 24/7",
    intro: "Free and confidential. You don't have to be suicidal to reach out. Call if you're overwhelmed or worried about someone else.",
    items: [
      {
        name: "988 Suicide & Crisis Lifeline",
        desc: "Talk to a trained crisis counselor by phone, text or online chat. Press 2 for Spanish. Veterans press 1.",
        tags: ["24/7", "English & Spanish"],
        actions: [
          { kind: "call", label: "Call 988", href: "tel:988" },
          { kind: "text", label: "Text 988", href: "sms:988" },
          { kind: "web", label: "Chat online", href: "https://988lifeline.org/chat/" },
        ],
      },
      {
        name: "Crisis Text Line",
        desc: "Text with a trained volunteer crisis counselor. Good when you can't talk out loud on site.",
        tags: ["24/7", "Text"],
        actions: [
          { kind: "text", label: "Text HOME to 741741", href: "sms:741741?&body=HOME" },
          { kind: "web", label: "Website", href: "https://www.crisistextline.org/" },
        ],
      },
      {
        name: "Veterans Crisis Line",
        desc: "For veterans, service members and the people who support them.",
        tags: ["24/7"],
        actions: [
          { kind: "call", label: "Call 988, press 1", href: "tel:988" },
          { kind: "text", label: "Text 838255", href: "sms:838255" },
        ],
      },
    ],
  },
  {
    id: "substance",
    title: "Substance use",
    intro: "Help with alcohol, opioids or other drugs, for yourself or someone you care about.",
    items: [
      {
        name: "SAMHSA National Helpline",
        desc: "Free, confidential treatment referral and information service. Can point you to local treatment, support groups and community programs. Available in English and Spanish.",
        tags: ["24/7", "English & Spanish"],
        actions: [
          { kind: "call", label: "Call 1-800-662-4357", href: "tel:18006624357" },
          { kind: "web", label: "Find treatment near you", href: "https://findtreatment.gov/" },
        ],
      },
      {
        name: "Alcoholics Anonymous",
        desc: "Find local and online AA meetings.",
        actions: [{ kind: "web", label: "Find a meeting", href: "https://www.aa.org/find-aa" }],
      },
      {
        name: "Narcotics Anonymous",
        desc: "Find local and online NA meetings.",
        actions: [{ kind: "web", label: "Find a meeting", href: "https://na.org/meetingsearch/" }],
      },
    ],
  },
  {
    id: "construction",
    title: "For the construction industry",
    intro: "Construction has one of the highest suicide rates of any industry. These groups focus on our trades.",
    items: [
      {
        name: "Construction Industry Alliance for Suicide Prevention",
        desc: "Toolbox talks, stand-down materials and resources for crews and supervisors.",
        actions: [{ kind: "web", label: "Visit website", href: "https://preventconstructionsuicide.com/" }],
      },
    ],
  },
];

const WARNING_SIGNS = [
  "Talking about being a burden, feeling trapped, or having no reason to live",
  "Increased drinking or drug use, or showing up impaired",
  "Pulling away from the crew, family or things they used to enjoy",
  "Big mood swings, anger, or seeming unusually calm after a hard stretch",
  "More near misses, mistakes or absences than usual",
  "Giving away tools or belongings, or saying goodbye",
];

const HOW_TO_HELP = [
  { title: "Ask", text: "Ask directly: \"Are you thinking about suicide?\" Asking doesn't plant the idea. It opens the door." },
  { title: "Listen", text: "Let them talk. Don't argue or try to fix it on the spot." },
  { title: "Stay", text: "If they're in danger, don't leave them alone. Remove access to anything they could use to hurt themselves." },
  { title: "Connect", text: "Call or text 988 together, or bring in your supervisor or the EAP." },
  { title: "Follow up", text: "Check in over the next days. It matters more than you think." },
];
