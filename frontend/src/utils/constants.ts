export const FIELD_CLASS = "p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-[var(--input-background)] text-white";

export const ITEMS_PER_PAGE = 5;

export const BUTTON_STYLES = {
  primary: "btn-primary px-4 py-2 rounded",
  secondary: "px-4 py-2 rounded border",
  danger: "p-1 hover:text-red-400",
  edit: "p-1 hover:text-[var(--accent-color)]"
};

export const CARD_STYLES = {
  main: "bg-[var(--card-background)] rounded-2xl shadow-md hover:shadow-xl p-6",
  item: "flex items-center gap-2 bg-[var(--card-background)] text-white p-3 rounded-2xl shadow-md hover:shadow-xl"
};

export const DEFAULT_FORM_DATA = {
  title: "",
  url: "",
  file_url: "",
  user_id: null as number | null,
  category_id: null as number | null,
  color: "",
  image_url: "",
};