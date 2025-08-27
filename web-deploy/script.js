// Social Media AI Agent - Frontend Logic
// No external APIs used; uses heuristics and prompt engineering to generate plans

const state = {
  plan: null,
  currentWeekIndex: 0,
  totalWeeks: 0,
};

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const PLATFORM_TEMPLATES = {
  instagram: {
    frequencyByStage: { starter: 5, grow: 6, scale: 7 },
    contentMix: [
      { type: "Reel", ratio: 0.35 },
      { type: "Carousel", ratio: 0.25 },
      { type: "Story", ratio: 0.25 },
      { type: "Static Post", ratio: 0.15 },
    ],
    bestTimes: ["9:00", "12:00", "18:00"],
    hooks: [
      "You won't believe this...",
      "Stop scrolling if...",
      "3 mistakes you're making...",
      "Nobody talks about this...",
      "I tried X so you don't have to",
    ],
    ctas: [
      "Follow for more tips",
      "Save this for later",
      "Comment 'GUIDE' for the checklist",
      "Share this with a friend",
      "Double tap if this helped",
    ],
  },
  tiktok: {
    frequencyByStage: { starter: 7, grow: 10, scale: 12 },
    contentMix: [
      { type: "Trend Remix", ratio: 0.3 },
      { type: "Educational", ratio: 0.25 },
      { type: "Behind the Scenes", ratio: 0.2 },
      { type: "Challenge", ratio: 0.15 },
      { type: "Duet/Stitch", ratio: 0.1 },
    ],
    bestTimes: ["8:00", "12:00", "16:00", "20:00"],
    hooks: [
      "No one is telling you this...",
      "POV: you're trying to...",
      "If you do this, stop...",
      "I found the secret to...",
      "Here's how to go from X to Y",
    ],
    ctas: [
      "Hit follow for daily tips",
      "Comment for part 2",
      "Tag someone who needs this",
      "Save to try this later",
      "Share to your story",
    ],
  },
  youtube: {
    frequencyByStage: { starter: 2, grow: 3, scale: 4 },
    contentMix: [
      { type: "How-To Tutorial", ratio: 0.35 },
      { type: "Listicle/Guide", ratio: 0.25 },
      { type: "Case Study/Story", ratio: 0.2 },
      { type: "Shorts", ratio: 0.2 },
    ],
    bestTimes: ["10:00", "13:00", "17:00"],
    hooks: [
      "I wish I knew this earlier...",
      "The truth about...",
      "Do this before you...",
      "X lessons after Y years",
      "From X to Y: my step-by-step",
    ],
    ctas: [
      "Subscribe for weekly videos",
      "Comment your question below",
      "Download the free checklist",
      "Like if this helped",
      "Turn on notifications",
    ],
  },
  twitter: {
    frequencyByStage: { starter: 14, grow: 21, scale: 28 },
    contentMix: [
      { type: "Thread", ratio: 0.25 },
      { type: "One-liners", ratio: 0.35 },
      { type: "Screenshots/Visuals", ratio: 0.2 },
      { type: "Engagement Questions", ratio: 0.2 },
    ],
    bestTimes: ["8:00", "12:00", "15:00", "18:00"],
    hooks: [
      "Here's how I...",
      "Everyone says X, but...",
      "I analyzed Y and here's what I found",
      "If you're struggling with X, read this",
      "Do this to avoid Y",
    ],
    ctas: [
      "RT to help others",
      "Follow for more",
      "Reply with your experience",
      "Bookmark for later",
      "DM me 'GUIDE'",
    ],
  },
  linkedin: {
    frequencyByStage: { starter: 5, grow: 7, scale: 9 },
    contentMix: [
      { type: "Story Post", ratio: 0.3 },
      { type: "How-To", ratio: 0.25 },
      { type: "Carousel", ratio: 0.25 },
      { type: "Engagement Question", ratio: 0.2 },
    ],
    bestTimes: ["8:30", "12:30", "17:30"],
    hooks: [
      "Here's what no one tells you about...",
      "I made this mistake so you don't have to",
      "The framework I use for...",
      "From X to Y in Z months",
      "If you're in [industry], read this",
    ],
    ctas: [
      "Comment your thoughts",
      "Follow for more insights",
      "Share with your team",
      "Save for your next meeting",
      "DM me for the template",
    ],
  },
  facebook: {
    frequencyByStage: { starter: 5, grow: 7, scale: 9 },
    contentMix: [
      { type: "Short Video", ratio: 0.3 },
      { type: "Image + Caption", ratio: 0.3 },
      { type: "Link Post", ratio: 0.2 },
      { type: "Live/Q&A", ratio: 0.2 },
    ],
    bestTimes: ["9:00", "13:00", "18:00"],
    hooks: [
      "We need to talk about...",
      "This changed everything for me",
      "If you're doing this, stop now",
      "Can we be honest about...",
      "The exact steps to...",
    ],
    ctas: [
      "Like & Follow",
      "Comment your thoughts",
      "Share with a friend",
      "Save for later",
      "Join the group",
    ],
  },
};

const NICHE_CONTENT_PILLARS = {
  lifestyle: ["Daily Routines", "Wellness & Productivity", "Favorites/Hauls", "Behind the Scenes", "Relatable Humor"],
  fitness: ["Workouts", "Nutrition", "Form Tips", "Progress & Challenges", "Mindset"],
  beauty: ["Makeup Tutorials", "Skincare", "Before/After", "Product Reviews", "Trends"],
  food: ["Quick Recipes", "Meal Prep", "Budget Meals", "Kitchen Hacks", "Taste Tests"],
  travel: ["Itineraries", "Hidden Gems", "Budget Tips", "Packing", "Photo Spots"],
  tech: ["Gadgets", "How-Tos", "App Reviews", "Automation", "AI Tips"],
  business: ["Playbooks", "Case Studies", "Frameworks", "Tools", "Founder Stories"],
  education: ["Micro-lessons", "Study Hacks", "Frameworks", "Quizzes", "Resources"],
  entertainment: ["Skits", "Reactions", "Trends", "Behind the Scenes", "Collaborations"],
  parenting: ["Daily Routines", "Tips & Hacks", "Activities", "Meal Ideas", "Honest Moments"],
  finance: ["Budgeting", "Investing", "Side Hustles", "Credit Tips", "Mistakes"],
  diy: ["Tutorials", "Materials", "Before/After", "Time-lapse", "Fails & Fixes"],
  gaming: ["Highlights", "How-Tos", "Setups", "Reviews", "Esports Commentary"],
  music: ["Covers", "Originals", "Gear", "Behind the Music", "Practice Routines"],
  art: ["Process", "Sketchbook", "Tools", "Time-lapse", "Commissions"],
  realestate: ["Listing Highlights", "Neighborhood Tours", "Market Updates", "Buyer Tips", "Seller Tips"],
};

