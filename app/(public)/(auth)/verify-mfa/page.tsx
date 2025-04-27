import { Suspense } from "react";
import VerifyMfa from "./_verifymfa";

const EnableMfa = () => {
  return (
    <Suspense>
      <VerifyMfa />;
    </Suspense>
  );
};

export default EnableMfa;