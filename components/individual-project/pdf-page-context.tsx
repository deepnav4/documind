"use client";

import { createContext, useContext } from "react";

type PdfPageContextValue = {
  goToPage: (page: number) => void;
};

// Default is a safe no-op so consuming this outside a provider never throws
// and produces no behavior change.
const PdfPageContext = createContext<PdfPageContextValue>({
  goToPage: () => {},
});

export const PdfPageProvider = PdfPageContext.Provider;

export const usePdfPage = () => useContext(PdfPageContext);