function $(id) { return document.getElementById(id); }

function showLoading(show) {
  const overlay = $("loadingOverlay");
  if (overlay) {
    overlay.style.display = show ? "flex" : "none";
  }
}

function getSelectedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(i => i.value);
}

function stageFromFollowers(range) {
  switch(range) {
    case "0-1k": return "starter";
    case "1k-10k": return "starter";
    case "10k-100k": return "grow";
    case "100k-1m": return "scale";
    case "1m+": return "scale";
    default: return "starter";
  }
}

function randomPick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function slugify(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function unique(arr){ return Array.from(new Set((arr||[]).filter(Boolean))); }

// Industry trend library (heuristic, updated periodically)
const TREND_LIBRARY = {
  lifestyle: { global: ["Routines","AM/PM reset","Habit stacking","Minimalism","Wellness swaps"], instagram:["Day in the life","Sunday reset"], tiktok:["GRWM","Aesthetic desk"], youtube:["Morning routine","Night routine"], linkedin:["Work-life balance"] },
  fitness: { global: ["Zone 2","Progressive overload","30g protein","Mobility","Pilates"], instagram:["Workout split","Form tips"], tiktok:["75 Hard","Hot girl walk","Pilates"], youtube:["Full day of eating","Push Pull Legs"], linkedin:["Wellness at work"] },
  beauty: { global: ["Skin cycling","Retinol sandwich","Glazed skin","Brow lamination"], instagram:["Get ready with me"], tiktok:["Blush draping","Clean girl"], youtube:["Dupe comparisons","Before & After"], linkedin:["Brand storytelling"] },
  food: { global: ["High-protein recipes","Meal prep","Air fryer","5-ingredient","Budget meals"], instagram:["Recipe reels"], tiktok:["What I eat in a day"], youtube:["Meal prep guide"], linkedin:["Food biz ops"] },
  travel: { global: ["Hidden gems","Itineraries","Travel hacks","Carry-on only"], instagram:["Photo spots"], tiktok:["Travel transitions"], youtube:["City guide"], linkedin:["Remote work travel"] },
  tech: { global: ["AI tools","Automation","No-code","Productivity stack"], instagram:["App carousels"], tiktok:["Prompt hacks"], youtube:["Tool breakdowns"], linkedin:["SaaS playbooks","B2B content"] },
  business: { global: ["Personal branding","UGC","Cold DM","Offer building","Notion templates"], instagram:["Carousel frameworks"], tiktok:["One-person business"], youtube:["Case studies"], linkedin:["Founder stories","Hiring"] },
  education: { global: ["Study with me","Flashcards","Pomodoro","AI tutors"], instagram:["Carousel lessons"], tiktok:["Note templates"], youtube:["Deep dives"], linkedin:["L&D tips"] },
  entertainment: { global: ["Reaction","Duets","Memes","Behind the scenes"], instagram:["Short skits"], tiktok:["Trend remix"], youtube:["Commentary"], linkedin:["Creator economy"] },
  parenting: { global: ["Routines","Activities","Meal ideas","Honest moments"], instagram:["Toddler hacks"], tiktok:["Day in the life"], youtube:["Tips & tricks"], linkedin:["Work + parenthood"] },
  finance: { global: ["Budgeting","Investing","Side hustles","Credit hacks"], instagram:["Money carousels"], tiktok:["Paycheck breakdown"], youtube:["How to invest"], linkedin:["Wealth building"] },
  diy: { global: ["Before/After","Tutorials","Time-lapse","Thrift flips"], instagram:["Project reels"], tiktok:["Satisfying builds"], youtube:["Tool guides"], linkedin:["Makers"] },
  gaming: { global: ["Highlights","Setups","Esports","New releases"], instagram:["Clip reels"], tiktok:["Montages"], youtube:["Reviews"], linkedin:["Games industry"] },
  music: { global: ["Covers","Originals","Gear","Practice routines"], instagram:["Reels covers"], tiktok:["Duets"], youtube:["Behind the song"], linkedin:["Music biz"] },
  art: { global: ["Process","Sketchbook","Time-lapse","Inktober"], instagram:["Reels process"], tiktok:["Satisfying timelapse"], youtube:["Tutorials"], linkedin:["Creative process"] },
  realestate: { global: ["Open house tours","Before & After","Staging tips","Interest rates","First-time buyers","House hacking"], instagram:["Listing highlights","Buyer checklist carousels"], tiktok:["POV home tours","Zillow finds","Offer myths"], youtube:["Neighborhood guides","Market updates"], linkedin:["Market reports","Agent branding"] },
};

function analyzeBranding(inputs){
  const style = (inputs.contentStyle||'').toLowerCase();
  const audience = (inputs.targetAudience||'').toLowerCase();
  let tone = 'neutral';
  if (/(professional|b2b|corporate|formal|linkedin|executive)/.test(style) || /b2b|founder|saas|team|agency/.test(audience)) tone = 'professional';
  else if (/(luxury|premium|minimal|elegant|high-end)/.test(style)) tone = 'luxury';
  else if (/(eco|sustainable|green|ethical|climate)/.test(style)) tone = 'eco';
  else if (/(edgy|bold|controversial|hot take)/.test(style)) tone = 'edgy';
  else if (/(playful|fun|quirky|casual|emoji|gen z)/.test(style)) tone = 'playful';

  let audienceTag = 'general';
  if (/b2b|founder|startup|saas|agency|enterprise/.test(audience)) audienceTag='b2b';
  else if (/gen z|18-24|students|college|teen/.test(audience)) audienceTag='genz';
  else if (/millennial|25-34|young professional/.test(audience)) audienceTag='millennial';
  else if (/parents|moms|dads|family/.test(audience)) audienceTag='parents';

  return { tone, audienceTag };
}

function suggestTrends(inputs){
  const lib = TREND_LIBRARY[inputs.niche] || {};
  const platforms = inputs.platforms || [];
  const sourceLists = [lib.global||[]];
  platforms.forEach(p => { if (lib[p]) sourceLists.push(lib[p]); });
  const combined = unique([].concat(...sourceLists));
  // limit suggestions to top 6 to keep captions clean
  return combined.slice(0, 6);
}

function generateStrategyOverview(inputs) {
  const pillars = NICHE_CONTENT_PILLARS[inputs.niche] || ["Value", "Story", "Community", "Promotion", "Trends"];
  const trendLine = inputs.trends?.length ? `Trends integrated: ${inputs.trends.join(' â€¢ ')}` : 'Trends integrated: User-specified when provided';
  const brandTone = inputs.brandProfile?.tone ? inputs.brandProfile.tone : 'Neutral';
  const audienceFocus = inputs.brandProfile?.audienceTag ? inputs.brandProfile.audienceTag : (inputs.targetAudience || 'General');
  const autoTrendsLine = inputs.autoTrends?.length ? `Auto trend suggestions: ${inputs.autoTrends.join(' â€¢ ')}` : null;
  const lines = [
    `Niche: ${inputs.nicheLabel}`,
    `Primary Platforms: ${inputs.platforms.map(p=>p.toUpperCase()).join(', ')}`,
    `Goals: ${inputs.goals.join(', ') || 'General Growth'}`,
    `Audience: ${audienceFocus}`,
    `Brand Tone: ${brandTone}`,
    `Style: ${inputs.contentStyle || 'Educational, Story-driven, Authentic'}`,
    `Content Pillars: ${pillars.join(' â€¢ ')}`,
    trendLine,
    autoTrendsLine,
    `Cadence: Optimized per platform and stage to maximize reach and retention`,
  ].filter(Boolean);
  return `<ul>${lines.map(l=>`<li>${l}</li>`).join('')}</ul>`;
}

function buildDailyPostingSlots(platforms, stage) {
  // Determine baseline frequency per platform per week
  const weeklyPlan = {};
  platforms.forEach(p => {
    const tpl = PLATFORM_TEMPLATES[p];
    if (!tpl) return;
    weeklyPlan[p] = tpl.frequencyByStage[stage] || 5;
  });

  // Distribute posts across 7 days
  const days = Array.from({ length: 7 }, () => []);
  Object.entries(weeklyPlan).forEach(([platform, freq]) => {
    for (let i=0;i<freq;i++) {
      const dayIndex = Math.floor(i * 7 / freq); // spread out
      days[dayIndex].push(platform);
    }
  });
  return days; // array of 7 arrays of platforms
}

function weightedPick(weightedArr) {
  const total = weightedArr.reduce((sum, i) => sum + i.ratio, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const item of weightedArr) {
    acc += item.ratio;
    if (r <= acc) return item.type;
  }
  return weightedArr[0].type;
}

function generateDescription(platform, type, pillar, hook, goalTag, trends) {
  const trendSuffix = trends && trends.length ? ` Incorporates trend: ${trends[0]}.` : '';
  const formats = {
    instagram: `${hook} Quick ${pillar.toLowerCase()} breakdown. Step-by-step inside. [${goalTag}]${trendSuffix}`,
    tiktok: `${hook} Watch till the end for the exact steps. ${pillar} made simple. [${goalTag}]${trendSuffix}`,
    youtube: `${hook} In this video, I walk through ${pillar.toLowerCase()} with a complete, practical framework so you can apply it today. [${goalTag}]${trendSuffix}`,
    twitter: `${hook} Thread: ${pillar} â€” actionable insights. [${goalTag}]${trendSuffix}`,
    linkedin: `${hook} Here's the framework I use for ${pillar.toLowerCase()}. Save this for your next project. [${goalTag}]${trendSuffix}`,
    facebook: `${hook} Here's exactly how to approach ${pillar.toLowerCase()} with simple steps. [${goalTag}]${trendSuffix}`,
  };
  return formats[platform] || `${hook} ${pillar}.${trendSuffix}`;
}

function generateHashtags(niche, pillar, platform, extra=[], brandProfile) {
  const base = [niche, pillar, 'content', 'tips', 'guide', 'howto', 'viral', 'growth'];
  const brandTags = brandProfile?.tone === 'eco' ? ['sustainable','ecofriendly']
    : brandProfile?.tone === 'luxury' ? ['luxury','premium']
    : brandProfile?.tone === 'professional' ? ['b2b','strategy']
    : [];
  const trendTags = (extra||[]).map(t => t.startsWith('#') ? t : `#${slugify(t)}`);
  const pf = (platform === 'twitter' || platform === 'linkedin') ? [] : [...base.map(s => `#${slugify(s)}`), ...brandTags.map(s=>`#${slugify(s)}`), ...trendTags];
  return pf.slice(0, 10).join(' ');
}

function generateHookVariants(tplHooks, niche, pillar, trends, goals, brandProfile) {
  const proTemplates = [
    `${pillar}: a practical framework that works`,
    `How to improve ${pillar.toLowerCase()} with proven steps`,
    `${pillar} playbook for consistent results`,
  ];
  const playfulTemplates = [
    `Steal my ${pillar} framework (save this)`,
    `${pillar} made simple â€” step-by-step`,
    `From zero to ${pillar} pro: do this`,
  ];
  const luxuryTemplates = [
    `${pillar} refined: a minimal, high-impact approach`,
    `The premium guide to ${pillar.toLowerCase()}`,
  ];
  const ecoTemplates = [
    `${pillar} with a sustainable twist`,
    `Eco-friendly ${pillar.toLowerCase()} framework`,
  ];
  const edgyTemplates = [
    `${pillar} myths, busted`,
    `Unpopular opinion: you're doing ${pillar.toLowerCase()} wrong`,
  ];
  let pool = playfulTemplates;
  switch(brandProfile?.tone){
    case 'professional': pool = proTemplates; break;
    case 'luxury': pool = luxuryTemplates; break;
    case 'eco': pool = ecoTemplates; break;
    case 'edgy': pool = edgyTemplates; break;
    default: pool = playfulTemplates; break;
  }
  const a = randomPick(tplHooks);
  const b = randomPick(pool);
  const trend = trends && trends.length ? trends[Math.floor(Math.random()*trends.length)] : null;
  return { a: trend ? `${a} â€¢ Using ${trend}` : a, b };
}

function generateCaption(platform, type, pillar, hook, goalTag, length, variantLabel, trends, brandProfile) {
  const trendNote = trends && trends.length ? ` Using ${trends[0]} for reach.` : '';
  const defaultMap = {
    Reach: 'Follow for more like this',
    Engagement: 'What would you add? Comment below',
    Conversion: 'DM me â€œGUIDEâ€ for the checklist',
    Brand: 'Save and share this with a friend',
  };
  const toneMaps = {
    professional: {
      Reach: 'Follow for weekly insights',
      Engagement: 'What would you add? Comment below',
      Conversion: 'Book a call or DM â€œDEMOâ€ for details',
      Brand: 'Share with your team',
    },
    luxury: {
      Reach: 'Discover more refined strategies',
      Engagement: 'Which detail stood out? Comment below',
      Conversion: 'Join the waitlist or inquire via DM',
      Brand: 'Save this for your next campaign',
    },
    eco: {
      Reach: 'Follow for sustainable growth tips',
      Engagement: 'How would you make this greener?',
      Conversion: 'DM â€œECOâ€ for the checklist',
      Brand: 'Share to inspire sustainable choices',
    },
    playful: {
      Reach: 'Follow for daily tips âœ¨',
      Engagement: 'Drop your take â¬‡ï¸',
      Conversion: 'DM â€œGUIDEâ€ and Iâ€™ll send it ðŸ¤',
      Brand: 'Save + share with a friend ðŸ’¾',
    },
    edgy: {
      Reach: 'Follow if you want the real playbook',
      Engagement: 'Agree or disagree? Sound off',
      Conversion: 'DM â€œPLAYBOOKâ€ for the template',
      Brand: 'Save this before it gets deleted',
    }
  };
  const toneMap = toneMaps[brandProfile?.tone] || defaultMap;
  const bodyShort = `${hook} ${pillar} in ${type.toLowerCase()} format.${trendNote}`;
  const bodyMedium = `${hook} Hereâ€™s a quick ${pillar.toLowerCase()} framework you can apply today: 1) Do this 2) Avoid that 3) Save for later.${trendNote}`;
  const bodyLong = `${hook} In this ${type.toLowerCase()}, I break down ${pillar.toLowerCase()} with practical steps, mistakes to avoid, and a simple template you can copy. Bookmark this so you can execute today and track your progress over the next week.${trendNote}`;
  const pick = length === 'short' ? bodyShort : length === 'long' ? bodyLong : bodyMedium;
  return `${pick} ${toneMap[goalTag] || defaultMap[goalTag] || ''}`.trim();
}

function generatePostIdea(niche, platform, goals, options) {
  const tpl = PLATFORM_TEMPLATES[platform];
  const pillars = NICHE_CONTENT_PILLARS[niche] || ["Value", "Story", "Community", "Promotion", "Trends"];
  const mix = tpl.contentMix;
  const type = weightedPick(mix);
  const pillar = randomPick(pillars);

  const goalTag = goals.includes('sales') ? 'Conversion' : goals.includes('engagement') ? 'Engagement' : goals.includes('followers') ? 'Reach' : 'Brand';
  const hooks = options.abHooks ? generateHookVariants(tpl.hooks, niche, pillar, options.trends, goals, options.brandProfile) : { a: randomPick(tpl.hooks), b: null };

  const bestTime = randomPick(tpl.bestTimes);
  const hashtags = generateHashtags(niche, pillar, platform, options.trends, options.brandProfile);

  const descriptionA = generateDescription(platform, type, pillar, hooks.a, goalTag, options.trends);
  const captionA = generateCaption(platform, type, pillar, hooks.a, goalTag, options.captionLength, 'A', options.trends, options.brandProfile);

  let descriptionB = null, captionB = null;
  if (options.abHooks && hooks.b) {
    descriptionB = generateDescription(platform, type, pillar, hooks.b, goalTag, options.trends);
    captionB = generateCaption(platform, type, pillar, hooks.b, goalTag, options.captionLength, 'B', options.trends, options.brandProfile);
  }

  return {
    platform,
    type,
    pillar,
    goalTag,
    bestTime,
    hashtags,
    // A/B hooks and captions
    hookA: hooks.a,
    captionA,
    descriptionA,
    hookB: hooks.b,
    captionB,
    descriptionB,
    trendsUsed: options.trends || [],
  };
}

function createPlan(inputs) {
  const weeks = Math.ceil(inputs.duration / 7);
  state.totalWeeks = weeks;
  const stage = stageFromFollowers(inputs.currentFollowers);

  // Branding + trend enrichment
  const brandProfile = analyzeBranding(inputs);
  const autoTrends = suggestTrends(inputs);
  const trendsCombined = unique([...(inputs.trends||[]), ...autoTrends]);
  const enrichedInputs = { ...inputs, brandProfile, trends: trendsCombined, autoTrends };

  const weeklySlots = buildDailyPostingSlots(enrichedInputs.platforms, stage);
  const calendar = [];
  let dayCounter = 1;

  for (let w=0; w<weeks; w++) {
    const week = [];
    for (let d=0; d<7; d++) {
      const platformsForDay = weeklySlots[d] || [];
      const ideas = platformsForDay.map(p => generatePostIdea(enrichedInputs.niche, p, enrichedInputs.goals, {
        trends: enrichedInputs.trends,
        captionLength: enrichedInputs.captionLength,
        abHooks: enrichedInputs.abHooks,
        brandProfile,
      }));
      week.push({ dayNumber: dayCounter, weekday: WEEK_DAYS[d], ideas });
      dayCounter++;
    }
    calendar.push(week);
  }

  // Strategy overview
  const strategyHTML = generateStrategyOverview(enrichedInputs);

  state.plan = { inputs: enrichedInputs, calendar, strategyHTML };
}

function renderPlan() {
  if (!state.plan) return;
  const { calendar, strategyHTML } = state.plan;
  const weekIndex = state.currentWeekIndex;
  $("currentWeek").textContent = `Week ${weekIndex + 1}`;

  // Overview
  $("strategyOverview").innerHTML = strategyHTML;

  // Calendar grid
  const grid = $("calendarGrid");
  grid.innerHTML = '';
  const week = calendar[weekIndex] || [];
  week.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'day-card';
    const header = `<div class=\"day-header\"><span>${day.weekday}</span><span>Day ${day.dayNumber}</span></div>`;
    const items = day.ideas.map(idea => `<span class=\"content-pill\"><span class=\"platform\">${idea.platform.toUpperCase()}</span>${idea.type} â€¢ ${idea.pillar}</span>`).join('');
    dayEl.innerHTML = header + items;
    dayEl.addEventListener('click', () => showDayDetails(day));
    grid.appendChild(dayEl);
  });

  // Details default to the first day
  showDayDetails(week[0]);
  // Update trending sidebar
  renderTrendingSidebar();
}

