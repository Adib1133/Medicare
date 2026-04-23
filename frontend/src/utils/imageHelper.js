// Helper function to get doctor image URL
export const getDoctorImageUrl = (doctor) => {
  if (!doctor) return '👨‍⚕️';
  
  // If imageUrl exists (uploaded image), use it
  if (doctor.imageUrl) {
    // Check if it's a full URL or relative path
    if (doctor.imageUrl.startsWith('http')) {
      return doctor.imageUrl;
    }
    // Relative path - prepend backend URL
    return `${process.env.REACT_APP_API_URL?.replace('/api', '')}${doctor.imageUrl}`;
  }
  
  // Otherwise use the emoji/icon from image field
  return doctor.image || '👨‍⚕️';
};

// Helper component to display doctor image
export const DoctorImage = ({ doctor, size = 'medium', className = '' }) => {
  const imageUrl = getDoctorImageUrl(doctor);
  
  // Check if it's an emoji or actual image
  const isEmoji = imageUrl.length <= 5 || !imageUrl.includes('/');
  
  const sizeClasses = {
    small: 'text-3xl',
    medium: 'text-5xl',
    large: 'text-9xl'
  };
  
  if (isEmoji) {
    return <div className={`${sizeClasses[size]} ${className}`}>{imageUrl}</div>;
  }
  
  return (
    <img
      src={imageUrl}
      alt={doctor?.name || 'Doctor'}
      className={`${className} object-cover rounded-xl`}
      onError={(e) => {
        // Fallback to emoji if image fails to load
        e.target.style.display = 'none';
        e.target.parentElement.innerHTML = '👨‍⚕️';
        e.target.parentElement.className = `${sizeClasses[size]} ${className}`;
      }}
    />
  );
};
