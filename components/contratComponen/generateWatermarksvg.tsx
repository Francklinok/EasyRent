  const generateWatermarkSVG = () => {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500" opacity="0.04">
        <text transform="rotate(-45 250 250)" x="0" y="250" fill="#000000" font-size="30" font-family="Arial, sans-serif">CONTRAT OFFICIEL • ${contractId} • CONTRAT OFFICIEL</text>
      </svg>
    `;
  };

  export default generateWatermarkSVG;
