const numbers = '0123456789'
const specialCharacters = '!@#$%^&*()_+~`|}{[]:;?<>/.,"';
const allChars = numbers + specialCharacters

function getRandomChar(): string {
    return allChars[Math.floor(Math.random() * allChars.length)]
}

function generateGroup(minLength: number = 3, maxLength: number = 6): string {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let group = '';
    for (let i = 0; i < length; i++) {
        group += getRandomChar();
    }
    return group;
}

export function generateCharacters(count: number): string {
    const groups: string[] = [];
    let totalLength = 0;

    while (groups.length < count) {
        const group = generateGroup();
        groups.push(group);
        totalLength += group.length + 1; // +1 for space
    }
    return groups.join(' ');
}

export function generateCharactersForTime(estimatedChars: number): string {
    const groups: string[] = [];
    let totalLength = 0;

    while (totalLength < estimatedChars) {
        const group = generateGroup();
        groups.push(group);
        totalLength += group.length + 1;
    }
    return groups.join(' ');
}