// Render trending topics sidebar for the selected niche/platforms
function renderTrendingSidebar() {
  const list = $("trendingList");
  if (!list || !state.plan) return;
  const inputs = state.plan.inputs || {};
  const nicheKey = inputs.niche;
  const lib = TREND_LIBRARY[nicheKey] || {};
  const global = lib.global || [];
  const plat = (inputs.platforms || []).flatMap(p => lib[p] || []);
  const auto = inputs.autoTrends || [];
  const manual = inputs.trends || [];
  const topics = unique([...auto, ...global, ...plat, ...manual]).filter(Boolean).slice(0, 18);
  if (!topics.length) {
    list.innerHTML = '<li><em>No trending topics available.</em></li>';
    return;
  }
  list.innerHTML = topics.map(t => `<li><span class="trend-pill">${t}</span></li>`).join('');
}

function showDayDetails(day) {
  const container = $("contentDetails");
  container.innerHTML = day.ideas.map((idea) => {
    const abBlock = idea.hookB ? `
      <div class=\"content-item\">\n        <h4>Variant B: ${idea.hookB}</h4>\n        <div class=\"meta\">Caption B</div>\n        <p>${idea.captionB}</p>\n        ${idea.descriptionB ? `<p>${idea.descriptionB}</p>` : ''}\n        ${idea.scriptB ? `<div class=\"meta\">Creator Script B</div><p>${idea.scriptB.replace(/\n/g,'<br/>')}</p>` : ''}\n      </div>` : '';

    return `<div class=\"content-item\">\n      <h4>${idea.hookA}</h4>\n      <div class=\"meta\">Platform: ${idea.platform.toUpperCase()} â€¢ Best Time: ${idea.bestTime} â€¢ Goal: ${idea.goalTag} â€¢ Pillar: ${idea.pillar}</div>\n      <p>${idea.captionA}</p>\n      <p>${idea.descriptionA}</p>\n      ${idea.hashtags ? `<p>${idea.hashtags}</p>` : ''}\n      ${idea.trendsUsed?.length ? `<p><strong>Trends:</strong> ${idea.trendsUsed.join(' â€¢ ')}</p>` : ''}\n    </div>${abBlock}`;
  }).join('');

  // Inject a simple day script preview into the legend area
  const legendScript = $("legendScript");
  if (legendScript) {
    const preview = day.ideas.map(idea => {
      const parts = [];
      if (idea.scriptA) {
        parts.push(`<div class=\"preview-block\"><div class=\"meta\">Script A (${idea.platform.toUpperCase()} â€¢ ${idea.type})</div><p>${idea.scriptA.replace(/\n/g,'<br/>')}</p></div>`);
      }
      if (idea.scriptB) {
        parts.push(`<div class=\"preview-block\"><div class=\"meta\">Script B (${idea.platform.toUpperCase()} â€¢ ${idea.type})</div><p>${idea.scriptB.replace(/\n/g,'<br/>')}</p></div>`);
      }
      return parts.join('');
    }).join('');
    legendScript.innerHTML = preview || '<em>No script for this day.</em>';
  }
}

