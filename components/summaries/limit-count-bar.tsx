import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LimitCountBar () {
    const uploadLimit = 5
    return (
        <div className="mb-6">
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 pl-4 text-rose-800 flex items-center">
                <p className="text-sm">You have reached a limit of {uploadLimit} uploads on the basic plan. </p>
                <Link href={'/#pricing'} className="flex items-center font-semibold gap-0.5 text-sm mx-1 ml-2 underline underline-offset-3">Upgrade to Pro <ArrowRight className="w-3 h-3 animate-pulse font-semibold inline-block" /></Link>
                <p className="text-sm">for unlimited uploads. </p>
            </div>
        </div>
    )
}