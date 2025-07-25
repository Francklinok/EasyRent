export const MapView = ({ children, ...props }) => (
  <div style={{ 
    width: '100%', 
    height: 300, 
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <p>🗺️ Carte non disponible sur le web</p>
    {children}
  </div>
);

export const Marker = ({ children }) => <div>{children}</div>;
export default MapView;