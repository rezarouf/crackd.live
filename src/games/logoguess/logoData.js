const si = (slug) => `https://cdn.simpleicons.org/${slug}`;

export const LOGOS = [

  // ── Technology ──────────────────────────────────────────────────────────
  { name: 'Apple',       answer: 'apple',       category: 'Tech',    imageUrl: si('apple') },
  { name: 'Google',      answer: 'google',      category: 'Tech',    imageUrl: si('google') },
  { name: 'Microsoft',   answer: 'microsoft',   category: 'Tech',    imageUrl: si('microsoft') },
  { name: 'Amazon',      answer: 'amazon',      category: 'Tech',    imageUrl: si('amazon') },
  { name: 'Tesla',       answer: 'tesla',       category: 'Tech',    imageUrl: si('tesla') },
  { name: 'Nvidia',      answer: 'nvidia',      category: 'Tech',    imageUrl: si('nvidia') },
  { name: 'Intel',       answer: 'intel',       category: 'Tech',    imageUrl: si('intel') },
  { name: 'AMD',         answer: 'amd',         category: 'Tech',    imageUrl: si('amd') },
  { name: 'Dell',        answer: 'dell',        category: 'Tech',    imageUrl: si('dell') },
  { name: 'HP',          answer: 'hp',          category: 'Tech',    imageUrl: si('hp') },
  { name: 'Lenovo',      answer: 'lenovo',      category: 'Tech',    imageUrl: si('lenovo') },
  { name: 'Asus',        answer: 'asus',        category: 'Tech',    imageUrl: si('asus') },
  { name: 'Adobe',       answer: 'adobe',       category: 'Tech',    imageUrl: si('adobe') },
  { name: 'Samsung',     answer: 'samsung',     category: 'Tech',    imageUrl: si('samsung') },
  { name: 'LG',          answer: 'lg',          category: 'Tech',    imageUrl: si('lg') },
  { name: 'Sony',        answer: 'sony',        category: 'Tech',    imageUrl: si('sony') },
  { name: 'Philips',     answer: 'philips',     category: 'Tech',    imageUrl: si('philips') },
  { name: 'Nikon',       answer: 'nikon',       category: 'Tech',    imageUrl: si('nikon') },
  { name: 'Canon',       answer: 'canon',       category: 'Tech',    imageUrl: si('canon') },
  { name: 'GoPro',       answer: 'gopro',       category: 'Tech',    imageUrl: si('gopro') },
  { name: 'Bose',        answer: 'bose',        category: 'Tech',    imageUrl: si('bose') },

  // ── Social & Apps ───────────────────────────────────────────────────────
  { name: 'YouTube',    answer: 'youtube',    category: 'Social', aliases: ['yt'],      imageUrl: si('youtube') },
  { name: 'Instagram',  answer: 'instagram',  category: 'Social', aliases: ['insta'],   imageUrl: si('instagram') },
  { name: 'Facebook',   answer: 'facebook',   category: 'Social', aliases: ['fb', 'meta'], imageUrl: si('facebook') },
  { name: 'Twitter',    answer: 'twitter',    category: 'Social', aliases: ['x'],       imageUrl: si('twitter') },
  { name: 'TikTok',     answer: 'tiktok',     category: 'Social',                       imageUrl: si('tiktok') },
  { name: 'Snapchat',   answer: 'snapchat',   category: 'Social',                       imageUrl: si('snapchat') },
  { name: 'LinkedIn',   answer: 'linkedin',   category: 'Social',                       imageUrl: si('linkedin') },
  { name: 'WhatsApp',   answer: 'whatsapp',   category: 'Social',                       imageUrl: si('whatsapp') },
  { name: 'Telegram',   answer: 'telegram',   category: 'Social',                       imageUrl: si('telegram') },
  { name: 'Discord',    answer: 'discord',    category: 'Social',                       imageUrl: si('discord') },
  { name: 'Twitch',     answer: 'twitch',     category: 'Social',                       imageUrl: si('twitch') },
  { name: 'Reddit',     answer: 'reddit',     category: 'Social',                       imageUrl: si('reddit') },
  { name: 'Pinterest',  answer: 'pinterest',  category: 'Social',                       imageUrl: si('pinterest') },
  { name: 'Spotify',    answer: 'spotify',    category: 'Social',                       imageUrl: si('spotify') },
  { name: 'Netflix',    answer: 'netflix',    category: 'Social',                       imageUrl: si('netflix') },

  // ── Productivity & Dev ──────────────────────────────────────────────────
  { name: 'Zoom',       answer: 'zoom',       category: 'Productivity', imageUrl: si('zoom') },
  { name: 'Slack',      answer: 'slack',      category: 'Productivity', imageUrl: si('slack') },
  { name: 'Dropbox',    answer: 'dropbox',    category: 'Productivity', imageUrl: si('dropbox') },
  { name: 'Notion',     answer: 'notion',     category: 'Productivity', imageUrl: si('notion') },
  { name: 'Figma',      answer: 'figma',      category: 'Productivity', imageUrl: si('figma') },
  { name: 'GitHub',     answer: 'github',     category: 'Productivity', imageUrl: si('github') },
  { name: 'Canva',      answer: 'canva',      category: 'Productivity', imageUrl: si('canva') },
  { name: 'Shopify',    answer: 'shopify',    category: 'Productivity', imageUrl: si('shopify') },
  { name: 'WordPress',  answer: 'wordpress',  category: 'Productivity', imageUrl: si('wordpress') },
  { name: 'Substack',   answer: 'substack',   category: 'Productivity', imageUrl: si('substack') },
  { name: 'Medium',     answer: 'medium',     category: 'Productivity', imageUrl: si('medium') },

  // ── E-commerce & Finance ────────────────────────────────────────────────
  { name: 'Uber',       answer: 'uber',       category: 'Finance', imageUrl: si('uber') },
  { name: 'Airbnb',     answer: 'airbnb',     category: 'Finance', imageUrl: si('airbnb') },
  { name: 'PayPal',     answer: 'paypal',     category: 'Finance', imageUrl: si('paypal') },
  { name: 'Visa',       answer: 'visa',       category: 'Finance', imageUrl: si('visa') },
  { name: 'Mastercard', answer: 'mastercard', category: 'Finance', imageUrl: si('mastercard') },
  { name: 'eBay',       answer: 'ebay',       category: 'Finance', imageUrl: si('ebay') },
  { name: 'Alibaba',    answer: 'alibaba',    category: 'Finance', imageUrl: si('alibaba') },

  // ── Gaming ──────────────────────────────────────────────────────────────
  { name: 'Xbox',        answer: 'xbox',        category: 'Gaming', imageUrl: si('xbox') },
  { name: 'PlayStation', answer: 'playstation', category: 'Gaming', aliases: ['ps', 'ps5'], imageUrl: si('playstation') },
  { name: 'Nintendo',    answer: 'nintendo',    category: 'Gaming', imageUrl: si('nintendo') },
  { name: 'EA',          answer: 'ea',          category: 'Gaming', aliases: ['easports'],  imageUrl: si('ea') },
  { name: 'Ubisoft',     answer: 'ubisoft',     category: 'Gaming', imageUrl: si('ubisoft') },
  { name: 'Steam',       answer: 'steam',       category: 'Gaming', imageUrl: si('steam') },
  { name: 'Epic Games',  answer: 'epicgames',   category: 'Gaming', aliases: ['epic'],      imageUrl: si('epicgames') },
  { name: 'Roblox',      answer: 'roblox',      category: 'Gaming', imageUrl: si('roblox') },

  // ── Media & News ────────────────────────────────────────────────────────
  { name: 'BBC',         answer: 'bbc',         category: 'Media', imageUrl: si('bbc') },
  { name: 'CNN',         answer: 'cnn',         category: 'Media', imageUrl: si('cnn') },
  { name: 'Reuters',     answer: 'reuters',     category: 'Media', imageUrl: si('reuters') },
  { name: 'New York Times', answer: 'nyt',      category: 'Media', aliases: ['nytimes', 'new york times'], imageUrl: si('nytimes') },
  { name: 'Duolingo',    answer: 'duolingo',    category: 'Media', imageUrl: si('duolingo') },

  // ── Food & Beverage ─────────────────────────────────────────────────────
  { name: "McDonald's", answer: 'mcdonalds', category: 'Food', aliases: ['mcdonald'],           imageUrl: si('mcdonalds') },
  { name: 'Coca-Cola',  answer: 'cocacola',  category: 'Food', aliases: ['coke', 'coca cola'],  imageUrl: si('cocacola') },
  { name: 'Pepsi',      answer: 'pepsi',     category: 'Food',                                  imageUrl: si('pepsi') },
  { name: 'Starbucks',  answer: 'starbucks', category: 'Food',                                  imageUrl: si('starbucks') },
  { name: 'Red Bull',   answer: 'redbull',   category: 'Food', aliases: ['red bull'],           imageUrl: si('redbull') },

  // ── Fashion ─────────────────────────────────────────────────────────────
  { name: 'Nike',          answer: 'nike',          category: 'Fashion',                                       imageUrl: si('nike') },
  { name: 'Adidas',        answer: 'adidas',        category: 'Fashion',                                       imageUrl: si('adidas') },
  { name: 'Puma',          answer: 'puma',          category: 'Fashion',                                       imageUrl: si('puma') },
  { name: 'Reebok',        answer: 'reebok',        category: 'Fashion',                                       imageUrl: si('reebok') },
  { name: 'Gucci',         answer: 'gucci',         category: 'Fashion',                                       imageUrl: si('gucci') },
  { name: 'Louis Vuitton', answer: 'louisvuitton',  category: 'Fashion', aliases: ['lv', 'louis vuitton'],     imageUrl: si('louisvuitton') },
  { name: 'Chanel',        answer: 'chanel',        category: 'Fashion',                                       imageUrl: si('chanel') },
  { name: 'Dior',          answer: 'dior',          category: 'Fashion',                                       imageUrl: si('dior') },
  { name: 'Prada',         answer: 'prada',         category: 'Fashion',                                       imageUrl: si('prada') },
  { name: 'Versace',       answer: 'versace',       category: 'Fashion',                                       imageUrl: si('versace') },
  { name: 'Zara',          answer: 'zara',          category: 'Fashion',                                       imageUrl: si('zara') },
  { name: 'Rolex',         answer: 'rolex',         category: 'Fashion',                                       imageUrl: si('rolex') },

  // ── Automotive ──────────────────────────────────────────────────────────
  { name: 'BMW',           answer: 'bmw',           category: 'Auto',                                          imageUrl: si('bmw') },
  { name: 'Mercedes-Benz', answer: 'mercedesbenz',  category: 'Auto', aliases: ['mercedes', 'benz'],           imageUrl: si('mercedes') },
  { name: 'Toyota',        answer: 'toyota',        category: 'Auto',                                          imageUrl: si('toyota') },
  { name: 'Ferrari',       answer: 'ferrari',       category: 'Auto',                                          imageUrl: si('ferrari') },
  { name: 'Lamborghini',   answer: 'lamborghini',   category: 'Auto',                                          imageUrl: si('lamborghini') },
  { name: 'Audi',          answer: 'audi',          category: 'Auto',                                          imageUrl: si('audi') },
  { name: 'Honda',         answer: 'honda',         category: 'Auto',                                          imageUrl: si('honda') },
  { name: 'Volkswagen',    answer: 'volkswagen',    category: 'Auto', aliases: ['vw', 'volkswagon'],           imageUrl: si('volkswagen') },
  { name: 'Hyundai',       answer: 'hyundai',       category: 'Auto',                                          imageUrl: si('hyundai') },
  { name: 'Porsche',       answer: 'porsche',       category: 'Auto',                                          imageUrl: si('porsche') },

  // ── Airlines & Energy ───────────────────────────────────────────────────
  { name: 'Emirates', answer: 'emirates', category: 'Airline', imageUrl: si('emirates') },
  { name: 'Shell',    answer: 'shell',    category: 'Energy',  imageUrl: si('shell') },

  // ── Retail ──────────────────────────────────────────────────────────────
  { name: 'IKEA', answer: 'ikea', category: 'Retail', imageUrl: si('ikea') },
];
