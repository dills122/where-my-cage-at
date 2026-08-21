import { ImageLoader, ImageLoaderConfig } from '@angular/common';

const imageBaseUrl = 'https://image.tmdb.org/t/p';
const supportedPosterWidths = [92, 154, 185, 342, 500, 780] as const;

const normalizePosterPath = (posterPath: string) =>
	posterPath.startsWith('/') ? posterPath : `/${posterPath}`;

export const buildPosterImageUrl = (posterPath: string, requestedWidth = 342): string => {
	if (/^https?:\/\//i.test(posterPath) || posterPath.startsWith('/assets/')) {
		return posterPath;
	}

	const size = supportedPosterWidths.find(width => width >= requestedWidth) ?? 'original';
	const sizePath = typeof size === 'number' ? `w${size}` : size;
	return `${imageBaseUrl}/${sizePath}${normalizePosterPath(posterPath)}`;
};

export const tmdbPosterImageLoader: ImageLoader = ({ src, width }: ImageLoaderConfig) =>
	buildPosterImageUrl(src, width);
