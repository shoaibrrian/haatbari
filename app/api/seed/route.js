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
      image: "https://picsum.photos/200/300?random=1",
    },
    {
      title: "Red T-Shirt",
      description: "Stylish red t-shirt made from organic cotton",
      price: 19.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=2",
    },
    {
      title: "Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 129.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=3",
    },
    {
      title: "Black Hoodie",
      description: "Warm and comfortable hoodie for casual wear",
      price: 39.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=4",
    },
    {
      title: "Smart Watch",
      description: "Modern smartwatch with fitness and health tracking",
      price: 89.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=5",
    },
    {
      title: "Leather Wallet",
      description: "Premium leather wallet with multiple card slots",
      price: 29.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=6",
    },
    {
      title: "Running Shoes",
      description: "Lightweight running shoes designed for maximum comfort",
      price: 74.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=7",
    },
    {
      title: "Denim Jacket",
      description: "Classic denim jacket with a modern fit",
      price: 64.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=8",
    },
    {
      title: "Bluetooth Speaker",
      description: "Portable speaker with powerful sound and deep bass",
      price: 49.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=9",
    },
    {
      title: "Sunglasses",
      description: "Stylish UV-protection sunglasses for everyday use",
      price: 24.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=10",
    },
    {
      title: "White Sneakers",
      description: "Minimal white sneakers suitable for casual outfits",
      price: 54.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=11",
    },
    {
      title: "Cotton Shirt",
      description: "Soft breathable cotton shirt for daily wear",
      price: 27.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=12",
    },
    {
      title: "Gaming Mouse",
      description: "High-precision gaming mouse with customizable buttons",
      price: 34.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=13",
    },
    {
      title: "Backpack",
      description: "Durable backpack with multiple compartments",
      price: 44.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=14",
    },
    {
      title: "Casual Loafers",
      description: "Elegant loafers perfect for casual and formal occasions",
      price: 69.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=15",
    },
    {
      title: "Green Polo Shirt",
      description: "Classic polo shirt made with soft premium fabric",
      price: 32.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=16",
    },
    {
      title: "Mechanical Keyboard",
      description: "Responsive mechanical keyboard with RGB backlighting",
      price: 79.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=17",
    },
    {
      title: "Canvas Belt",
      description: "Strong and stylish canvas belt with metal buckle",
      price: 17.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=18",
    },
    {
      title: "Hiking Boots",
      description: "Rugged hiking boots designed for outdoor adventures",
      price: 99.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=19",
    },
    {
      title: "Summer Shorts",
      description: "Lightweight shorts perfect for warm summer days",
      price: 22.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=20",
    },
    {
      title: "USB-C Charger",
      description: "Fast charging USB-C adapter for smartphones and laptops",
      price: 25.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=21",
    },
    {
      title: "Classic Wrist Watch",
      description: "Elegant analog wrist watch with a premium metal strap",
      price: 79.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=22",
    },
    {
      title: "Canvas Sneakers",
      description: "Comfortable canvas sneakers with a timeless design",
      price: 42.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=23",
    },
    {
      title: "Black Jeans",
      description: "Slim-fit black jeans made from stretch denim",
      price: 49.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=24",
    },
    {
      title: "Power Bank",
      description: "High-capacity portable power bank with fast charging",
      price: 39.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=25",
    },
    {
      title: "Travel Bag",
      description: "Spacious travel bag with durable handles and compartments",
      price: 59.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=26",
    },
    {
      title: "Sports Sandals",
      description: "Comfortable sports sandals with adjustable straps",
      price: 34.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=27",
    },
    {
      title: "Oversized T-Shirt",
      description: "Trendy oversized t-shirt made from soft cotton",
      price: 21.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=28",
    },
    {
      title: "Smartphone Stand",
      description: "Adjustable desk stand for smartphones and tablets",
      price: 14.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=29",
    },
    {
      title: "Leather Belt",
      description: "Classic genuine leather belt with a stylish buckle",
      price: 31.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=30",
    },
    {
      title: "Slip-On Shoes",
      description: "Easy-to-wear slip-on shoes with a comfortable sole",
      price: 47.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=31",
    },
    {
      title: "Flannel Shirt",
      description: "Warm checkered flannel shirt for casual occasions",
      price: 36.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=32",
    },
    {
      title: "Wireless Mouse",
      description: "Ergonomic wireless mouse with smooth tracking",
      price: 22.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=33",
    },
    {
      title: "Baseball Cap",
      description: "Adjustable cotton baseball cap with a classic design",
      price: 16.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=34",
    },
    {
      title: "Formal Shoes",
      description: "Polished formal shoes suitable for office and events",
      price: 84.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=35",
    },
    {
      title: "Winter Sweater",
      description: "Soft knitted sweater designed for cold weather",
      price: 45.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=36",
    },
    {
      title: "Laptop Stand",
      description: "Adjustable aluminum laptop stand for comfortable working",
      price: 39.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=37",
    },
    {
      title: "Minimalist Backpack",
      description: "Sleek everyday backpack with a modern minimalist design",
      price: 52.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=38",
    },
    {
      title: "Trail Running Shoes",
      description: "Durable running shoes built for trails and outdoor use",
      price: 89.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=39",
    },
    {
      title: "Linen Casual Shirt",
      description: "Lightweight linen shirt perfect for summer outfits",
      price: 34.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=40",
    },
    {
      title:
        "Premium Men's Lightweight Running Sneakers for Daily Jogging, Gym Training and Outdoor Sports",
      description:
        "Premium lightweight running sneakers for men designed for daily jogging, gym workouts, walking, running, outdoor sports and athletic activities. Features a comfortable fit, breathable construction and durable outsole for everyday performance.",
      price: 79.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=41",
    },
    {
      title:
        "Classic Men's Slim Fit Casual Cotton T-Shirt with Breathable Fabric for Everyday Summer Wear",
      description:
        "Classic men's slim fit cotton t-shirt made with soft, breathable and lightweight fabric. Perfect for casual outfits, summer wear, everyday use, travel, outdoor activities and relaxed weekend styling.",
      price: 24.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=42",
    },
    {
      title:
        "Wireless Bluetooth Over-Ear Headphones with Active Noise Cancellation and Long Battery Life",
      description:
        "Premium wireless Bluetooth over-ear headphones featuring active noise cancellation, immersive stereo sound, deep bass, comfortable ear cushions and long-lasting battery life. Ideal for music, gaming, travel, work and online meetings.",
      price: 149.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=43",
    },
    {
      title:
        "Modern Men's Waterproof Lightweight Hooded Jacket for Hiking, Travel and Outdoor Adventures",
      description:
        "Modern lightweight waterproof hooded jacket designed for hiking, camping, travel, outdoor activities and rainy weather. Durable construction, comfortable fit and weather-resistant material make it ideal for everyday adventures.",
      price: 89.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=44",
    },
    {
      title:
        "Advanced Smart Fitness Watch with Heart Rate Monitoring, Sleep Tracking, GPS and Activity Tracking",
      description:
        "Advanced smart fitness watch with heart rate monitoring, sleep tracking, GPS navigation, step counter, calorie tracking and multiple sports modes. Perfect for fitness enthusiasts, runners, athletes and everyday health tracking.",
      price: 119.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=45",
    },
    {
      title:
        "Premium Genuine Leather RFID Blocking Wallet with Multiple Card Slots and Cash Compartment",
      description:
        "Premium genuine leather RFID blocking wallet designed for secure everyday storage. Features multiple credit card slots, identification card slots, cash compartment and a slim compact design for travel and daily use.",
      price: 39.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=46",
    },
    {
      title:
        "Professional Ergonomic Gaming Mouse with High Precision Sensor, RGB Lighting and Programmable Buttons",
      description:
        "Professional ergonomic gaming mouse with a high precision optical sensor, customizable DPI settings, programmable buttons and RGB lighting. Designed for competitive gaming, FPS games, productivity and everyday computer use.",
      price: 49.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=47",
    },
    {
      title:
        "Large Waterproof Travel Backpack with Laptop Compartment, USB Charging Port and Multiple Storage Pockets",
      description:
        "Large waterproof travel backpack featuring a dedicated laptop compartment, USB charging port, multiple storage pockets and comfortable padded shoulder straps. Perfect for college, office, business travel, hiking and everyday commuting.",
      price: 59.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=48",
    },
    {
      title:
        "Men's Premium Classic Leather Formal Dress Shoes for Office, Business Meetings and Special Occasions",
      description:
        "Premium men's classic leather formal dress shoes designed for office wear, business meetings, weddings, parties and special occasions. Features a polished finish, comfortable interior and durable outsole for long-lasting use.",
      price: 94.99,
      category: "Footwear",
      image: "https://picsum.photos/200/300?random=49",
    },
    {
      title:
        "Ultra-Slim Portable Power Bank with Fast Charging Technology and High Capacity for Smartphones",
      description:
        "Ultra-slim portable power bank with fast charging technology and high battery capacity for smartphones, tablets, wireless earbuds and other USB-powered devices. Compact design makes it perfect for travel, work and everyday emergencies.",
      price: 44.99,
      category: "Electronics",
      image: "https://picsum.photos/200/300?random=50",
    },
    {
      title:
        "Premium Oversized Unisex Cotton Hoodie with Soft Fleece Interior for Casual Streetwear Fashion",
      description:
        "Premium oversized unisex cotton hoodie featuring a soft fleece interior, relaxed fit and modern streetwear design. Perfect for casual outfits, winter fashion, travel, college wear and comfortable everyday styling.",
      price: 54.99,
      category: "Apparel",
      image: "https://picsum.photos/200/300?random=51",
    },
    {
      title:
        "Polarized UV400 Men's and Women's Sunglasses for Driving, Beach Travel and Outdoor Activities",
      description:
        "Stylish polarized UV400 sunglasses designed to reduce glare and protect your eyes from harmful UV rays. Ideal for driving, beach vacations, hiking, travel, cycling and other outdoor activities.",
      price: 29.99,
      category: "Accessories",
      image: "https://picsum.photos/200/300?random=52",
    },
  ]);

  return Response.json({ message: "Database seeded successfully" });
}
