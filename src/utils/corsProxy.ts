// CORS Proxy utility for Firebase Storage images
export const getCORSProxyUrl = (originalUrl: string): string => {
  // Use a public CORS proxy service for development
  // For production, you should set up your own CORS proxy
  const corsProxyServices = [
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?'
  ];
  
  // Use the first proxy service
  return `${corsProxyServices[2]}${encodeURIComponent(originalUrl)}`;
};

// Alternative: Convert Firebase Storage URL to a CORS-friendly format
export const getFirebaseImageAsCORS = (firebaseUrl: string): string => {
  try {
    // Extract the file path from Firebase Storage URL
    const url = new URL(firebaseUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (pathMatch) {
      const filePath = decodeURIComponent(pathMatch[1]);
      // Use Firebase's direct download URL format which sometimes works better
      return `https://firebasestorage.googleapis.com/v0/b/balagh-adbc4.firebasestorage.app/o/${encodeURIComponent(filePath)}?alt=media`;
    }
    
    return firebaseUrl;
  } catch (error) {
    return firebaseUrl;
  }
}; 