export interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  content: string; // Full article content
  author: string;
  publishedDate: string;
}

export const articles: Article[] = [
  {
    id: "understanding-common-pain-relievers",
    title: "Understanding Common Pain Relievers",
    summary: "Learn the difference between Paracetamol and Ibuprofen, their uses, and when to take them for effective and safe pain management.",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673681/commonpainrelievers_oppbhh.jpg",
    author: "Dr. Ada Okoro",
    publishedDate: "July 28, 2024",
    content: `
Pain is a common ailment, but choosing the right over-the-counter (OTC) pain reliever can be confusing. Two of the most popular options are Paracetamol and Ibuprofen. While both are effective, they work differently and are suited for different types of pain.

**Paracetamol (Acetaminophen)**

Paracetamol is primarily a pain reliever (analgesic) and fever reducer (antipyretic). It's thought to work by blocking chemical messengers in the brain that tell us we have pain.

*   **Best for:** Headaches, fevers, and mild to moderate aches and pains without inflammation, such as muscle aches.
*   **Key point:** It's gentle on the stomach and a good first choice for general pain.

**Ibuprofen**

Ibuprofen belongs to a class of drugs called nonsteroidal anti-inflammatory drugs (NSAIDs). It works by reducing hormones that cause pain and swelling in the body.

*   **Best for:** Pain that involves inflammation, such as period pain, arthritis, sprains, and dental pain.
*   **Key point:** It should be taken with food to avoid stomach irritation. It's not suitable for everyone, especially those with stomach, kidney, or heart problems.

**Which one should you choose?**

For fevers or general aches, Paracetamol is often the preferred first option. If your pain is inflammatory (involving swelling, redness, and heat), Ibuprofen might be more effective. Always read the label and do not exceed the recommended dose. If you're unsure, consult your pharmacist or doctor.
    `,
  },
  {
    id: "the-importance-of-vitamin-d",
    title: "The Importance of Vitamin D",
    summary: "Discover why Vitamin D is crucial for bone health, immune function, and overall well-being, especially during seasons with less sun exposure.",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673688/vitaminD2_n8ylyp.jpg",
    author: "Dr. Tunde Adebayo",
    publishedDate: "July 25, 2024",
    content: `
Often called the "sunshine vitamin," Vitamin D is a crucial nutrient that plays several vital roles in the body. Unlike other vitamins, our bodies can produce it when our skin is exposed to sunlight. However, many people still have insufficient levels.

**Why is Vitamin D important?**

1.  **Bone Health:** Vitamin D is essential for the absorption of calcium and phosphorus, two minerals that are critical for building and maintaining strong bones. A deficiency can lead to conditions like rickets in children and osteomalacia or osteoporosis in adults.

2.  **Immune System Support:** It helps modulate the immune system, and studies have shown that a deficiency may increase susceptibility to infections.

3.  **Mood Regulation:** Research suggests a link between low Vitamin D levels and mood disorders, including depression. Getting enough Vitamin D may play a role in regulating mood and warding off depression.

**How to get enough Vitamin D?**

*   **Sunlight:** The best source. Aim for 10-30 minutes of midday sun exposure several times a week, depending on your skin type.
*   **Foods:** Fatty fish (like salmon and mackerel), fortified milk, and cereals are good dietary sources.
*   **Supplements:** If you have limited sun exposure or dietary intake, a supplement may be necessary. Consult a healthcare professional to determine the right dosage for you.
    `,
  },
  {
    id: "tips-for-managing-seasonal-allergies",
    title: "Tips for Managing Seasonal Allergies",
    summary: "Don't let allergies ruin your season. Here are some effective tips and remedies to help you manage symptoms and breathe easier.",
    imageUrl: "https://res.cloudinary.com/dzbibbld6/image/upload/v1768673682/seasnalallegies_ercnva.jpg",
    author: "Dr. Chiamaka Nwosu",
    publishedDate: "July 22, 2024",
    content: `
Seasonal allergies, often called hay fever, can turn a beautiful day into a miserable experience with sneezing, itching, and a runny nose. These allergies are typically caused by pollen from trees, grasses, and weeds. Here are some practical tips to manage your symptoms.

**1. Minimize Pollen Exposure**

*   Stay indoors on dry, windy days. The best time to go outside is after a good rain, which helps clear pollen from the air.
*   Keep windows and doors closed at home and in your car during pollen season.
*   Wear a mask when doing yard work like mowing the lawn.
*   Shower and change your clothes after you've been outside to wash off pollen.

**2. Over-the-Counter (OTC) Remedies**

*   **Antihistamines:** These are often the first line of defense. They can relieve sneezing, itching, a runny nose, and watery eyes. Options include Cetirizine, Loratadine, and Fexofenadine.
*   **Nasal Sprays:** Corticosteroid nasal sprays are highly effective at reducing inflammation in your nasal passages.
*   **Decongestants:** These can provide temporary relief from nasal stuffiness but should not be used for more than a few days in a row.

**3. Consult a Professional**

If OTC remedies aren't providing enough relief, it's a good idea to speak with a doctor or pharmacist. They can recommend prescription medications or other treatment options, such as allergy shots (immunotherapy), for long-term relief.
    `,
  },
];
