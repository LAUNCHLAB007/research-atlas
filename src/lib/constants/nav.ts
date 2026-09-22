export interface NavItem {
  label: string;
  href: string;
  short: string;
}

export const WORKSPACE_NAV: NavItem[] = [
  { label: "Explore", href: "/explore", short: "Explore" },
  { label: "Classroom", href: "/classroom", short: "Class" },
  { label: "Research", href: "/research", short: "Research" },
  { label: "Build", href: "/build", short: "Build" },
  { label: "Test", href: "/test", short: "Test" },
  { label: "Library", href: "/library", short: "Library" },
];
