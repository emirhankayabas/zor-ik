import React from "react";

import Header from "@/components/static/header";
import Footer from "@/components/static/footer";

interface Props {
  children: React.ReactNode;
}

export default function LocaleLayout({ children }: Props) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
