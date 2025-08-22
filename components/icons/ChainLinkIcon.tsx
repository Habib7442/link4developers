import * as React from "react";
import type { SVGProps } from "react";
const Component = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 44.443 44.443" {...props}>
    <defs>
      <linearGradient id="prefix__b" x1={22.221} x2={22.221} y1={0} y2={44.442} gradientUnits="userSpaceOnUse">
        <stop stopColor="#54E0FF" />
        <stop offset={1} stopColor="#29ADFF" />
      </linearGradient>
    </defs>
    <rect width={44.443} height={44.443} fill="url(#prefix__b)" rx={12.085} />
    <g stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.729}>
      <path d="M19.687 23.345a6.11 6.11 0 0 0 4.463 2.439 6.13 6.13 0 0 0 4.766-1.778l3.672-3.672a6.12 6.12 0 0 0-8.654-8.655l-2.105 2.094" />
      <path d="M24.583 20.897a6.13 6.13 0 0 0-4.464-2.44 6.12 6.12 0 0 0-4.766 1.779l-3.672 3.672a6.12 6.12 0 0 0 8.654 8.654l2.093-2.093" />
    </g>
  </svg>
);
export default Component;