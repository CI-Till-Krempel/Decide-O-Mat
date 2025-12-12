const animals = [
    "Alpaca", "Ant", "Anteater", "Antelope", "Armadillo", "Badger", "Bat", "Bear", "Beaver", "Bee",
    "Beetle", "Bird", "Bison", "Butterfly", "Camel", "Capybara", "Cat", "Chameleon", "Cheetah",
    "Chicken", "Chimpanzee", "Chinchilla", "Cobra", "Cow", "Crab", "Crocodile", "Crow", "Deer",
    "Dog", "Dolphin", "Donkey", "Duck", "Eagle", "Elephant", "Elk", "Emu", "Falcon", "Ferret",
    "Fish", "Flamingo", "Fox", "Frog", "Gazelle", "Gecko", "Giraffe", "Goat", "Goose", "Gorilla",
    "Grasshopper", "Guinea Pig", "Hamster", "Hawk", "Hedgehog", "Hippo", "Horse", "Hyena", "Iguana",
    "Impala", "Jaguar", "Jellyfish", "Kangaroo", "Koala", "Komodo Dragon", "Lemur", "Leopard",
    "Lion", "Lizard", "Llama", "Lobster", "Lynx", "Manatee", "Mantis", "Meerkat", "Mole", "Monkey",
    "Moose", "Mouse", "Narwhal", "Newt", "Octopus", "Ostrich", "Otter", "Owl", "Oyster", "Panther",
    "Parrot", "Peacock", "Pelican", "Penguin", "Pig", "Pigeon", "Platypus", "Polar Bear", "Porcupine",
    "Possum", "Pug", "Puffin", "Puma", "Quail", "Rabbit", "Raccoon", "Ram", "Rat", "Raven", "Reindeer",
    "Rhino", "Salamander", "Salmon", "Scorpion", "Seahorse", "Seal", "Shark", "Sheep", "Shrimp",
    "Skunk", "Sloth", "Snail", "Snake", "Spider", "Squid", "Squirrel", "Starfish", "Stork", "Swan",
    "Tapir", "Tiger", "Toad", "Tortoise", "Toucan", "Turkey", "Turtle", "Viper", "Vulture", "Walrus",
    "Wasp", "Weasel", "Whale", "Wolf", "Wombat", "Woodpecker", "Worm", "Yak", "Zebra"
];

const NameGenerator = {
    generate: () => {
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
        return `Anonymous ${randomAnimal}`;
    },

    isGenerated: (name) => {
        return name && name.startsWith("Anonymous ") && animals.includes(name.replace("Anonymous ", ""));
    }
};

export default NameGenerator;
