import { Icon } from "@iconify/react";

const stepNames = ["Bag", "Details", "Confirmation"];

export default function CheckoutSteps({ current }) {
  return (
    <ol className="flex items-center" aria-label="Checkout progress">
      {stepNames.map((name, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;
        return (
          <li key={name} className="flex items-center">
            <span
              className={
                "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-['Inter',sans-serif] " +
                (done
                  ? "border-burgundy bg-burgundy text-cream"
                  : active
                    ? "border-burgundy text-burgundy"
                    : "border-line text-muted")
              }
              aria-current={active ? "step" : undefined}
            >
              {done ? (
                <Icon icon="lucide:check" className="h-3.5 w-3.5" />
              ) : (
                number
              )}
            </span>
            <span
              className={
                "ml-2 text-[10px] uppercase tracking-[0.18em] " +
                (done || active ? "text-burgundy" : "text-muted")
              }
            >
              {name}
            </span>
            {number < stepNames.length && (
              <span
                aria-hidden="true"
                className={
                  "mx-3 h-px w-6 sm:w-12 " +
                  (number < current ? "bg-burgundy" : "bg-line")
                }
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
