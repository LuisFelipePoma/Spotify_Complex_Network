// Seed-based pseudo-random number generator (Mulberry32)
function mulberry32(seed) {
    return function () {
        let t = seed + 0x6d2b79f5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
// Combina los valores H, S y B para obtener un color en hexadecimal
const generateColorHex = (seed) => {
    const rand = mulberry32(seed);
    const hue = Math.floor(rand() * 360); // Genera un hue determinístico
    const saturation = 73;
    const brightness = 64;
    return `hsl(${hue}, ${saturation}%, ${brightness}%)`;
};
export { generateColorHex };
