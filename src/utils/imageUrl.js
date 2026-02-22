/**
 * Get the full image URL with the correct base URL and port
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=Product+Image';
    
    // If it already starts with http, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Get the API URL from environment to determine correct port
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    
    // Extract just the base URL (without /api)
    const baseUrl = apiUrl.replace('/api', '');
    
    return `${baseUrl}${imagePath}`;
};

export const getUploadBaseUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
    return apiUrl.replace('/api', '');
};
