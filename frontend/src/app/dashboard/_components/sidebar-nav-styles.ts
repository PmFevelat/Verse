import { cn } from "@/lib/utils";

export const DASHBOARD_SIDEBAR_SECTION_TITLE_CLASSNAME =
  "mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500";

export const DASHBOARD_SIDEBAR_ITEMS_CONTAINER_CLASSNAME =
  "flex flex-col gap-px [&:has(button:hover)_button[data-sidebar-active='true']:not(:hover)]:bg-transparent";

const DASHBOARD_SIDEBAR_ITEM_BASE_CLASSNAME =
  "group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa] active:scale-[0.99]";

export function dashboardSidebarItemClassName(
  active: boolean,
  layout: "compact" | "between" = "between",
) {
  return cn(
    DASHBOARD_SIDEBAR_ITEM_BASE_CLASSNAME,
    layout === "between" ? "justify-between" : "justify-start",
    active
      ? "bg-gray-100/80 font-semibold text-gray-900 hover:bg-gray-100/80"
      : "text-gray-400 hover:bg-gray-100/80 hover:text-gray-700",
  );
}
