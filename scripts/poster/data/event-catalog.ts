import type { EventCatalogData } from "../lib/types";

/** Shared item photos + names; tag text differs per language. */
const POSES = [
  { photo: "doll-surya.jpg", name: "Surya Tadasana Ready", en: "Morning energy, ready for yoga", id: "Energi pagi, siap yoga" },
  { photo: "doll-chandra.jpg", name: "Chandra Shanti Pose", en: "Calm as night", id: "Tenang seperti malam" },
  { photo: "doll-vayu.jpg", name: "Vayu Sukhasana Smile", en: "Light, cheerful, free", id: "Ringan, ceria, bebas" },
  { photo: "doll-anahata.jpg", name: "Anahata Anjali Mudra", en: "Full of love & serenity", id: "Penuh cinta & ketenangan" },
  { photo: "doll-arjuna.jpg", name: "Arjuna Dhyana", en: "Focus, calm, wise", id: "Fokus, tenang, bijak" },
  { photo: "doll-shiva.jpg", name: "Shiva Pranam Mudra", en: "Spiritual, strong, deep", id: "Spiritual, kuat, dalam" },
  { photo: "doll-agni.jpg", name: "Agni Surya Namaskar", en: "Energetic, warm, active", id: "Energik, hangat, aktif" },
  { photo: "doll-rishi.jpg", name: "Rishi Shanti Pose", en: "Wise, calm, peaceful", id: "Bijak, tenang, damai" },
];

export const eventCatalogs: EventCatalogData[] = [
  {
    slug: "katalog-boneka-id",
    size: "A3",
    orientation: "portrait",
    columns: 4,
    logo: "logo.png",
    brandTag: "#temanyoga",
    heading: "KATALOG",
    subtitle: "Teman Baik Yoga – Boneka Rajut Yoga",
    tagline: "Aku menghirup kedamaian. Aku tenang. Aku merasa cukup.",
    intro:
      "Teman kecil handmade untuk menemani mat yoga dan momen meditasimu. Poseable, bisa diatur sesuai pose favoritmu. Ekspresi tenang dengan tangan anjali mudra bikin hati langsung adem.",
    items: POSES.map((p) => ({ photo: p.photo, name: p.name, tag: p.id })),
    detailTitle: "Detail",
    details: [
      { label: "Bahan", value: "Benang polychery 100% polyester vegan-friendly. Serat kuat & awet, isi dakron, aksesoris manik." },
      { label: "Ukuran", value: "15–17 cm" },
      { label: "Fitur", value: "Dilengkapi mini yoga mat rajut" },
    ],
    inspirationTitle: "Inspirasi",
    inspiration:
      "Terinspirasi dari yogini di seluruh dunia yang percaya bahwa yoga adalah tentang hadir dan menerima diri sendiri apa adanya.",
  },
  {
    slug: "catalog-doll-en",
    size: "A3",
    orientation: "portrait",
    columns: 4,
    logo: "logo.png",
    brandTag: "#temanyoga",
    heading: "CATALOG",
    subtitle: "Yoga Best Friend – Crochet Yoga Doll",
    tagline: "I breathe in peace. I am calm. I am enough.",
    intro:
      "A little handmade companion to accompany your yoga mat and meditation moments. Poseable and adjustable to match your favorite poses. Its calm expression and anjali mudra hands bring an instant sense of peace and serenity.",
    items: POSES.map((p) => ({ photo: p.photo, name: p.name, tag: p.en })),
    detailTitle: "Detail",
    details: [
      { label: "Material", value: "Polychery yarn, 100% vegan-friendly polyester. Strong, durable fiber, Dacron filling and bead accessories." },
      { label: "Size", value: "15–17 cm" },
      { label: "Feature", value: "Comes with a knitted mini yoga mat" },
    ],
    inspirationTitle: "Inspiration",
    inspiration:
      "Inspired by yoginis around the world who believe that yoga is about being present and embracing yourself as you are.",
  },
];
