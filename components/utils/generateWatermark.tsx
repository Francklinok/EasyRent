const generateWatermark = (contractId:string) :string => {
    return `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="50%" 
          font-size="30" 
          font-weight="bold" 
          fill="rgba(0, 0, 0, 0.1)" 
          text-anchor="middle" 
          dominant-baseline="middle"
          transform="rotate(-30, 50%, 50%)">
          ${contractId}
        </text>
      </svg>
    `;
  };
  export default generateWatermark;