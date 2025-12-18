import React, { memo } from "react";
import SignatureAnimation from "signature-animation";

// Remove diacritics/accents from text
const unaccent = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// Memoized component that won't re-render unless props change
const SignatureDisplay = memo(
  ({
    firstName,
    lastName,
    duration = 1,
    delay = 0.3,
    role,
  }: {
    firstName: string;
    lastName: string;
    duration?: number;
    delay?: number;
    role?: string;
  }) => {
    const unaccentedFirstName = unaccent(firstName);
    const unaccentedLastName = unaccent(lastName);

    return (
      <>
        <SignatureAnimation duration={duration} delay={delay}>
          {`${unaccentedLastName} ${unaccentedFirstName}`}
        </SignatureAnimation>
        <p className="italic text-sm  mt-2" style={{ color: 'rgb(75, 85, 99)' }}>
          {`${role} ${unaccentedLastName} ${unaccentedFirstName}`}
        </p>
      </>
    );
  }
);

SignatureDisplay.displayName = "SignatureDisplay";

export default SignatureDisplay;
