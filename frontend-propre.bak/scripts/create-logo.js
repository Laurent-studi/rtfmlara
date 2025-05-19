const fs = require('fs');
const path = require('path');

// Assurez-vous que le répertoire existe
const imgDir = path.join(__dirname, '../public/img');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

// Logo simple en SVG (base64 encoded)
const svgLogo = `
<svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="80" height="80" rx="8" fill="url(#gradient)" />
  <text x="40" y="48" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle">RTF</text>
  <defs>
    <linearGradient id="gradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
      <stop stop-color="#4F46E5" />
      <stop offset="1" stop-color="#7C3AED" />
    </linearGradient>
  </defs>
</svg>
`;

// Convertir en base64
const svgBuffer = Buffer.from(svgLogo);
const base64Logo = svgBuffer.toString('base64');

// Écrire dans un fichier PNG
const logoPath = path.join(imgDir, 'logo4.png');
if (!fs.existsSync(logoPath)) {
  console.log('Création du logo4.png...');
  
  // Dans un vrai environnement, vous convertiriez SVG -> PNG
  // Ici, nous allons juste créer un fichier texte pour simuler
  fs.writeFileSync(logoPath, base64Logo);
  console.log(`Logo créé à ${logoPath}`);
} else {
  console.log('Le logo existe déjà.');
}

console.log('Terminé!'); 