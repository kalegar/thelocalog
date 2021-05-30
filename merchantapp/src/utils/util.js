export const Utils = {
    clamp: (num, min, max) => {return Math.min(Math.max(num, min), max)},

    toBase64: file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    })
}