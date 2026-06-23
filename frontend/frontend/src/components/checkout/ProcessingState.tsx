import React from "react";
import { Loader2 } from "lucide-react";

export default function ProcessingState() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 animate-in fade-in">
      <Loader2 className="h-10 w-10 text-black animate-spin mb-6" />
      <h2 className="text-xl font-semibold tracking-tight text-black mb-2">Processing payment...</h2>
      <p className="text-sm text-gray-500">Please do not close or refresh this window.</p>
    </div>
  );
}
