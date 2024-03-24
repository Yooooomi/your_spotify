let keys = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"]
export function getKey(key: number) {
    if (key === -1) {
        return null;
    }
    return keys[key];
}