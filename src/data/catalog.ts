import heroImg from "@/assets/hero-leather.jpg";
import toteImg from "@/assets/p-tote.jpg";
import walletImg from "@/assets/p-wallet.jpg";
import beltImg from "@/assets/p-belt.jpg";
import duffelImg from "@/assets/p-duffel.jpg";
import cardholderImg from "@/assets/p-cardholder.jpg";
import crossbodyImg from "@/assets/p-crossbody.jpg";
import bootsImg from "@/assets/p-boots.jpg";

export type CategorySlug = "bags" | "wallets" | "belts" | "footwear" | "travel";

export type Product = {
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  img: string;
  gallery: string[];
  description: string;
  details: string[];
  colors: string[];
  sizes: string[];
  bestSeller?: boolean;
};

export const categories: {
  slug: CategorySlug;
  label: string;
  blurb: string;
  img: string;
}[] = [
  {
    slug: "bags",
    label: "Bags & Totes",
    blurb: "Totes, crossbodies and everyday carry in full-grain leather.",
    img: toteImg,
  },
  {
    slug: "wallets",
    label: "Wallets & Cardholders",
    blurb: "Slim bifolds and card holders that break in beautifully.",
    img: walletImg,
  },
  {
    slug: "belts",
    label: "Belts",
    blurb: "Hand-braided and solid-cut belts with brass hardware.",
    img: beltImg,
  },
  {
    slug: "footwear",
    label: "Footwear",
    blurb: "Goodyear-welted boots and loafers built for resoling.",
    img: bootsImg,
  },
  {
    slug: "travel",
    label: "Travel & Duffels",
    blurb: "Weekenders and travel goods for a lifetime of trips.",
    img: duffelImg,
  },
];

export const categoryLabel = (slug: CategorySlug) =>
  categories.find((c) => c.slug === slug)?.label ?? slug;

const LEATHER_COLORS = ["Cognac", "Espresso", "Black", "Natural Tan"];

