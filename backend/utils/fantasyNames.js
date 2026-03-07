const ADJECTIVES = [
  'Clumsy', 'Golden', 'Silent', 'Brave', 'Cunning', 'Fierce', 'Gentle', 'Hasty',
  'Jolly', 'Lofty', 'Mighty', 'Noble', 'Proud', 'Quick', 'Rusty', 'Sly',
  'Tiny', 'Vast', 'Wild', 'Zesty', 'Ancient', 'Blazing', 'Crispy', 'Daring',
  'Elegant', 'Fluffy', 'Grumpy', 'Hungry', 'Icy', 'Jazzy', 'Keen', 'Lazy',
  'Mystic', 'Nifty', 'Odd', 'Peppy', 'Quirky', 'Radiant', 'Sneaky', 'Tricky',
  'Upbeat', 'Vivid', 'Witty', 'Xenial', 'Yappy', 'Zealous',
]

const CREATURES = [
  'Dragon', 'Phoenix', 'Unicorn', 'Griffin', 'Sphinx', 'Kraken', 'Wyvern',
  'Basilisk', 'Chimera', 'Hydra', 'Manticore', 'Pegasus', 'Roc', 'Salamander',
  'Yeti', 'Golem', 'Djinn', 'Banshee', 'Cerberus', 'Minotaur',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateFantasyName() {
  const adj1 = pick(ADJECTIVES)
  let adj2 = pick(ADJECTIVES)
  while (adj2 === adj1) adj2 = pick(ADJECTIVES)
  return `${adj1}${adj2}${pick(CREATURES)}`
}
