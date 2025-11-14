import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { motion } from "motion/react";

export function Pricing() {
  const plans = [
    {
      name: "Weekly Hire",
      description:
        "Pay as you go, per hour. No long-term contracts.",
      price: "From $8",
      period: "/hr",
      icon: "💵",
      features: [
        "Vetted Southeast Asian VAs",
        "Flexible hourly rates",
        "No long-term commitment",
        "Pay weekly",
      ],
    },
    {
      name: "Speed Hire Pass",
      description:
        "Unlimited swipes, instant matches, replacements anytime.",
      price: "$99",
      period: "/month",
      icon: "⚡",
      featured: true,
      features: [
        "Unlimited VA matches",
        "Priority support",
        "Free replacements",
        "Advanced filtering",
        "Analytics dashboard",
      ],
    },
    {
      name: "Managed VA",
      description: "We handle payroll and contracts for you.",
      price: "+10%",
      period: "service fee",
      icon: "⚙️",
      features: [
        "Full payroll management",
        "Contract administration",
        "Compliance handling",
        "Dedicated account manager",
      ],
    },
  ];

  return (
    <section
      id="pricing"
      className="py-32 bg-white scroll-mt-16"
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          className="text-center space-y-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl lg:text-6xl text-black tracking-tight">
            Simple, transparent pricing.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`p-8 rounded-2xl relative ${
                plan.featured
                  ? "bg-black text-white border-4 border-[#FFD600] shadow-2xl scale-105"
                  : "bg-white border-2 border-gray-200 hover:border-black transition-all"
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
              }}
              whileHover={{ y: plan.featured ? 0 : -8 }}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD600] text-black px-6 py-2 rounded-full text-sm">
                  Most Popular
                </div>
              )}

              <div className="text-5xl mb-6">{plan.icon}</div>

              <h3
                className={`text-3xl mb-3 tracking-tight ${plan.featured ? "text-white" : "text-black"}`}
              >
                {plan.name}
              </h3>

              <p
                className={`mb-8 leading-relaxed ${plan.featured ? "text-gray-300" : "text-gray-600"}`}
              >
                {plan.description}
              </p>

              <div className="mb-8">
                <span
                  className={`text-5xl tracking-tight ${plan.featured ? "text-white" : "text-black"}`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-xl ml-2 ${plan.featured ? "text-gray-300" : "text-gray-500"}`}
                >
                  {plan.period}
                </span>
              </div>

              <Button
                className={`w-full mb-8 text-lg ${
                  plan.featured
                    ? "bg-[#FFD600] text-black hover:bg-[#FFD600]/90 shadow-xl"
                    : "bg-black text-[#FFD600] hover:bg-gray-900"
                }`}
                size="lg"
              >
                Get Started →
              </Button>

              <ul className="space-y-4">
                {plan.features.map((feature, fIndex) => (
                  <li
                    key={fIndex}
                    className="flex items-start gap-3"
                  >
                    <Check
                      className={`w-6 h-6 flex-shrink-0 mt-0.5 ${plan.featured ? "text-[#FFD600]" : "text-black"}`}
                    />
                    <span
                      className={`text-lg ${plan.featured ? "text-gray-100" : "text-gray-700"}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}