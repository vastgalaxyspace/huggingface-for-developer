import { Heart } from 'lucide-react';

const FavoriteButton = ({ isFavorite, onToggle, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={onToggle}
      className={`${sizes[size]} rounded-full flex items-center justify-center transition-all ${
        isFavorite
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-2 border-red-500/50'
          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-red-400 border-2 border-white/20'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`${iconSizes[size]} transition-all ${
          isFavorite ? 'fill-current scale-110' : ''
        }`}
      />
    </button>
  );
};

export default FavoriteButton;