function previousWeek() {
  if (!state.plan) return;
  state.currentWeekIndex = Math.max(0, state.currentWeekIndex - 1);
  renderPlan();
}

function csvEscape(value) {
  if (value == null) return '';
  const v = String(value);
  if (/[",\n]/.test(v)) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

function exportCSV() {
  if (!state.plan) return;
  const rows = [];
  const header = [
    'Week','Day Number','Weekday','Platform','Type','Pillar','Best Time','Goal','Hook A','Caption A','Hook B','Caption B','Hashtags','Trends'
  ];
  rows.push(header.join(','));

  state.plan.calendar.forEach((week, wIdx) => {
    week.forEach(day => {
      day.ideas.forEach(idea => {
        const row = [
          `Week ${wIdx+1}`,
          day.dayNumber,
          day.weekday,
          idea.platform.toUpperCase(),
          idea.type,
          idea.pillar,
          idea.bestTime,
          idea.goalTag,
          idea.hookA || '',
          idea.captionA || '',
          idea.hookB || '',
          idea.captionB || '',
          idea.hashtags || '',
          (idea.trendsUsed||[]).join(' | '),
        ].map(csvEscape);
        rows.push(row.join(','));
      });
    });
  });

  const csv = rows.join('\n');
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  const defaultName = `content-plan-${ts}.csv`;
  saveWithDialog(defaultName, csv, 'CSV');
}


function exportHTML() {
  if (!state.plan) return;
  const { inputs, calendar } = state.plan;

  const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  // Build Calendar Details rows
  const calendarRows = [];
  calendar.forEach((week, wIdx) => {
    week.forEach(day => {
      day.ideas.forEach(idea => {
        calendarRows.push(`
          <tr>
            <td>Week ${wIdx + 1}</td>
            <td>${day.dayNumber}</td>
            <td>${esc(day.weekday)}</td>
            <td>${esc((idea.platform || '').toUpperCase())}</td>
            <td>${esc(idea.type || '')}</td>
            <td>${esc(idea.pillar || '')}</td>
            <td>${esc(idea.bestTime || '')}</td>
            <td>${esc(idea.goalTag || '')}</td>
            <td>${[idea.hookA?`A: ${esc(idea.hookA)}`:'', idea.hookB?`B: ${esc(idea.hookB)}`:''].filter(Boolean).join('<br/>')}</td>
          </tr>`);
      });
    });
  });

  // Build Content Blocks rows
  const contentRows = [];
  calendar.forEach((week, wIdx) => {
    week.forEach(day => {
      day.ideas.forEach(idea => {
        const captions = [
          idea.captionA ? `A: ${esc(idea.captionA)}` : '',
          idea.captionB ? `B: ${esc(idea.captionB)}` : ''
        ].filter(Boolean).join('<br/>');
        const trends = (idea.trendsUsed || []).join(', ');
        const scripts = [
          idea.scriptA ? `A:<br/>${esc(idea.scriptA).replace(/\n/g,'<br/>')}` : '',
          idea.scriptB ? `B:<br/>${esc(idea.scriptB).replace(/\n/g,'<br/>')}` : ''
        ].filter(Boolean).join('<br/><br/>' );
        contentRows.push(`
          <tr>
            <td>
              <div class="row-meta"><span class="badge">Week ${wIdx+1}</span> <span class="badge">Day ${day.dayNumber} • ${esc(day.weekday)}</span> <span class="badge">${esc((idea.platform||'').toUpperCase())}</span> <span class="muted">${esc(idea.type||'')} • ${esc(idea.pillar||'')} • ${esc(idea.bestTime||'')}</span></div>
              ${captions || '<em>No caption</em>'}
            </td>
            <td>${esc(idea.hashtags || '')}</td>
            <td>${esc(trends || '')}</td>
            <td>${scripts || '<em>No script</em>'}</td>
          </tr>`);
      });
    });
  });

  const platforms = (inputs?.platforms || []).join(', ');
  const niche = inputs?.niche || '';
  const location = [inputs?.city, inputs?.state].filter(Boolean).join(', ');
  const goals = (inputs?.goals || []).join(', ');

  const style = `
    <style>
      @page { margin: 14mm; }
      :root { --ink:#0b0f17; --muted:#475569; --border:#e5e7eb; --accent:#111827; --card:#fafafa; }
      html, body { background: #fff; color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Helvetica Neue', sans-serif; }
      body { margin: 0; padding: 24px; }
      header { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px; }
      h1 { font-size: 22px; margin: 0; font-weight: 800; }
      h2 { font-size: 16px; margin: 18px 0 8px; color: var(--accent); }
      .meta { color: var(--muted); font-size: 12px; }
      .toolbar { position: sticky; top: 0; display:flex; gap:8px; margin-bottom: 12px; }
      .toolbar button { background: var(--ink); color:#fff; border:none; border-radius:6px; padding:8px 12px; cursor:pointer; }
      .toolbar button.secondary { background: #334155; }

      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      thead th { background: #f3f4f6; color: #111827; border:1px solid var(--border); font-size: 12px; padding: 8px; text-align:left; }
      tbody td { border:1px solid var(--border); font-size: 12px; padding: 8px; vertical-align: top; }
      tbody tr { break-inside: avoid; }
      .row-meta { margin-bottom: 6px; color: var(--muted); font-size: 11px; }
      .badge { display:inline-block; font-weight:600; font-size:10px; padding:2px 6px; border-radius:999px; border:1px solid #cbd5e1; background:#e2e8f0; color:#0f172a; margin-right: 6px; }
      .muted { color: var(--muted); }

      .no-print { display:block; margin-bottom:12px; }
      @media print {
        .no-print { display:none !important; }
        body { padding: 0; }
        thead { display: table-header-group; }
      }
    </style>
  `;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>AI-Generated Content Plan</title>
${style}
</head>
<body>
  <div class="no-print toolbar">
    <button onclick="window.print()"><span>Print</span></button>
    <button class="secondary" onclick="window.close()"><span>Close</span></button>
  </div>
  <header>
    <div>
      <h1>AI-Generated Content Plan</h1>
      <div class="meta">Generated: ${new Date().toLocaleString()}</div>
    </div>
    <div class="meta">
      ${niche ? `Niche: ${esc(niche)}<br/>` : ''}
      ${platforms ? `Platforms: ${esc(platforms)}<br/>` : ''}
      ${goals ? `Goals: ${esc(goals)}<br/>` : ''}
      ${location ? `Location: ${esc(location)}` : ''}
    </div>
  </header>

  <section>
    <h2>Calendar Details</h2>
    <table>
      <thead>
        <tr>
          <th style=\"width:70px;\">Week</th>
          <th style=\"width:60px;\">Day #</th>
          <th style=\"width:90px;\">Weekday</th>
          <th style=\"width:70px;\">Platform</th>
          <th style=\"width:100px;\">Type</th>
          <th style=\"width:120px;\">Pillar</th>
          <th style=\"width:100px;\">Best Time</th>
          <th style=\"width:90px;\">Goal</th>
          <th>Hook(s)</th>
        </tr>
      </thead>
      <tbody>
        ${calendarRows.join('')}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Content Blocks</h2>
    <table>
      <thead>
        <tr>
          <th>Caption(s)</th>
          <th style=\"width:200px;\">Hashtags</th>
          <th style=\"width:200px;\">Trends</th>
          <th style=\"width:320px;\">Script(s)</th>
        </tr>
      </thead>
      <tbody>
        ${contentRows.join('')}
      </tbody>
    </table>
  </section>

  <div class="no-print" style="margin-top:12px; color:#6b7280;">Tip: Use your browser’s Print dialog and choose “Save as PDF”.</div>
  <script>window.addEventListener('load', () => setTimeout(() => { try { window.print(); } catch(e){} }, 300));</script>
</body>
</html>`;

  try {
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      return;
    }
  } catch (e) {}

  // Fallback: download HTML
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click();
    setTimeout(() => { try { document.body.removeChild(a); } catch {}; URL.revokeObjectURL(url); }, 0);
  } catch (e) {
    alert('Unable to open Export HTML. Please allow pop-ups and try again.');
  }
}

function exportPDF() {
  if (!state.plan) return;
  // Reuse the formatted tables export and show the print dialog to Save as PDF
  return exportHTML();
}

// Open a full, print-friendly calendar view (then Save as PDF from the browser)
function openPrintCalendar() {
  if (!state.plan) return;
  const { inputs, calendar } = state.plan;
  const w = window.open('', '_blank');
  if (!w) { alert('Popup blocked. Please allow popups to print.'); return; }

  const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const style = `
    <style>
      @page { margin: 14mm; }
      :root { --bg:#0b0f17; --paper:#ffffff; --ink:#0b0f17; --muted:#667085; --border:#e5e7eb; --card:#f8fafc; --accent:#2563eb; }
      html, body { background: var(--paper); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Helvetica Neue', sans-serif; }
      body { margin: 0; padding: 24px; }
      header { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px; }
      h1 { font-size: 22px; margin: 0; font-weight: 800; }
      h2 { font-size: 16px; margin: 18px 0 8px; color: var(--accent); }
      .meta { color: var(--muted); font-size: 12px; }
      .toolbar { position: sticky; top: 0; display:flex; gap:8px; margin-bottom: 12px; }
      .toolbar button { background: var(--ink); color:#fff; border:none; border-radius:6px; padding:8px 12px; cursor:pointer; }
      .toolbar button.secondary { background: #334155; }

      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      thead th { background: #f3f4f6; color: #111827; border:1px solid var(--border); font-size: 12px; padding: 8px; text-align:left; }
      tbody td { border:1px solid var(--border); font-size: 12px; padding: 8px; vertical-align: top; }
      tbody tr { break-inside: avoid; }
      .row-meta { margin-bottom: 6px; color: var(--muted); font-size: 11px; }
      .badge { display:inline-block; font-weight:600; font-size:10px; padding:2px 6px; border-radius:999px; border:1px solid #cbd5e1; background:#e2e8f0; color:#0f172a; margin-right: 6px; }
      .muted { color: var(--muted); }

      .no-print { display:block; margin-bottom:12px; }
      @media print {
        .no-print { display:none !important; }
        body { padding: 0; }
        thead { display: table-header-group; }
      }
    </style>
  `;

  const platforms = (inputs?.platforms || []).join(', ');
  const niche = inputs?.niche || '';
  const location = [inputs?.city, inputs?.state].filter(Boolean).join(', ');
  const goals = (inputs?.goals || []).join(', ');

  const platformBadge = (p) => {
    const key = String(p || '').toLowerCase();
    const map = {
      instagram: { bg:'#fce7f3', bd:'#fbcfe8', fg:'#9d174d', label:'IG' },
      tiktok:    { bg:'#e0f2fe', bd:'#bae6fd', fg:'#075985', label:'TT' },
      youtube:   { bg:'#fee2e2', bd:'#fecaca', fg:'#991b1b', label:'YT' },
      facebook:  { bg:'#dbeafe', bd:'#bfdbfe', fg:'#1d4ed8', label:'FB' },
      twitter:   { bg:'#e2e8f0', bd:'#cbd5e1', fg:'#0f172a', label:'X' },
      linkedin:  { bg:'#dbeafe', bd:'#bfdbfe', fg:'#1d4ed8', label:'IN' }
    };
    const s = map[key] || { bg:'#e5e7eb', bd:'#d1d5db', fg:'#0b0f17', label:(p||'').slice(0,2).toUpperCase() };
    return `<span class="badge" style="background:${s.bg}; border-color:${s.bd}; color:${s.fg};">${s.label}</span>`;
  };

  const weekSections = calendar.map((week, wIdx) => {
    const headerRow = `<div class="dow">${weekdays.map(d => `<div class="cell">${esc(d)}</div>`).join('')}</div>`;
    const grid = `
      <div class="grid">
        ${week.map(day => `
          <div class="day">
            <div class="day-head">
              <div class="day-num">${day.dayNumber}</div>
              <div class="weekday">${esc(day.weekday)}</div>
            </div>
            <div class="ideas">
              ${day.ideas.map(idea => `
                <div class="idea">
                  <div class="row">
                    ${platformBadge(idea.platform)}
                    <span class="meta-line">${esc(idea.type || '')} &bull; ${esc(idea.pillar || '')} &bull; ${esc(idea.bestTime || '')}</span>
                  </div>
                  ${idea.hookA ? `<div class="hook">“${esc(idea.hookA)}”</div>` : ''}
                  ${idea.captionA ? `<div class="caption">${esc(idea.captionA)}</div>` : ''}
                  ${idea.hashtags ? `<div class="hashtags">${esc(idea.hashtags)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>`;
    return `
      <section class="week">
        <h2>Week ${wIdx + 1}</h2>
        ${headerRow}
        ${grid}
      </section>`;
  }).join('');

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Printable Content Calendar</title>
${style}
</head>
<body>
  <div class="no-print toolbar">
    <button onclick="window.print()"><span>Print</span></button>
    <button class="secondary" onclick="window.close()"><span>Close</span></button>
  </div>
  <header>
    <div>
      <h1>Content Calendar</h1>
      <div class="meta">Generated: ${new Date().toLocaleString()}</div>
    </div>
    <div class="meta">
      ${niche ? `Niche: ${niche}<br/>` : ''}
      ${platforms ? `Platforms: ${platforms}<br/>` : ''}
      ${goals ? `Goals: ${goals}<br/>` : ''}
      ${location ? `Location: ${location}` : ''}
    </div>
  </header>
  ${weekSections}
  <div class="no-print popup-help">If a new tab didn’t open: 1) Click the address bar pop-up icon to allow pop-ups, or 2) Use Export HTML (saves a file) then open it and print to PDF. <a href="https://support.google.com/chrome/answer/95472" target="_blank" rel="noopener">Learn how</a>.</div>
  <script>window.addEventListener('load', () => setTimeout(() => { try { window.print(); } catch(e){} }, 300));</script>
</body>
</html>`;

  // Try opening a new tab/window first
  try {
    const w = window.open('', '_blank');
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
      return;
    }
  } catch (e) {
    // continue to fallback
  }

  // Fallback 1: anchor download to new tab (often allowed by blockers on user gesture)
  try {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    return;
  } catch (e) {
    // continue to iframe fallback
  }

  // Fallback 2: hidden iframe print (no popup)
  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('sandbox','allow-modals allow-same-origin');
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch {}
      setTimeout(() => { try { document.body.removeChild(iframe); } catch {} }, 1500);
    };
    return;
  } catch (e) {
    alert('Unable to open print view. Please enable pop-ups and try again.');
  }
}

function gatherInputs() {
  const nicheEl = $("niche");
  const niche = nicheEl ? nicheEl.value : '';
  const nicheLabel = (nicheEl && nicheEl.options) ? nicheEl.options[nicheEl.selectedIndex]?.text : niche;
  const platforms = Array.from(document.querySelectorAll('input[name="platforms"]:checked')).map(el => el.value);
  const goals = Array.from(document.querySelectorAll('input[name="goals"]:checked')).map(el => el.value);
  const currentFollowers = $("currentFollowers")?.value || '0-1k';
  const duration = parseInt($("planDuration")?.value || '7', 10) || 7;
  const targetAudience = $("targetAudience")?.value?.trim() || '';
  const city = ($("city")?.value || '').trim();
  const state = ($("state")?.value || '').trim();
  const contentStyle = $("contentStyle")?.value?.trim() || '';
  const trendsRaw = $("trends")?.value?.trim() || '';
  const trends = trendsRaw ? trendsRaw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean) : [];
  const captionLength = $("captionLength")?.value || 'medium';
  const abHooks = !!$("abHooks")?.checked;

  return { niche, nicheLabel, platforms, goals, currentFollowers, duration, targetAudience, city, state, contentStyle, trends, captionLength, abHooks };
}

function validateInputs(inputs) {
  const errors = [];
  if (!inputs.niche) errors.push('Please select a niche.');
  if (!inputs.platforms.length) errors.push('Select at least one platform.');
  if (!inputs.duration || inputs.duration < 7) errors.push('Plan duration must be at least 7 days.');
  return errors;
}

function handleGenerate(e) {
  e.preventDefault();
  const inputs = gatherInputs();
  const errors = validateInputs(inputs);
  if (errors.length) {
    alert(errors.join('\n'));
    return;
  }
  showLoading(true);
  setTimeout(() => {
    createPlan(inputs);
    state.currentWeekIndex = 0;
    renderPlan();
    const resultsEl = $("resultsSection");
    if (resultsEl) resultsEl.style.display = 'block';
    showLoading(false);
  }, 400);
}

function init() {
  const form = $("contentForm");
  if (form) {
    form.addEventListener('submit', handleGenerate);
  }
  // Sensible defaults so generation always has data
  const nicheEl = $("niche");
  if (nicheEl && !nicheEl.value) {
    // default to a popular niche to avoid validation stalls
    nicheEl.value = 'realestate';
  }
  const anyPlatformChecked = document.querySelector('input[name="platforms"]:checked');
  if (!anyPlatformChecked) {
    const insta = document.querySelector('input[name="platforms"][value="instagram"]');
    if (insta) insta.checked = true;
  }
}

window.addEventListener('DOMContentLoaded', init);


// Creator script generator
function generateCreatorScript(niche, platform, type, pillar, hook, goalTag, brandProfile){
  const tone = brandProfile?.tone || 'playful';
  const cta = randomPick((PLATFORM_TEMPLATES[platform]?.ctas)||["Follow for more","Save this","Share this"]);
  const beats = [];
  // Opening tied to hook
  beats.push(`Opening (0-3s): ${hook}`);
  // Middle beats depend on goal
  if (goalTag === 'Conversion') {
    beats.push(`Beat 1 (Value): Why ${pillar.toLowerCase()} matters right now`);
    beats.push(`Beat 2 (Steps): Do this next â†’ 1) 2) 3)`);
    beats.push(`Beat 3 (Proof): Quick example/result`);
  } else if (goalTag === 'Engagement') {
    beats.push(`Beat 1 (Relate): Common mistake in ${pillar.toLowerCase()}`);
    beats.push(`Beat 2 (Teach): The fix in 3 bullets`);
    beats.push(`Beat 3 (Prompt): Ask a question to spark comments`);
  } else if (goalTag === 'Reach') {
    beats.push(`Beat 1 (Pattern break): Unexpected angle on ${pillar.toLowerCase()}`);
    beats.push(`Beat 2 (Tease): Promise a quick win`);
    beats.push(`Beat 3 (Payoff): Show the outcome in 5s`);
  } else {
    beats.push(`Beat 1: Quick context on ${pillar.toLowerCase()}`);
    beats.push(`Beat 2: 3 key tips`);
    beats.push(`Beat 3: Summary in one sentence`);
  }
  // Real estate special shot ideas
  if (niche === 'realestate') {
    beats.push(`B-roll ideas: Front elevation â†’ Kitchen feature â†’ Backyard/amenities â†’ Map overlay`);
  }
  // Platform-tailored close
  const close = platform === 'tiktok' || platform === 'instagram'
    ? `CTA: ${cta} (add on-screen text + captions)`
    : platform === 'youtube'
      ? `CTA: ${cta} (end screen + description link)`
      : `CTA: ${cta}`;
  beats.push(close);
  // Tone tweak
  const prefix = tone === 'professional' ? '[Concise & data-backed] ' : tone === 'luxury' ? '[Minimal & refined] ' : tone === 'eco' ? '[Sustainable angle] ' : '';
  return prefix + beats.join('\n');
}

// Downloads tracking helpers
function addDownloadItem(filePath, label) {
  const panel = $("downloadsPanel");
  const list = $("downloadsList");
  if (!panel || !list) return;
  panel.style.display = 'block';
  const item = document.createElement('div');
  item.className = 'download-item';
  item.style.display = 'flex';
  item.style.alignItems = 'center';
  item.style.justifyContent = 'space-between';
  item.style.gap = '8px';
  item.innerHTML = `
    <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:60%;">
      <i class="fas fa-file"></i> ${label}
    </span>
    <span style="display:flex; gap:6px;">
      <button class="btn-secondary" data-action="reveal">Show in Folder</button>
      <button class="btn-secondary" data-action="open">Open</button>
    </span>`;
  item.querySelector('[data-action="reveal"]').addEventListener('click', async () => {
    try { await window.fileAPI?.revealItem?.(filePath); } catch {}
  });
  item.querySelector('[data-action="open"]').addEventListener('click', async () => {
    try { await window.fileAPI?.openPath?.(filePath); } catch {}
  });
  list.prepend(item);
}

async function saveWithDialog(defaultPath, content, mimeLabel) {
  const ext = (defaultPath.split('.').pop() || '').toLowerCase();
  const options = {
    title: 'Save ' + mimeLabel,
    defaultPath,
    filters: [{ name: mimeLabel, extensions: [ext] }]
  };

  // Primary path: Electron save dialog + filesystem write
  try {
    if (window.fileAPI?.showSaveDialog && window.fileAPI?.saveFile) {
      const res = await window.fileAPI.showSaveDialog(options);
      if (res.canceled || !res.filePath) return null;
      const data = typeof content === 'string' ? content : content;
      const encoding = typeof data === 'string' ? 'utf8' : undefined;
      const writeRes = await window.fileAPI.saveFile(res.filePath, data, encoding);
      if (!writeRes.success) {
        alert('Failed to save: ' + (writeRes.error || 'Unknown error'));
        return null;
      }
      addDownloadItem(res.filePath, res.filePath);
      return res.filePath;
    }
  } catch (e) {
    try { window.log && window.log('saveWithDialog electron path error: ' + e); } catch {}
    // fall through to browser fallback
  }

  // Fallback: Browser-style download (when running outside Electron or bridge unavailable)
  try {
    const mimeMap = {
      html: 'text/html;charset=utf-8',
      csv: 'text/csv;charset=utf-8',
      json: 'application/json;charset=utf-8',
      txt: 'text/plain;charset=utf-8'
    };
    const type = mimeMap[ext] || 'application/octet-stream';
    const data = typeof content === 'string' ? content : content;
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultPath;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    // We won't know the real OS path; show label as the file name
    addDownloadItem(defaultPath, defaultPath);
    return defaultPath;
  } catch (err) {
    alert('Failed to save (fallback): ' + (err?.message || err));
    return null;
  }
}



// PWA Install App button logic
(function(){
  let deferredPrompt = null;
  const installBtn = document.getElementById('installAppBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      installBtn.style.display = 'none';
      deferredPrompt = null;
      console.log('PWA install prompt outcome:', outcome);
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.style.display = 'none';
    deferredPrompt = null;
    console.log('PWA was installed');
  });
})();

function exportPDF() {
  if (!state.plan) return;
  // Reuse the formatted tables export and show the print dialog to Save as PDF
  return exportHTML();
}

// Open a full, print-friendly calendar view (then Save as PDF from the browser)
function openPrintCalendar() {
  if (!state.plan) return;
  const { inputs, calendar } = state.plan;
  const w = window.open('', '_blank');
  if (!w) { alert('Popup blocked. Please allow popups to print.'); return; }

  const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const style = `
    <style>
      @page { margin: 14mm; }
      :root { --bg:#0b0f17; --paper:#ffffff; --ink:#0b0f17; --muted:#667085; --border:#e5e7eb; --card:#f8fafc; --accent:#2563eb; }
      html, body { background: var(--paper); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, 'Helvetica Neue', sans-serif; }
      body { margin: 0; padding: 24px; }
      header { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px; }
      h1 { font-size: 22px; margin: 0; font-weight: 800; }
      h2 { font-size: 16px; margin: 18px 0 8px; color: var(--accent); }
      .meta { color: var(--muted); font-size: 12px; }
      .toolbar { position: sticky; top: 0; display:flex; gap:8px; margin-bottom: 12px; }
      .toolbar


