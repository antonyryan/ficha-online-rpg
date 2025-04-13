// type Target = "self" | "enemy" | "allies" | "enemies";

export type Effect = {
  type: "static";
  value: number;
} | {
  type: "range";
  value: { min: number; max: number };
}

// type Skill = {
//   name: string;
//   hpCost: number;
//   spCost: number;
//   cooldown: number;

//   hpDamage: Effect;
//   hpHeal: Effect;

//   curse: Effect[];
//   // bless: Effect[];
// }


// const drakarSkills: Skill[] = [
//   {
//     name: "Dragon breath",
//     hpCost: 0,
//     spCost: 3,
//     cooldown: 2,

//     hpDamage: {
//       type: "range",
//       value: {
//         min: 1,
//         max: 8,
//       },
//     },
//     hpHeal: {
//       type: "static",
//       value: 10,
//     },

//     curse: [
//       {
//         type: 'static',
//         value: 2
//       },
//     ],
//   },
// ];

const statusEffectTypes = ["damage", "heal", "stun", "buff"] as const;

const eff = {
  damage: "damage",
  heal: "heal",
  stun: "stun",
  buff: "buff",
} as const;

type StatusEffectType = keyof typeof eff;


// A melhor abordagem para programar os status negativos (efeitos) das skills no seu RPG tático é tratá-los como buffs/debuffs que afetam o personagem ao longo do tempo. Você pode fazer isso armazenando os efeitos em um array dentro do próprio personagem, com duração e intensidade.

// 🔹 Estrutura para Status Effects
// Sugiro criar uma nova estrutura para os efeitos de status e adicioná-la à sua tipagem Skill. Algo como:

// typescript
// Copiar
// Editar
type StatusEffect = {
  name: string;       // Nome do efeito (ex: "burn", "bleed", "stun")
  duration: number;   // Quantos turnos o efeito dura
  effectType: StatusEffectType; // Tipo do efeito
  value: number;      // Intensidade do efeito (ex: -2 HP por turno)
};
// Agora, você pode adicionar esse tipo dentro da estrutura da Skill, em um campo statusEffects:

// typescript
// Copiar
// Editar
type Skill = {
  name: string;
  hpCost: number;
  spCost: number;
  cooldown: number;

  hpDamage?: Effect;
  hpHeal?: Effect;

  curse?: Effect[];
  statusEffects?: StatusEffect[]; // Aqui armazenamos os efeitos que a skill pode aplicar
};
// 🔹 Exemplo de uma Skill com Efeito de Status
// Agora, uma skill pode causar queimadura (burn), que aplica dano ao longo do tempo:

// typescript
// Copiar
// Editar
const drakarSkills: Skill[] = [
  {
    name: "Dragon breath",
    hpCost: 0,
    spCost: 3,
    cooldown: 2,

    hpDamage: {
      type: "range",
      value: { min: 1, max: 8 },
    },
    hpHeal: {
      type: "static",
      value: 10,
    },

    curse: [{ type: 'static', value: 2 }],

    statusEffects: [
      {
        name: "burn",
        duration: 3, // Dura 3 turnos
        effectType: "damage",
        value: 2, // Perde 2 HP por turno
      }
    ]
  },
];
// 🔹 Como Aplicar os Status nos Personagens
// No seu sistema de combate, quando um personagem é atingido, basta adicionar os efeitos na lista de status dele:

// typescript
// Copiar
// Editar
type Character = {
  name: string;
  hp: number;
  sp: number;
  activeEffects: StatusEffect[]; // Aqui ficam os efeitos ativos
};

function applySkill(target: Character, skill: Skill) {
  // Aplica dano
  if (skill.hpDamage) {
    const damage = skill.hpDamage.type === "static" ? skill.hpDamage.value : 
                   Math.floor(Math.random() * (skill.hpDamage.value.max - skill.hpDamage.value.min + 1)) + skill.hpDamage.value.min;
    target.hp -= damage;
  }

  // Aplica efeitos de status
  if (skill.statusEffects) {
    target.activeEffects.push(...skill.statusEffects);
  }
}
// 🔹 Como Processar os Efeitos a Cada Turno
// Em cada turno, basta iterar pelos personagens e aplicar os efeitos de status ativos:

// typescript
// Copiar
// Editar
function processStatusEffects(character: Character) {
  character.activeEffects = character.activeEffects.map(effect => {
    if (effect.effectType === "damage") {
      character.hp -= effect.value;
    }
    
    // Reduz duração do efeito
    return { ...effect, duration: effect.duration - 1 };
  }).filter(effect => effect.duration > 0); // Remove efeitos expirados
}