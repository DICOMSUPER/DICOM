import React, { memo } from "react";
import SignatureAnimation from "signature-animation";

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
    return (
      <>
        <SignatureAnimation duration={duration} delay={delay}>
          {`${lastName} ${firstName}`}
        </SignatureAnimation>
        <p className="italic text-sm text-gray-600 mt-2">
          {`${role} ${lastName} ${firstName}`}
        </p>
      </>
    );
  }
);

SignatureDisplay.displayName = "SignatureDisplay";

export default SignatureDisplay;
