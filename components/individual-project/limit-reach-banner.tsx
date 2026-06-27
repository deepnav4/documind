"use client";

import {
  Banner,
  BannerAction,
  BannerClose,
  BannerIcon,
  BannerTitle,
} from "@/components/kibo-ui/banner";
import { CircleAlert } from "lucide-react";

type TLimitReachBannerProps = {
    limitMessage: string;
}
const LimitReachBanner = ({limitMessage}: TLimitReachBannerProps) => (
  <Banner>
    <BannerIcon icon={CircleAlert} />
    <BannerTitle>{limitMessage}</BannerTitle>
    {/* <BannerAction>Learn more</BannerAction> */}
    {/* <BannerClose /> */}
  </Banner>
);

export default LimitReachBanner;
