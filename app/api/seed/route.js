import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  await connectDB();
  const products = await Product.find();
  await Product.deleteMany();

  await Product.insertMany([
  {
    title: "Blue Sneakers",
    description: "Comfortable blue sneakers for everyday wear",
    price: 59.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Red T-Shirt",
    description: "Stylish red t-shirt made from organic cotton",
    price: 19.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 129.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Black Hoodie",
    description: "Warm and comfortable hoodie for casual wear",
    price: 39.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Smart Watch",
    description: "Modern smartwatch with fitness and health tracking",
    price: 89.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Leather Wallet",
    description: "Premium leather wallet with multiple card slots",
    price: 29.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Running Shoes",
    description: "Lightweight running shoes designed for maximum comfort",
    price: 74.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Denim Jacket",
    description: "Classic denim jacket with a modern fit",
    price: 64.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Bluetooth Speaker",
    description: "Portable speaker with powerful sound and deep bass",
    price: 49.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Sunglasses",
    description: "Stylish UV-protection sunglasses for everyday use",
    price: 24.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "White Sneakers",
    description: "Minimal white sneakers suitable for casual outfits",
    price: 54.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Cotton Shirt",
    description: "Soft breathable cotton shirt for daily wear",
    price: 27.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Gaming Mouse",
    description: "High-precision gaming mouse with customizable buttons",
    price: 34.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Backpack",
    description: "Durable backpack with multiple compartments",
    price: 44.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Casual Loafers",
    description: "Elegant loafers perfect for casual and formal occasions",
    price: 69.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Green Polo Shirt",
    description: "Classic polo shirt made with soft premium fabric",
    price: 32.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Mechanical Keyboard",
    description: "Responsive mechanical keyboard with RGB backlighting",
    price: 79.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Canvas Belt",
    description: "Strong and stylish canvas belt with metal buckle",
    price: 17.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Hiking Boots",
    description: "Rugged hiking boots designed for outdoor adventures",
    price: 99.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Summer Shorts",
    description: "Lightweight shorts perfect for warm summer days",
    price: 22.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "USB-C Charger",
    description: "Fast charging USB-C adapter for smartphones and laptops",
    price: 25.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Classic Wrist Watch",
    description: "Elegant analog wrist watch with a premium metal strap",
    price: 79.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Canvas Sneakers",
    description: "Comfortable canvas sneakers with a timeless design",
    price: 42.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Black Jeans",
    description: "Slim-fit black jeans made from stretch denim",
    price: 49.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Power Bank",
    description: "High-capacity portable power bank with fast charging",
    price: 39.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Travel Bag",
    description: "Spacious travel bag with durable handles and compartments",
    price: 59.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Sports Sandals",
    description: "Comfortable sports sandals with adjustable straps",
    price: 34.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Oversized T-Shirt",
    description: "Trendy oversized t-shirt made from soft cotton",
    price: 21.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Smartphone Stand",
    description: "Adjustable desk stand for smartphones and tablets",
    price: 14.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Leather Belt",
    description: "Classic genuine leather belt with a stylish buckle",
    price: 31.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Slip-On Shoes",
    description: "Easy-to-wear slip-on shoes with a comfortable sole",
    price: 47.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Flannel Shirt",
    description: "Warm checkered flannel shirt for casual occasions",
    price: 36.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Wireless Mouse",
    description: "Ergonomic wireless mouse with smooth tracking",
    price: 22.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Baseball Cap",
    description: "Adjustable cotton baseball cap with a classic design",
    price: 16.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Formal Shoes",
    description: "Polished formal shoes suitable for office and events",
    price: 84.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Winter Sweater",
    description: "Soft knitted sweater designed for cold weather",
    price: 45.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Laptop Stand",
    description: "Adjustable aluminum laptop stand for comfortable working",
    price: 39.99,
    category: "Electronics",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Minimalist Backpack",
    description: "Sleek everyday backpack with a modern minimalist design",
    price: 52.99,
    category: "Accessories",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Trail Running Shoes",
    description: "Durable running shoes built for trails and outdoor use",
    price: 89.99,
    category: "Footwear",
    image: "https://picsum.photos/200/300"
  },
  {
    title: "Linen Casual Shirt",
    description: "Lightweight linen shirt perfect for summer outfits",
    price: 34.99,
    category: "Apparel",
    image: "https://picsum.photos/200/300"
  }
]);

  return Response.json({ message: "Database seeded successfully" });
}