export const products: Product[] = [
  {
    slug: "marlow-full-grain-tote",
    name: "Marlow Full-Grain Tote",
    category: "bags",
    price: 6799,
    mrp: 9499,
    rating: 4.8,
    reviews: 214,
    img: toteImg,
    gallery: [toteImg, heroImg, crossbodyImg],
    description:
      "A structured everyday tote cut from a single hide of full-grain leather, saddle-stitched at the stress points and lined in brushed cotton twill. Fits a 15\" laptop with room to spare.",
    details: [
      "Full-grain vegetable-tanned leather, 2.0mm",
      "Solid brass hardware, hand-burnished edges",
      "Interior zip pocket + two slip pockets",
      "Dimensions: 38 × 30 × 13 cm",
    ],
    colors: LEATHER_COLORS,
    sizes: ["Regular", "Large"],
    bestSeller: true,
  },
  {
    slug: "ashcroft-bifold-wallet",
    name: "Ashcroft Bifold Wallet",
    category: "wallets",
    price: 2199,
    mrp: 3299,
    rating: 4.9,
    reviews: 512,
    img: walletImg,
    gallery: [walletImg, cardholderImg, heroImg],
    description:
      "A slim bifold that stays slim. Six card slots, a full-length note sleeve and skived edges so it disappears in your pocket.",
    details: [
      "Full-grain leather, 1.2mm skived",
      "6 card slots + 2 hidden pockets",
      "RFID-blocking lining",
      "Dimensions: 11 × 9 cm",
    ],
    colors: ["Cognac", "Espresso", "Black"],
    sizes: ["One Size"],
    bestSeller: true,
  },
  {
    slug: "hand-braided-tan-belt",
    name: "Hand-Braided Tan Belt",
    category: "belts",
    price: 1949,
    mrp: 2899,
    rating: 4.7,
    reviews: 188,
    img: beltImg,
    gallery: [beltImg, heroImg, walletImg],
    description:
      "Twelve strands braided by hand over three hours, finished with a solid brass buckle you can swap out. The braid stretches to your exact fit — no holes needed.",
    details: [
      "Hand-braided full-grain leather",
      "Interchangeable solid brass buckle",
      "35mm width",
      "Made in small batches",
    ],
    colors: ["Natural Tan", "Cognac", "Black"],
    sizes: ["30", "32", "34", "36", "38", "40"],
    bestSeller: true,
  },
  {
    slug: "voyager-weekender-duffel",
    name: "Voyager Weekender Duffel",
    category: "travel",
    price: 11499,
    mrp: 14999,
    rating: 4.9,
    reviews: 96,
    img: duffelImg,
    gallery: [duffelImg, heroImg, toteImg],
    description:
      "A 42-litre weekender with a riveted leather base, detachable shoulder strap and a shoe compartment. Cabin-friendly on most carriers.",
    details: [
      "Full-grain leather with waxed canvas lining",
      "42L capacity, separate shoe compartment",
      "Detachable padded shoulder strap",
      "Dimensions: 55 × 30 × 28 cm",
    ],
    colors: ["Cognac", "Espresso"],
    sizes: ["42L"],
    bestSeller: true,
  },
  {
    slug: "slimline-card-holder",
    name: "Slimline Card Holder",
    category: "wallets",
    price: 1299,
    mrp: 1899,
    rating: 4.6,
    reviews: 341,
    img: cardholderImg,
    gallery: [cardholderImg, walletImg, heroImg],
    description:
      "Four cards, a folded note and nothing else. Cut from a single panel with no lining so it moulds to your cards within a week.",
    details: [
      "Single-panel full-grain leather",
      "4 card slots + centre pocket",
      "Unlined, 3mm thick",
      "Dimensions: 10 × 7 cm",
    ],
    colors: LEATHER_COLORS,
    sizes: ["One Size"],
    bestSeller: true,
  },
  {
    slug: "hawthorn-crossbody-bag",
    name: "Hawthorn Crossbody Bag",
    category: "bags",
    price: 5999,
    mrp: 8499,
    rating: 4.8,
    reviews: 173,
    img: crossbodyImg,
    gallery: [crossbodyImg, toteImg, heroImg],
    description:
      "A compact crossbody with a magnetic flap and an adjustable strap that runs from hip to shoulder. Holds a tablet, wallet and keys.",
    details: [
      "Full-grain leather, 1.8mm",
      "Adjustable 90–140cm strap",
      "Magnetic flap with brass stud",
      "Dimensions: 26 × 20 × 8 cm",
    ],
    colors: ["Cognac", "Black", "Natural Tan"],
    sizes: ["One Size"],
    bestSeller: true,
  },
  {
    slug: "brackenridge-derby-boots",
    name: "Brackenridge Derby Boots",
    category: "footwear",
    price: 12999,
    mrp: 17499,
    rating: 4.7,
    reviews: 128,
    img: bootsImg,
    gallery: [bootsImg, heroImg, beltImg],
    description:
      "Goodyear-welted derby boots on a leather midsole and rubber outsole. Built to be resoled again and again.",
    details: [
      "Goodyear-welted construction",
      "Full-grain calf upper, leather lining",
      "Rubber commando outsole",
      "Resolable for life",
    ],
    colors: ["Espresso", "Cognac", "Black"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
  },
  {
    slug: "penhurst-leather-loafers",
    name: "Penhurst Leather Loafers",
    category: "footwear",
    price: 8999,
    mrp: 11999,
    rating: 4.5,
    reviews: 74,
    img: bootsImg,
    gallery: [bootsImg, heroImg],
    description:
      "An unlined penny loafer that softens with every wear. Blake-stitched for flexibility straight out of the box.",
    details: [
      "Blake-stitched, unlined upper",
      "Full-grain leather sole",
      "Hand-finished patina",
      "Half sizes available on request",
    ],
    colors: ["Cognac", "Espresso"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
  },
  {
    slug: "ridgeline-laptop-briefcase",
    name: "Ridgeline Laptop Briefcase",
    category: "bags",
    price: 10499,
    mrp: 13999,
    rating: 4.8,
    reviews: 88,
    img: heroImg,
    gallery: [heroImg, toteImg, duffelImg],
    description:
      "A padded 16\" laptop briefcase with a trolley sleeve, twin document compartments and a full-width rear zip pocket.",
    details: [
      "Padded 16\" laptop compartment",
      "Trolley sleeve for travel",
      "Full-grain leather with brass feet",
      "Dimensions: 41 × 31 × 10 cm",
    ],
    colors: ["Espresso", "Black", "Cognac"],
    sizes: ["One Size"],
  },
  {
    slug: "solid-cut-dress-belt",
    name: "Solid-Cut Dress Belt",
    category: "belts",
    price: 1699,
    mrp: 2399,
    rating: 4.6,
    reviews: 210,
    img: beltImg,
    gallery: [beltImg, walletImg],
    description:
      "A 30mm dress belt cut from the firmest part of the hide, edge-painted in five coats and finished with a slim brass frame buckle.",
    details: [
      "30mm single-ply full-grain leather",
      "Five-coat hand-painted edges",
      "Slim brass frame buckle",
      "Trim-to-fit at home",
    ],
    colors: ["Black", "Espresso", "Cognac"],
    sizes: ["30", "32", "34", "36", "38"],
  },
  {
    slug: "atlas-cabin-holdall",
    name: "Atlas Cabin Holdall",
    category: "travel",
    price: 15999,
    mrp: 21499,
    rating: 4.9,
    reviews: 61,
    img: duffelImg,
    gallery: [duffelImg, heroImg],
    description:
      "Our largest carry: a 55-litre holdall with reinforced corners, a lockable double zip and leather that ages into a deep patina.",
    details: [
      "55L, reinforced riveted corners",
      "Lockable double-zip closure",
      "Removable garment divider",
      "Dimensions: 60 × 34 × 30 cm",
    ],
    colors: ["Cognac", "Espresso"],
    sizes: ["55L"],
  },
  {
    slug: "traveller-passport-sleeve",
    name: "Traveller Passport Sleeve",
    category: "travel",
    price: 1599,
    mrp: 2199,
    rating: 4.4,
    reviews: 143,
    img: cardholderImg,
    gallery: [cardholderImg, walletImg],
    description:
      "Holds a passport, two boarding passes and three cards. Slim enough for an inside jacket pocket.",
    details: [
      "Full-grain leather, unlined",
      "Passport pocket + 3 card slots",
      "RFID-blocking option available",
      "Dimensions: 14 × 10 cm",
    ],
    colors: LEATHER_COLORS,
    sizes: ["One Size"],
  },
  {
    slug: "zip-around-travel-wallet",
    name: "Zip-Around Travel Wallet",
    category: "wallets",
    price: 3499,
    mrp: 4699,
    rating: 4.7,
    reviews: 97,
    img: walletImg,
    gallery: [walletImg, cardholderImg],
    description:
      "A zip-around organiser with space for currency, cards, tickets and a pen. The one you take abroad.",
    details: [
      "YKK Excella zip, brass pull",
      "8 card slots, 3 note sleeves",
      "Pen loop and coin pocket",
      "Dimensions: 20 × 11 cm",
    ],
    colors: ["Cognac", "Black"],
    sizes: ["One Size"],
  },
  {
    slug: "everyday-leather-backpack",
    name: "Everyday Leather Backpack",
    category: "bags",
    price: 13499,
    mrp: 17999,
    rating: 4.8,
    reviews: 152,
    img: toteImg,
    gallery: [toteImg, crossbodyImg, heroImg],
    description:
      "A roll-top backpack with padded straps, a laptop sleeve and side entry so you never have to unroll it in a hurry.",
    details: [
      "Roll-top with leather strap closure",
      "Padded 15\" laptop sleeve",
      "Quick side-entry zip",
      "Capacity: 22L",
    ],
    colors: ["Cognac", "Espresso", "Black"],
    sizes: ["One Size"],
  },
];

export const bestSellers = products.filter((p) => p.bestSeller);

export const productsByCategory = (slug: CategorySlug) =>
  products.filter((p) => p.category === slug);

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const discountPct = (p: { price: number; mrp: number }) =>
  Math.round(((p.mrp - p.price) / p.mrp) * 100);
