/**
 * Preset Avatar Configuration
 * Using DiceBear API for consistent, high-quality avatars that match our dark tech aesthetic
 */

export const PRESET_AVATARS = [
  // Notionists - Professional character avatars
  "https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Aneka&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Mila&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Robert&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Sheba&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Luna&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Max&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/notionists/svg?seed=Zara&backgroundColor=1e293b",

  // Bottts - Robot/Tech themed avatars for the tech vibe
  "https://api.dicebear.com/9.x/bottts/svg?seed=Tech1&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Tech2&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Tech3&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/bottts/svg?seed=Tech4&backgroundColor=1e293b",

  // Shapes - Abstract geometric avatars
  "https://api.dicebear.com/9.x/shapes/svg?seed=Abstract1&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/shapes/svg?seed=Abstract2&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/shapes/svg?seed=Abstract3&backgroundColor=1e293b",
  "https://api.dicebear.com/9.x/shapes/svg?seed=Abstract4&backgroundColor=1e293b",
];

/**
 * Get a random avatar from the preset list
 * Useful for assigning default avatars to new users
 */
export function getRandomAvatar(): string {
  return PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
}
