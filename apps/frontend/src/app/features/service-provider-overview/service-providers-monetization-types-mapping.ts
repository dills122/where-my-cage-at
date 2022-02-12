export enum MonetizationTypes {
	FREE = 'free',
	ADS = 'ads',
	SUBSCRIPTION = 'flatrate',
	RENT = 'rent',
	BUY = 'buy'
}

export const mapToFriendlyVerbousName = (monetizationType: string) => {
	switch (monetizationType) {
		case 'free':
			return 'Free Streaming';
		case 'ads':
			return 'Streaming with Ads';
		case 'flatrate':
			return 'Streaming with Subscription';
		case 'rent':
			return 'Retnal';
		case 'buy':
			return 'Purchase';
		default:
			return '';
	}
};

export const mapToActionName = (monetizationType: string) => {
	switch (monetizationType) {
		case 'ads':
			return 'Stream Now (ads)';
		case 'free':
			return 'Stream Now Free';
		case 'flatrate':
			return 'Stream Now';
		case 'rent':
			return 'Rent Now';
		case 'buy':
			return 'Buy Now';
		default:
			return '';
	}
};
