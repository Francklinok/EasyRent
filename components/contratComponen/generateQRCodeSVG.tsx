

const generateQRCodeSVG = (data: string) => {
    // Simuler un QR code avec un SVG basique
    // Dans une véritable implémentation, vous utiliseriez une bibliothèque dédiée
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
        <rect x="10" y="10" width="80" height="80" fill="#000000" />
        <rect x="20" y="20" width="60" height="60" fill="#ffffff" />
        <rect x="30" y="30" width="40" height="40" fill="#000000" />
        <rect x="40" y="40" width="20" height="20" fill="#ffffff" />
        <text x="10" y="95" font-size="3" fill="#000000">SCAN: ${data}</text>
      </svg>
    `;
  };
export default generateQRCodeSVG;