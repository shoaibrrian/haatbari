export const CATEGORIES = [
  {
    name: "Electronics",
    items: ["Mobiles", "Laptops", "Headphones", "Cameras", "Accessories"],
  },
  {
    name: "Fashion",
    items: ["Men's Clothing", "Women's Clothing", "Shoes", "Bags", "Watches"],
  },
  {
    name: "Home & Living",
    items: ["Furniture", "Kitchen", "Home Decor", "Lighting", "Appliances"],
  },
  {
    name: "Beauty & Care",
    items: ["Skincare", "Makeup", "Hair Care", "Fragrances", "Personal Care"],
  },
  {
    name: "Sports & Fitness",
    items: ["Sportswear", "Gym Equipment", "Outdoor", "Cycling", "Fitness"],
  },
  {
    name: "Books & Stationery",
    items: ["Books", "Notebooks", "Pens", "Office Supplies", "Art Supplies"],
  },
  {
    name: "Grocery & Food",
    items: ["Groceries", "Snacks", "Beverages", "Fresh Food", "Cooking"],
  },
  {
    name: "Automotive",
    items: ["Motorcycles", "Car Accessories", "Bike Accessories", "Tools"],
  },
];

export const CATEGORY_NAMES = CATEGORIES.map((category) => category.name);

export const ALL_SUBCATEGORIES = CATEGORIES.flatMap(
  (category) => category.items,
);

export function getSubcategories(categoryName) {
  return (
    CATEGORIES.find((category) => category.name === categoryName)?.items ?? []
  );
}
